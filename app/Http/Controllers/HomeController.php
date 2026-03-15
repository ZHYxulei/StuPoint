<?php

namespace App\Http\Controllers;

use App\Models\PointTransaction;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Display the home page with user stats if logged in.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userStats = null;

        if ($user) {
            // Get user's points
            $userPoints = $user->points;
            if (! $userPoints) {
                $userPoints = UserPoint::create([
                    'user_id' => $user->id,
                    'total_points' => 0,
                    'redeemable_points' => 0,
                ]);
            }

            // Today's points change
            $today = now()->startOfDay();
            $todayChange = PointTransaction::query()
                ->where('user_id', $user->id)
                ->where('created_at', '>=', $today)
                ->where('type', 'total')
                ->sum('amount');

            // School-wide ranking (among students)
            $schoolRank = User::query()
                ->whereHas('roles', function ($q) {
                    $q->where('slug', 'student');
                })
                ->whereHas('points', function ($q) use ($userPoints) {
                    $q->where('total_points', '>', $userPoints->total_points);
                })
                ->count() + 1;

            // Class ranking
            $classRank = null;
            $className = null;
            $gradeName = null;
            $classPoints = null;

            if ($user->class_id && $user->grade_id) {
                $schoolClass = $user->class;
                if ($schoolClass) {
                    $className = $schoolClass->name;
                    $gradeName = $schoolClass->grade ? $schoolClass->grade->name : $user->grade;

                    $classRank = User::query()
                        ->whereHas('roles', function ($q) {
                            $q->where('slug', 'student');
                        })
                        ->where('class_id', $user->class_id)
                        ->whereHas('points', function ($q) use ($userPoints) {
                            $q->where('total_points', '>', $userPoints->total_points);
                        })
                        ->count() + 1;

                    $classPointsMode = Schema::hasTable('settings')
                        ? Setting::get('class_points_mode', 'avg')
                        : 'avg';

                    if ($classPointsMode !== 'separate') {
                        $classPointsQuery = User::query()
                            ->whereHas('roles', function ($q) {
                                $q->where('slug', 'student');
                            })
                            ->where('class_id', $user->class_id)
                            ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id');

                        $classPointsSum = (int) $classPointsQuery->sum('user_points.total_points');

                        if ($classPointsMode === 'sum') {
                            $classPoints = $classPointsSum;
                        } else {
                            $studentCount = (int) $classPointsQuery->distinct('users.id')->count('users.id');
                            $classPoints = $studentCount > 0
                                ? (int) round($classPointsSum / $studentCount)
                                : 0;
                        }
                    }
                }
            }

            $userStats = [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'student_id' => $user->student_id,
                'total_points' => $userPoints->total_points,
                'redeemable_points' => $userPoints->redeemable_points,
                'today_change' => $todayChange,
                'school_rank' => $schoolRank,
                'class_rank' => $classRank,
                'class_name' => $className,
                'grade_name' => $gradeName,
                'class_points' => $classPoints,
            ];
        }

        return inertia('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'userStats' => $userStats,
        ]);
    }

    /**
     * Get user statistics for the home page (API endpoint).
     */
    public function userStats(Request $request)
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'authenticated' => false,
            ]);
        }

        // Get user's points
        $userPoints = $user->points;
        if (! $userPoints) {
            $userPoints = UserPoint::create([
                'user_id' => $user->id,
                'total_points' => 0,
                'redeemable_points' => 0,
            ]);
        }

        // Today's points change
        $today = now()->startOfDay();
        $todayChange = PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $today)
            ->where('type', 'total')
            ->sum('amount');

        // School-wide ranking (among students)
        $schoolRank = User::query()
            ->whereHas('roles', function ($q) {
                $q->where('slug', 'student');
            })
            ->whereHas('points', function ($q) use ($userPoints) {
                $q->where('total_points', '>', $userPoints->total_points);
            })
            ->count() + 1;

        // Class ranking
        $classRank = null;
        $className = null;
        $gradeName = null;

        if ($user->class_id && $user->grade_id) {
            $schoolClass = $user->class;
            if ($schoolClass) {
                $className = $schoolClass->name;
                $gradeName = $schoolClass->grade ? $schoolClass->grade->name : $user->grade;

                $classRank = User::query()
                    ->whereHas('roles', function ($q) {
                        $q->where('slug', 'student');
                    })
                    ->where('class_id', $user->class_id)
                    ->whereHas('points', function ($q) use ($userPoints) {
                        $q->where('total_points', '>', $userPoints->total_points);
                    })
                    ->count() + 1;
            }
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'student_id' => $user->student_id,
                'total_points' => $userPoints->total_points,
                'redeemable_points' => $userPoints->redeemable_points,
                'today_change' => $todayChange,
                'school_rank' => $schoolRank,
                'class_rank' => $classRank,
                'class_name' => $className,
                'grade_name' => $gradeName,
            ],
        ]);
    }
}
