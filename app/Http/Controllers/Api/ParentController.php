<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ParentChild;
use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use App\Services\ParentBindingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ParentController extends Controller
{
    public function __construct(
        private ParentBindingService $bindingService
    ) {}

    public function bindChild(Request $request): JsonResponse
    {
        Gate::authorize('bind-parent-child');

        $validated = $request->validate([
            'child_student_id' => 'required|string|exists:users,student_id',
            'invitation_code' => 'required|string',
            'relationship' => 'required|in:父亲,母亲,其他',
        ]);

        $this->bindingService->bindParent(
            $request->user(),
            $validated['child_student_id'],
            $validated['invitation_code'],
            $validated['relationship'],
        );

        return response()->json([
            'success' => true,
            'message' => '子女绑定成功',
        ]);
    }

    public function children(Request $request): JsonResponse
    {
        $children = $request->user()
            ->parentRelations()
            ->approved()
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

        return response()->json([
            'success' => true,
            'data' => $children,
        ]);
    }

    public function childPoints(Request $request, string $childId): JsonResponse
    {
        $relation = $this->getApprovedRelation($request->user()->id, $childId);

        $points = UserPoint::ensureForUser($relation->child);

        // Calculate rank
        $totalRank = UserPoint::orderByDesc('total_points')
            ->where('total_points', '>', $points->total_points)
            ->count() + 1;

        return response()->json([
            'success' => true,
            'data' => [
                'child' => [
                    'id' => $relation->child->id,
                    'name' => $relation->child->name,
                    'student_id' => $relation->child->student_id,
                ],
                'points' => [
                    'total_points' => $points->total_points,
                    'redeemable_points' => $points->redeemable_points,
                    'rank' => $totalRank,
                    'total_users' => UserPoint::count(),
                ],
            ],
        ]);
    }

    public function childRanking(Request $request, string $childId): JsonResponse
    {
        $relation = $this->getApprovedRelation($request->user()->id, $childId);

        $points = $relation->child->points;

        $overallRank = UserPoint::orderByDesc('total_points')
            ->where('total_points', '>', $points?->total_points ?? 0)
            ->count() + 1;

        $classRank = null;
        if ($relation->child->grade && $relation->child->class) {
            $classRank = User::where('grade', $relation->child->grade)
                ->where('class', $relation->child->class)
                ->whereHas('points', fn ($q) => $q->where('total_points', '>', $points?->total_points ?? 0))
                ->count() + 1;
        }

        $gradeRank = null;
        if ($relation->child->grade) {
            $gradeRank = User::where('grade', $relation->child->grade)
                ->whereHas('points', fn ($q) => $q->where('total_points', '>', $points?->total_points ?? 0))
                ->count() + 1;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'child' => [
                    'id' => $relation->child->id,
                    'name' => $relation->child->name,
                ],
                'rank' => [
                    'overall' => $overallRank,
                    'class' => $classRank,
                    'grade' => $gradeRank,
                ],
            ],
        ]);
    }

    public function childTransactions(Request $request, string $childId): JsonResponse
    {
        $relation = $this->getApprovedRelation($request->user()->id, $childId);

        $perPage = $request->input('per_page', 20);

        $transactions = PointTransaction::where('user_id', $childId)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->map(fn ($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'description' => $t->description,
                'created_at' => $t->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function childOrders(Request $request, string $childId): JsonResponse
    {
        $relation = $this->getApprovedRelation($request->user()->id, $childId);

        $perPage = $request->input('per_page', 20);

        $orders = Order::where('user_id', $childId)
            ->with('product')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->map(fn ($o) => [
                'id' => $o->id,
                'order_no' => $o->order_no,
                'product_name' => $o->product->name,
                'points_spent' => $o->points_spent,
                'status' => $o->status,
                'created_at' => $o->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function unbindChild(Request $request, string $childId): JsonResponse
    {
        $relation = ParentChild::where('parent_id', $request->user()->id)
            ->where('child_id', $childId)
            ->firstOrFail();

        $relation->delete();

        return response()->json([
            'success' => true,
            'message' => '已解除绑定',
        ]);
    }

    protected function getApprovedRelation(int $parentId, string $childId): ParentChild
    {
        return ParentChild::where('parent_id', $parentId)
            ->where('child_id', $childId)
            ->approved()
            ->with('child.points')
            ->firstOrFail();
    }
}
