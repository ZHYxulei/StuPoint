<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Services\ExchangeService;
use App\Services\VerificationCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function __construct(
        private ExchangeService $exchangeService,
        private VerificationCodeService $verificationCodeService
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

        $order = Order::with(['product.category', 'verifiedBy'])
            ->where('user_id', $user->id)
            ->findOrFail($id);

        // Get verification code from Redis
        $verificationCode = $this->verificationCodeService->get($order->order_no);
        $ttl = $this->verificationCodeService->getTTL($order->order_no);
        $isExpired = ! $this->verificationCodeService->exists($order->order_no);

        return inertia('shop/order-detail', [
            'order' => $order,
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => $ttl > 0 ? now()->addSeconds($ttl) : null,
            'verification_code_expired' => $isExpired,
        ]);
    }

    /**
     * Regenerate verification code.
     */
    public function regenerateVerificationCode(Request $request, string $id)
    {
        $user = Auth::user();

        $order = Order::where('user_id', $user->id)->findOrFail($id);

        // Check if order is already verified
        if ($order->verified_at) {
            return back()->with('error', '该订单已核销，无法重新生成验证码');
        }

        // Check if order is cancelled
        if ($order->status === 'cancelled') {
            return back()->with('error', '已取消的订单无法生成验证码');
        }

        // Check if order is completed
        if ($order->status === 'completed') {
            return back()->with('error', '已完成的订单无法生成验证码');
        }

        // Generate new verification code
        $newCode = sprintf('%06d', mt_rand(0, 999999));

        // Store in Redis with 24 hour expiry
        $this->verificationCodeService->regenerate($order->order_no, $newCode);

        return back()->with('success', '验证码已重新生成，有效期24小时');
    }
}
