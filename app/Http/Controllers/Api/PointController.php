<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('points');

        $points = $user->points ?? UserPoint::create(['user_id' => $user->id]);

        // Calculate ranks
        $totalRank = UserPoint::orderByDesc('total_points')
            ->where('total_points', '>', $points->total_points)
            ->count() + 1;

        $redeemableRank = UserPoint::orderByDesc('redeemable_points')
            ->where('redeemable_points', '>', $points->redeemable_points)
            ->count() + 1;

        $totalUsers = UserPoint::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_points' => $points->total_points,
                'redeemable_points' => $points->redeemable_points,
                'rank' => [
                    'overall' => $totalRank,
                    'redeemable' => $redeemableRank,
                ],
                'total_users' => $totalUsers,
            ],
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'nullable|in:total,redeemable',
            'source' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $perPage = $request->input('per_page', 20);

        $transactions = $request->user()
            ->transactions()
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->input('type'));
            })
            ->when($request->filled('source'), function ($query) use ($request) {
                $query->where('source', 'like', '%'.$request->input('source').'%');
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $transactions->map(fn ($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'balance_after' => $t->balance_after,
                'source' => $t->source,
                'description' => $t->description,
                'created_at' => $t->created_at->toIso8601String(),
            ]),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function ranking(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'nullable|in:all,class,grade',
            'class' => 'nullable|string',
            'grade' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
            'sort_by' => ['nullable', Rule::in(['total_points', 'redeemable_points'])],
        ]);

        $limit = $validated['limit'] ?? 50;
        $sortBy = $validated['sort_by'] ?? 'total_points';

        $query = User::query()
            ->with('points')
            ->whereHas('points');

        if (($validated['type'] ?? null) === 'class' && filled($validated['class'] ?? null)) {
            $query->whereRelation('schoolClassesAsStudent', function ($classStudentsQuery) use ($validated) {
                $classStudentsQuery->whereHas('schoolClass', fn ($schoolClassQuery) => $schoolClassQuery->where('name', $validated['class']));
            });
        }

        if (($validated['type'] ?? null) === 'grade' && filled($validated['grade'] ?? null)) {
            $query->where('grade', $validated['grade']);
        }

        $rankings = $query
            ->join('user_points', 'users.id', '=', 'user_points.user_id')
            ->orderByDesc("user_points.$sortBy")
            ->limit($limit)
            ->get(['users.*'])
            ->map(fn ($user) => [
                'user_id' => $user->id,
                'name' => $user->name,
                'total_points' => $user->points?->total_points ?? 0,
                'redeemable_points' => $user->points?->redeemable_points ?? 0,
            ])
            ->values()
            ->map(function ($item, $index) {
                $item['rank'] = $index + 1;

                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $rankings,
        ]);
    }
}
