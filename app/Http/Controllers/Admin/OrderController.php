<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\VerificationCodeService;
use Illuminate\Http\Request;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(
        private VerificationCodeService $verificationCodeService
    ) {}

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
    public function show(Request $request, string $id)
    {
        $order = Order::with(['product.category', 'user', 'statusHistory.operator', 'verifiedBy'])->findOrFail($id);
        $isExpired = ! $this->verificationCodeService->exists($order->order_no);
        $canViewFullShippingDetails = $request->user()->hasRole('super_admin')
            || $request->user()->hasRole('admin');

        return inertia('admin/orders/show', [
            'order' => $this->orderPayload($order, $canViewFullShippingDetails),
            'verification_code_expired' => $isExpired,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function orderPayload(Order $order, bool $canViewFullShippingDetails): array
    {
        $shippingInfo = $order->shipping_info ?? [];

        return [
            'id' => $order->id,
            'order_no' => $order->order_no,
            'points_spent' => $order->points_spent,
            'status' => $order->status,
            'shipping_info' => [
                'name' => $shippingInfo['name'] ?? null,
                'phone' => $canViewFullShippingDetails
                    ? ($shippingInfo['phone'] ?? null)
                    : $this->maskPhone($shippingInfo['phone'] ?? null),
                'address' => $canViewFullShippingDetails
                    ? ($shippingInfo['address'] ?? null)
                    : $this->maskAddress($shippingInfo['address'] ?? null),
            ],
            'third_party_order_id' => $order->third_party_order_id,
            'verified_at' => $order->verified_at?->toIso8601String(),
            'verified_by' => $order->verified_by,
            'created_at' => $order->created_at?->toIso8601String(),
            'updated_at' => $order->updated_at?->toIso8601String(),
            'product' => [
                'id' => $order->product->id,
                'name' => $order->product->name,
                'category' => $order->product->category ? [
                    'id' => $order->product->category->id,
                    'name' => $order->product->category->name,
                ] : null,
            ],
            'user' => [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ],
            'verifiedBy' => $order->verifiedBy ? [
                'id' => $order->verifiedBy->id,
                'name' => $order->verifiedBy->name,
                'email' => $order->verifiedBy->email,
            ] : null,
            'statusHistory' => $order->statusHistory->map(fn ($history) => [
                'id' => $history->id,
                'from_status' => $history->from_status,
                'to_status' => $history->to_status,
                'note' => $history->note,
                'created_at' => $history->created_at?->toIso8601String(),
                'operator' => $history->operator ? [
                    'id' => $history->operator->id,
                    'name' => $history->operator->name,
                ] : null,
            ])->values(),
        ];
    }

    private function maskPhone(?string $phone): ?string
    {
        if ($phone === null || mb_strlen($phone) < 7) {
            return $phone;
        }

        return mb_substr($phone, 0, 3).'****'.mb_substr($phone, -4);
    }

    private function maskAddress(?string $address): ?string
    {
        if ($address === null || mb_strlen($address) <= 4) {
            return $address;
        }

        return mb_substr($address, 0, -4).'****';
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

        try {
            $order->updateStatus(
                $validated['status'],
                $validated['note'] ?? null,
                $request->user()->id
            );
        } catch (RuntimeException $exception) {
            return back()->with('error', $exception->getMessage());
        }

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
