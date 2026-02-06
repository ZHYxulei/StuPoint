<?php

namespace App\Http\Controllers\Points;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PointController extends Controller
{
    /**
     * Display user's points overview.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $points = $user->points;

        if (! $points) {
            $points = UserPoint::create([
                'user_id' => $user->id,
                'total_points' => 0,
                'redeemable_points' => 0,
            ]);
        }

        // Get recent transactions
        $recentTransactions = PointTransaction::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        return inertia('points/index', [
            'points' => $points,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * Display user's transaction history.
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $transactions = PointTransaction::query()
            ->where('user_id', $user->id)
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->input('type'));
            })
            ->when($request->filled('source'), function ($query) use ($request) {
                $query->where('source', 'like', '%'.$request->input('source').'%');
            })
            ->latest()
            ->paginate(20);

        return inertia('points/history', [
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'source']),
        ]);
    }
}
