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
        $perPage = $request->input('per_page', 50);
        $type = $request->input('type', 'all'); // all, class, grade

        $query = User::query()
            ->with(['points', 'roles'])
            ->whereHas('roles', function ($q) {
                $q->where('slug', 'student');
            });

        // Filter by class if user is a student
        if ($type === 'class' && $user && $user->grade && $user->class) {
            $query->where('grade', $user->grade)->where('class', $user->class);
        } elseif ($type === 'grade' && $user && $user->grade) {
            $query->where('grade', $user->grade);
        }

        // Get paginated rankings with calculated rank
        $page = $request->input('page', 1);
        $allRankings = $query
            ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
            ->select('users.*', 'user_points.total_points', 'user_points.redeemable_points')
            ->orderByDesc('user_points.total_points')
            ->get()
            ->map(function ($user, $index) {
                $user->rank = $index + 1;

                return $user;
            });

        // Get paginated data
        $paginatedItems = $allRankings->forPage($page, $perPage);

        // Inject current user if not in current page
        $currentUserInPage = null;
        if ($user) {
            $currentUserInPage = $paginatedItems->firstWhere('id', $user->id);

            if (! $currentUserInPage) {
                // Find current user in all rankings
                $currentUserRanking = $allRankings->firstWhere('id', $user->id);
                if ($currentUserRanking) {
                    // Add current user to the page
                    $paginatedItems = $paginatedItems->concat([$currentUserRanking]);
                }
            }
        }

        $rankings = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginatedItems,
            $allRankings->count(),
            $perPage,
            $page
        );

        // Get user's own ranking
        $userRanking = null;
        if ($user) {
            $userWithPoints = User::query()
                ->where('users.id', $user->id)
                ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                ->select('users.*', 'user_points.total_points', 'user_points.redeemable_points')
                ->first();

            if ($userWithPoints && $userWithPoints->total_points) {
                // Calculate rank
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
