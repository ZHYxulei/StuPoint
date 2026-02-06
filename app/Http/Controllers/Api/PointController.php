<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $request->validate([
            'type' => 'nullable|in:all,class,grade',
            'class' => 'nullable|string',
            'grade' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $request->input('limit', 50);
        $sortBy = $request->input('sort_by', 'total_points');

        $query = User::query()
            ->with('points')
            ->whereHas('points');

        // Filter by class if requested
        if ($request->input('type') === 'class' && $request->filled('class')) {
            // Get users in this class
            $query->whereRelation('schoolClassesAsStudent', function ($q) use ($request) {
                $q->whereHas('schoolClass', fn ($sq) => $sq->where('name', $request->input('class')));
            });
        }

        // Filter by grade if requested
        if ($request->input('type') === 'grade' && $request->filled('grade')) {
            $query->where('grade', $request->input('grade'));
        }

        $rankings = $query
            ->get()
            ->map(fn ($user) => [
                'user_id' => $user->id,
                'name' => $user->name,
                'total_points' => $user->points?->total_points ?? 0,
                'redeemable_points' => $user->points?->redeemable_points ?? 0,
            ])
            ->sortByDesc($sortBy)
            ->take($limit)
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
