<?php

namespace App\Services;

use App\Models\PointTransaction;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Support\Facades\Schema;

class UserStatsService
{
    /**
     * Get comprehensive user statistics.
     */
    public function getUserStats(User $user): array
    {
        $userPoints = $this->ensureUserPoints($user);
        $todayChange = $this->getTodayChange($user);
        $schoolRank = $this->getSchoolRank($user, $userPoints);

        $classRank = null;
        $className = null;
        $gradeName = null;
        $classPoints = null;

        if ($user->class_id && $user->grade_id) {
            $schoolClass = $user->class;
            if ($schoolClass) {
                $className = $schoolClass->name;
                $gradeName = $schoolClass->grade ? $schoolClass->grade->name : $user->grade;
                $classRank = $this->getClassRank($user, $userPoints);
                $classPoints = $this->getClassPoints($user);
            }
        }

        return [
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

    /**
     * Ensure user has a UserPoint record.
     */
    protected function ensureUserPoints(User $user): UserPoint
    {
        $userPoints = $user->points;
        if (! $userPoints) {
            $userPoints = UserPoint::create([
                'user_id' => $user->id,
                'total_points' => 0,
                'redeemable_points' => 0,
            ]);
        }

        return $userPoints;
    }

    /**
     * Get today's points change.
     */
    protected function getTodayChange(User $user): int
    {
        $today = now()->startOfDay();

        return (int) PointTransaction::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $today)
            ->where('type', 'total')
            ->sum('amount');
    }

    /**
     * Get school-wide ranking among students.
     */
    protected function getSchoolRank(User $user, UserPoint $userPoints): int
    {
        return User::query()
            ->whereHas('roles', fn ($q) => $q->where('slug', 'student'))
            ->whereHas('points', fn ($q) => $q->where('total_points', '>', $userPoints->total_points))
            ->count() + 1;
    }

    /**
     * Get class ranking.
     */
    protected function getClassRank(User $user, UserPoint $userPoints): int
    {
        return User::query()
            ->whereHas('roles', fn ($q) => $q->where('slug', 'student'))
            ->where('class_id', $user->class_id)
            ->whereHas('points', fn ($q) => $q->where('total_points', '>', $userPoints->total_points))
            ->count() + 1;
    }

    /**
     * Get class average/total points.
     */
    protected function getClassPoints(User $user): ?int
    {
        $classPointsMode = Schema::hasTable('settings')
            ? Setting::get('class_points_mode', 'avg')
            : 'avg';

        if ($classPointsMode === 'separate') {
            return null;
        }

        $classPointsQuery = User::query()
            ->whereHas('roles', fn ($q) => $q->where('slug', 'student'))
            ->where('class_id', $user->class_id)
            ->leftJoin('user_points', 'users.id', '=', 'user_points.user_id');

        $classPointsSum = (int) $classPointsQuery->sum('user_points.total_points');

        if ($classPointsMode === 'sum') {
            return $classPointsSum;
        }

        $studentCount = (int) $classPointsQuery->distinct('users.id')->count('users.id');

        return $studentCount > 0 ? (int) round($classPointsSum / $studentCount) : 0;
    }
}
