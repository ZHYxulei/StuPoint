<?php

namespace App\Http\Controllers;

use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display dashboard with statistics.
     */
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $canViewGlobalDashboard = $user !== null && $this->canViewGlobalDashboard($user);

        $userPoints = null;
        if ($user) {
            $userPoints = $user->points;
            if (! $userPoints) {
                $userPoints = UserPoint::create([
                    'user_id' => $user->id,
                    'total_points' => 0,
                    'redeemable_points' => 0,
                ]);
            }
        }

        return inertia('dashboard', [
            'canViewGlobalDashboard' => $canViewGlobalDashboard,
            'totalUsers' => $canViewGlobalDashboard ? User::count() : null,
            'todayAdded' => $canViewGlobalDashboard ? $this->todayAdded() : null,
            'todayDeducted' => $canViewGlobalDashboard ? $this->todayDeducted() : null,
            'todayTransactions' => $canViewGlobalDashboard ? $this->todayTransactions() : null,
            'topUsers' => $canViewGlobalDashboard ? $this->topUsers() : [],
            'userPoints' => $userPoints ? [
                'id' => $userPoints->id,
                'total_points' => $userPoints->total_points,
                'redeemable_points' => $userPoints->redeemable_points,
            ] : null,
            'recentTransactions' => $this->recentTransactions($request, $canViewGlobalDashboard),
        ]);
    }

    private function canViewGlobalDashboard(User $user): bool
    {
        foreach (['super_admin', 'admin', 'principal', 'grade_director', 'head_teacher'] as $role) {
            if ($user->hasRole($role)) {
                return true;
            }
        }

        return $user->isHeadTeacher();
    }

    private function todayAdded(): int
    {
        return PointTransaction::query()
            ->where('created_at', '>=', now()->startOfDay())
            ->where('type', 'total')
            ->where('amount', '>', 0)
            ->sum('amount');
    }

    private function todayDeducted(): int
    {
        return abs(PointTransaction::query()
            ->where('created_at', '>=', now()->startOfDay())
            ->where('type', 'total')
            ->where('amount', '<', 0)
            ->sum('amount'));
    }

    private function todayTransactions(): int
    {
        return PointTransaction::query()
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
    }

    /**
     * @return array<int, array<string, int|string>>
     */
    private function topUsers(): array
    {
        return UserPoint::query()
            ->with('user:id,name,email')
            ->orderByDesc('total_points')
            ->limit(10)
            ->get()
            ->map(function (UserPoint $point): array {
                return [
                    'id' => $point->user_id,
                    'name' => $point->user->name ?? 'Unknown',
                    'email' => $point->user->email ?? '',
                    'total_points' => $point->total_points,
                    'redeemable_points' => $point->redeemable_points,
                ];
            })
            ->all();
    }

    /**
     * @return array<int, array<string, int|string>>
     */
    private function recentTransactions(Request $request, bool $canViewGlobalDashboard): array
    {
        $query = PointTransaction::query()->latest()->limit(20);

        if ($canViewGlobalDashboard) {
            $query->with('user:id,name');
        } else {
            $query->where('user_id', $request->user()?->id);
        }

        return $query->get()
            ->map(function (PointTransaction $transaction) use ($request, $canViewGlobalDashboard): array {
                return [
                    'id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                    'user_name' => $canViewGlobalDashboard
                        ? ($transaction->user->name ?? '未知用户')
                        : ($request->user()?->name ?? '当前用户'),
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                    'balance_after' => $transaction->balance_after,
                    'source' => $transaction->source,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->toDateTimeString(),
                ];
            })
            ->all();
    }
}
