<?php

namespace App\Http\Controllers;

use App\Services\UserStatsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __construct(
        private UserStatsService $statsService
    ) {}

    /**
     * Display the home page with user stats if logged in.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userStats = null;

        if ($user) {
            $userStats = $this->statsService->getUserStats($user);
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

        return response()->json([
            'authenticated' => true,
            'user' => $this->statsService->getUserStats($user),
        ]);
    }
}
