<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\ExchangeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function __construct(
        private ExchangeService $exchangeService
    ) {}

    /**
     * Display user's orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $orders = Order::query()
            ->with('product.category')
            ->where('user_id', $user->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(15);

        return inertia('shop/orders', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Exchange a product.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'shipping_info' => 'required|array',
            'shipping_info.name' => 'required|string|max:255',
            'shipping_info.phone' => 'required|string|max:20',
            'shipping_info.address' => 'required|string|max:500',
        ]);

        $user = Auth::user();

        try {
            $order = $this->exchangeService->exchange(
                $user,
                Product::findOrFail($request->input('product_id')),
                $request->input('shipping_info')
            );

            return redirect()->route('shop.orders')
                ->with('success', "兑换成功！订单号：{$order->order_no}");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display order detail.
     */
    public function show(Request $request, string $id)
    {
        $user = Auth::user();

        $order = Order::with(['product.category', 'statusHistory.operator'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return inertia('shop/order-detail', [
            'order' => $order,
        ]);
    }
}
