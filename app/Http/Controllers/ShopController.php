<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Display the shop product listing.
     */
    public function index(Request $request)
    {
        $query = Product::with('category')->where('is_active', true);

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('description', 'like', '%'.$request->search.'%');
            });
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(12);
        $categories = ProductCategory::orderBy('name')->get();

        return inertia('shop/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Display a single product.
     */
    public function show(string $id)
    {
        $product = Product::with('category')->findOrFail($id);

        return inertia('shop/product', [
            'product' => $product,
        ]);
    }

    /**
     * Display the user's orders.
     */
    public function orders(Request $request)
    {
        $query = Order::with('product')
            ->where('user_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10);

        return inertia('shop/orders', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Display a single order.
     */
    public function orderDetail(string $id)
    {
        $order = Order::with(['product', 'statusHistory'])
            ->where('user_id', request()->user()->id)
            ->findOrFail($id);

        return inertia('shop/order-detail', [
            'order' => $order,
        ]);
    }
}
