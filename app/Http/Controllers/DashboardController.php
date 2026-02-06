<?php

namespace App\Http\Controllers;

use App\Models\PointTransaction;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display dashboard with statistics.
     */
    public function __invoke(Request $request)
    {
        $user = Auth::user();

        // Total users count
        $totalUsers = User::count();

        // Today's point changes
        $today = now()->startOfDay();
        $todayPointChanges = PointTransaction::query()
            ->where('created_at', '>=', $today)
            ->get();

        $todayAdded = $todayPointChanges->where('type', 'total')->where('amount', '>', 0)->sum('amount');
        $todayDeducted = abs($todayPointChanges->where('type', 'total')->where('amount', '<', 0)->sum('amount'));
        $todayTransactions = $todayPointChanges->count();

        // Top 10 users by total points
        $topUsers = UserPoint::query()
            ->with('user:id,name,email')
            ->orderByDesc('total_points')
            ->limit(10)
            ->get()
            ->map(function ($point) {
                return [
                    'id' => $point->user_id,
                    'name' => $point->user->name ?? 'Unknown',
                    'email' => $point->user->email ?? '',
                    'total_points' => $point->total_points,
                    'redeemable_points' => $point->redeemable_points,
                ];
            });

        // User's own points (if authenticated)
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

        // Recent point transactions (last 20)
        $recentTransactions = PointTransaction::query()
            ->with('user:id,name')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'user_id' => $transaction->user_id,
                    'user_name' => $transaction->user->name ?? '未知用户',
                    'type' => $transaction->type,
                    'amount' => $transaction->amount,
                    'balance_after' => $transaction->balance_after,
                    'source' => $transaction->source,
                    'description' => $transaction->description,
                    'created_at' => $transaction->created_at->toDateTimeString(),
                ];
            });

        return inertia('dashboard', [
            'totalUsers' => $totalUsers,
            'todayAdded' => $todayAdded,
            'todayDeducted' => $todayDeducted,
            'todayTransactions' => $todayTransactions,
            'topUsers' => $topUsers,
            'userPoints' => $userPoints,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
