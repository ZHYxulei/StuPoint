<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RankingController extends Controller
{
    /**
     * Display the ranking page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = min((int) $request->input('per_page', 50), 100);
        $type = $request->input('type', 'all');

        $query = User::query()
            ->whereHas('roles', function ($q) {
                $q->where('slug', 'student');
            })
            ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
            ->select('users.*', 'user_points.total_points', 'user_points.redeemable_points')
            ->orderByDesc('user_points.total_points');

        // Filter by class/grade
        if ($type === 'class' && $user && $user->grade && $user->class) {
            $query->where('users.grade', $user->grade)->where('users.class', $user->class);
        } elseif ($type === 'grade' && $user && $user->grade) {
            $query->where('users.grade', $user->grade);
        }

        // SQL-level pagination (avoids loading all users into memory)
        $rankings = $query->paginate($perPage, ['users.*', 'user_points.total_points', 'user_points.redeemable_points']);

        // Get user's own ranking
        $userRanking = null;
        if ($user) {
            $userWithPoints = User::query()
                ->where('users.id', $user->id)
                ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                ->select('users.*', 'user_points.total_points', 'user_points.redeemable_points')
                ->first();

            if ($userWithPoints && $userWithPoints->total_points) {
                $rank = User::query()
                    ->whereHas('roles', function ($q) {
                        $q->where('slug', 'student');
                    })
                    ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                    ->where('user_points.total_points', '>', $userWithPoints->total_points)
                    ->count();

                $userWithPoints->rank = $rank + 1;
                $userRanking = $userWithPoints;
            }
        }

        return inertia('ranking/index', [
            'rankings' => $rankings,
            'userRanking' => $userRanking,
            'filters' => $request->only(['type', 'per_page']),
        ]);
    }
}
