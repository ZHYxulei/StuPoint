<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\ParentChild;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    public function index()
    {
        $children = auth()->user()
            ->childRelations()
            ->with('child.points')
            ->get()
            ->map(fn ($relation) => [
                'id' => $relation->child->id,
                'name' => $relation->child->name,
                'student_id' => $relation->child->student_id,
                'grade' => $relation->child->grade,
                'class' => $relation->child->class,
                'relationship' => $relation->relationship,
                'is_approved' => $relation->is_approved,
                'points' => [
                    'total_points' => $relation->child->points?->total_points ?? 0,
                    'redeemable_points' => $relation->child->points?->redeemable_points ?? 0,
                ],
            ]);

        return inertia('parent/children/index', [
            'children' => $children,
        ]);
    }

    public function create()
    {
        return inertia('parent/children/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'child_student_id' => 'required|string|exists:users,student_id',
            'relationship' => 'required|in:父亲,母亲,其他',
        ]);

        $child = User::where('student_id', $validated['child_student_id'])->firstOrFail();

        $existing = ParentChild::where('parent_id', auth()->id())
            ->where('child_id', $child->id)
            ->first();

        if ($existing) {
            return back()->with('error', '已经绑定了该学生');
        }

        ParentChild::create([
            'parent_id' => auth()->id(),
            'child_id' => $child->id,
            'relationship' => $validated['relationship'],
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        return redirect()->route('parent.children.index')->with('success', '子女绑定成功');
    }

    public function show(string $childId)
    {
        $relation = ParentChild::where('parent_id', auth()->id())
            ->where('child_id', $childId)
            ->approved()
            ->with('child.points')
            ->firstOrFail();

        $child = $relation->child;

        // Get points
        $points = $child->points ?? UserPoint::firstOrCreate(['user_id' => $child->id]);

        // Calculate ranks
        $totalRank = UserPoint::orderByDesc('total_points')
            ->where('total_points', '>', $points->total_points)
            ->count() + 1;

        // Get recent transactions
        $recentTransactions = PointTransaction::where('user_id', $child->id)
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        // Get recent orders
        $recentOrders = Order::where('user_id', $child->id)
            ->with('product')
            ->latest()
            ->take(5)
            ->get();

        return inertia('parent/children/show', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name,
                'student_id' => $child->student_id,
                'grade' => $child->grade,
                'class' => $child->class,
                'relationship' => $relation->relationship,
                'points' => [
                    'total_points' => $points->total_points,
                    'redeemable_points' => $points->redeemable_points,
                    'rank' => $totalRank,
                    'total_users' => UserPoint::count(),
                ],
                'recent_transactions' => $recentTransactions->map(fn ($t) => [
                    'id' => $t->id,
                    'type' => $t->type,
                    'amount' => $t->amount,
                    'description' => $t->description,
                    'created_at' => $t->created_at->toIso8601String(),
                ]),
                'recent_orders' => $recentOrders->map(fn ($o) => [
                    'id' => $o->id,
                    'order_no' => $o->order_no,
                    'product_name' => $o->product->name,
                    'points_spent' => $o->points_spent,
                    'status' => $o->status,
                    'created_at' => $o->created_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function destroy(string $childId)
    {
        $relation = ParentChild::where('parent_id', auth()->id())
            ->where('child_id', $childId)
            ->firstOrFail();

        $relation->delete();

        return back()->with('success', '已解除绑定');
    }

    public function transactions(string $childId, Request $request)
    {
        $relation = ParentChild::where('parent_id', auth()->id())
            ->where('child_id', $childId)
            ->approved()
            ->firstOrFail();

        $perPage = $request->input('per_page', 20);

        $transactions = PointTransaction::where('user_id', $childId)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return inertia('parent/children/transactions', [
            'child' => [
                'id' => $relation->child->id,
                'name' => $relation->child->name,
                'student_id' => $relation->child->student_id,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function orders(string $childId, Request $request)
    {
        $relation = ParentChild::where('parent_id', auth()->id())
            ->where('child_id', $childId)
            ->approved()
            ->firstOrFail();

        $perPage = $request->input('per_page', 20);

        $orders = Order::where('user_id', $childId)
            ->with('product')
            ->latest()
            ->paginate($perPage);

        return inertia('parent/children/orders', [
            'child' => [
                'id' => $relation->child->id,
                'name' => $relation->child->name,
                'student_id' => $relation->child->student_id,
            ],
            'orders' => $orders,
        ]);
    }
}
