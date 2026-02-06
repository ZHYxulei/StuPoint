<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display list of all orders.
     */
    public function index(Request $request)
    {
        $orders = Order::query()
            ->with(['product.category', 'user'])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('order_no', 'like', '%'.$request->input('search').'%');
            })
            ->when($request->filled('product'), function ($query) use ($request) {
                $query->where('product_id', $request->input('product'));
            })
            ->latest()
            ->paginate(20);

        // Get statistics
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'total_points_spent' => Order::where('status', '!=', 'cancelled')->sum('points_spent'),
        ];

        return inertia('admin/orders/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'product']),
        ]);
    }

    /**
     * Show order details.
     */
    public function show(string $id)
    {
        $order = Order::with(['product.category', 'user', 'statusHistory.operator'])->findOrFail($id);

        return inertia('admin/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled,failed',
            'note' => 'nullable|string|max:500',
        ]);

        $order->updateStatus(
            $validated['status'],
            $validated['note'] ?? null,
            $request->user()->id
        );

        return back()->with('success', '订单状态已更新');
    }

    /**
     * Get order statistics.
     */
    public function statistics()
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'processing_orders' => Order::where('status', 'processing')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_points_spent' => Order::where('status', '!=', 'cancelled')->sum('points_spent'),
            'top_products' => Order::select('product_id')
                ->selectRaw('product_id, COUNT(*) as order_count, SUM(points_spent) as total_points')
                ->with('product:id,name')
                ->where('status', '!=', 'cancelled')
                ->groupBy('product_id')
                ->orderByDesc('order_count')
                ->limit(10)
                ->get(),
            'recent_orders' => Order::with(['product:id,name', 'user:id,name'])
                ->latest()
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }
}
