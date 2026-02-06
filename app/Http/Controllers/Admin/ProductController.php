<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display list of products for admin.
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%');
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category_id', $request->input('category'));
            })
            ->withCount('orders')
            ->latest()
            ->paginate(20);

        $categories = ProductCategory::orderBy('sort_order')->get();

        // Get statistics
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('status', 'active')->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
            'total_exchanges' => \App\Models\Order::count(),
        ];

        return inertia('admin/products/index', [
            'products' => $products,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category']),
        ]);
    }

    /**
     * Show product creation form.
     */
    public function create()
    {
        $categories = ProductCategory::orderBy('sort_order')->get();

        return inertia('admin/products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'points_required' => 'required|integer|min:0',
            'stock' => 'required|integer|min:-1',
            'category_id' => 'nullable|exists:product_categories,id',
            'is_third_party' => 'boolean',
            'status' => 'required|in:active,inactive,out_of_stock',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        Product::create($validated);

        return redirect()->route('admin.products.index')->with('success', '商品已创建');
    }

    /**
     * Show product edit form.
     */
    public function edit(string $id)
    {
        $product = Product::with('category')->findOrFail($id);
        $categories = ProductCategory::orderBy('sort_order')->get();

        return inertia('admin/products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update product.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'points_required' => 'required|integer|min:0',
            'stock' => 'required|integer|min:-1',
            'category_id' => 'nullable|exists:product_categories,id',
            'is_third_party' => 'boolean',
            'status' => 'required|in:active,inactive,out_of_stock',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return back()->with('success', '商品已更新');
    }

    /**
     * Delete product.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        // Check if product has active orders
        if ($product->orders()->where('status', '!=', 'cancelled')->exists()) {
            return back()->with('error', '该商品有未完成的订单，无法删除');
        }

        // Delete image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('admin.products.index')->with('success', '商品已删除');
    }

    /**
     * Get product statistics.
     */
    public function statistics(Request $request, string $id)
    {
        $product = Product::with('orders')->findOrFail($id);

        $stats = [
            'total_orders' => $product->orders()->count(),
            'completed_orders' => $product->orders()->where('status', 'completed')->count(),
            'pending_orders' => $product->orders()->where('status', 'pending')->count(),
            'total_points_spent' => $product->orders()->where('status', '!=', 'cancelled')->sum('points_spent'),
        ];

        return response()->json($stats);
    }
}
