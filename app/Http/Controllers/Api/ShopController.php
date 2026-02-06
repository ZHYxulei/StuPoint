<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ExchangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function __construct(
        private ExchangeService $exchangeService
    ) {}

    public function products(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'category' => 'nullable|integer|exists:product_categories,id',
            'search' => 'nullable|string',
        ]);

        $perPage = $request->input('per_page', 20);

        $query = Product::with('category')
            ->where('status', 'active')
            ->when($request->filled('category'), function ($q) use ($request) {
                $q->where('category_id', $request->input('category'));
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->input('search').'%');
            });

        $products = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'image' => $p->image,
                'points_required' => $p->points_required,
                'stock' => $p->stock,
                'category' => $p->category ? [
                    'id' => $p->category->id,
                    'name' => $p->category->name,
                ] : null,
            ]),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:10',
            'shipping_info' => 'required|array',
            'shipping_info.name' => 'required|string|max:255',
            'shipping_info.phone' => 'required|string|max:20',
            'shipping_info.address' => 'required|string|max:500',
        ]);

        try {
            $product = Product::findOrFail($request->product_id);

            $order = $this->exchangeService->exchange(
                $request->user(),
                $product,
                $request->shipping_info
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'order_no' => $order->order_no,
                    'points_spent' => $order->points_spent,
                    'status' => $order->status,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function orders(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);

        $orders = $request->user()
            ->orders()
            ->with('product')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->map(fn ($o) => [
                'id' => $o->id,
                'order_no' => $o->order_no,
                'product' => [
                    'id' => $o->product->id,
                    'name' => $o->product->name,
                    'image' => $o->product->image,
                ],
                'points_spent' => $o->points_spent,
                'status' => $o->status,
                'created_at' => $o->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }
}
