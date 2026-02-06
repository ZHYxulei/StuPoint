<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PointService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private PointService $pointService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string',
            'role' => 'nullable|string|exists:roles,slug',
            'class' => 'nullable|string',
        ]);

        $perPage = $request->input('per_page', 20);

        $query = User::with('roles', 'points')
            ->when($request->filled('search'), function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('email', 'like', '%'.$request->search.'%')
                    ->orWhere('student_id', 'like', '%'.$request->search.'%');
            })
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->whereHas('roles', fn ($rq) => $rq->where('slug', $request->role));
            })
            ->when($request->filled('class'), function ($q) use ($request) {
                $q->where('class', $request->class);
            });

        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'student_id' => $u->student_id,
                'grade' => $u->grade,
                'class' => $u->class,
                'roles' => $u->roles->pluck('slug'),
                'points' => [
                    'total_points' => $u->points?->total_points ?? 0,
                    'redeemable_points' => $u->points?->redeemable_points ?? 0,
                ],
            ]),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with('roles.points', 'points')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'student_id' => $user->student_id,
                'grade' => $user->grade,
                'class' => $user->class,
                'is_head_teacher' => $user->is_head_teacher,
                'roles' => $user->roles->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'slug' => $r->slug,
                ]),
                'points' => [
                    'total_points' => $user->points?->total_points ?? 0,
                    'redeemable_points' => $user->points?->redeemable_points ?? 0,
                ],
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'grade' => 'nullable|string|max:50',
            'class' => 'nullable|string|max:50',
            'is_head_teacher' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->update($request->only(['name', 'phone', 'grade', 'class', 'is_head_teacher']));

        if ($request->filled('roles')) {
            $user->roles()->sync($request->roles);
        }

        return response()->json([
            'success' => true,
            'message' => '用户信息已更新',
        ]);
    }

    public function adjustPoints(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'type' => 'required|in:add,deduct',
            'amount' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        if ($request->type === 'add') {
            $this->pointService->addPoints(
                $user,
                $request->amount,
                'manual_adjust',
                [
                    'description' => $request->reason,
                    'operator_id' => $request->user()->id,
                ]
            );
        } else {
            try {
                $this->pointService->deductRedeemablePoints(
                    $user,
                    $request->amount,
                    'manual_adjust',
                    [
                        'description' => $request->reason,
                        'operator_id' => $request->user()->id,
                    ]
                );
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 400);
            }
        }

        return response()->json([
            'success' => true,
            'message' => '积分调整成功',
        ]);
    }
}
