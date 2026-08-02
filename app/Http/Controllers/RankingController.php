<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
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
            ->whereHas('roles', function ($query) {
                $query->where('slug', 'student');
            })
            ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
            ->select([
                'users.id',
                'users.name',
                'users.nickname',
                'users.grade',
                'users.class',
            ])
            ->selectRaw('COALESCE(user_points.total_points, 0) as total_points')
            ->selectRaw('COALESCE(user_points.redeemable_points, 0) as redeemable_points')
            ->orderByRaw('COALESCE(user_points.total_points, 0) DESC')
            ->orderBy('users.id');

        if ($type === 'class' && $user && $user->grade && $user->class) {
            $query->where('users.grade', $user->grade)->where('users.class', $user->class);
        } elseif ($type === 'grade' && $user && $user->grade) {
            $query->where('users.grade', $user->grade);
        }

        $rankings = $query->paginate($perPage);
        $this->transformRankings($rankings);

        $userRanking = null;
        if ($user) {
            $userWithPoints = User::query()
                ->where('users.id', $user->id)
                ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                ->select([
                    'users.id',
                    'users.name',
                    'users.nickname',
                    'users.grade',
                    'users.class',
                ])
                ->selectRaw('COALESCE(user_points.total_points, 0) as total_points')
                ->selectRaw('COALESCE(user_points.redeemable_points, 0) as redeemable_points')
                ->first();

            if ($userWithPoints && $userWithPoints->total_points > 0) {
                $higherRankedStudents = User::query()
                    ->whereHas('roles', function ($query) {
                        $query->where('slug', 'student');
                    })
                    ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                    ->whereRaw('COALESCE(user_points.total_points, 0) > ?', [$userWithPoints->total_points])
                    ->count();

                $userRanking = $this->transformRankingEntry($userWithPoints, $higherRankedStudents + 1);
            }
        }

        return inertia('ranking/index', [
            'rankings' => $rankings,
            'userRanking' => $userRanking,
            'filters' => $request->only(['type', 'per_page']),
        ]);
    }

    private function transformRankings(LengthAwarePaginator $rankings): void
    {
        $startingRank = (($rankings->currentPage() - 1) * $rankings->perPage()) + 1;

        $rankings->setCollection(
            $rankings->getCollection()
                ->values()
                ->map(fn (User $user, int $index): array => $this->transformRankingEntry($user, $startingRank + $index))
        );
    }

    /**
     * @return array{
     *     id: int,
     *     display_name: string,
     *     grade: mixed,
     *     class: mixed,
     *     total_points: int,
     *     redeemable_points: int,
     *     rank: int
     * }
     */
    private function transformRankingEntry(User $user, int $rank): array
    {
        return [
            'id' => $user->id,
            'display_name' => $user->display_name,
            'grade' => $user->grade,
            'class' => $user->class,
            'total_points' => (int) $user->total_points,
            'redeemable_points' => (int) $user->redeemable_points,
            'rank' => $rank,
        ];
    }
}
