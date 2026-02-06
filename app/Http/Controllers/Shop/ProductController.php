<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display product catalog (public).
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->where('status', 'active')
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('category_id', $request->input('category'));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%');
            })
            ->latest()
            ->paginate(12);

        $categories = ProductCategory::orderBy('sort_order')->get();

        return inertia('shop/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Display product detail (public).
     */
    public function show(Request $request, string $id)
    {
        $product = Product::with('category')->findOrFail($id);

        return inertia('shop/product', [
            'product' => $product,
        ]);
    }
}
