<?php

namespace Plugins\StudentCouncil;

use App\Http\Controllers\Controller;
use App\Models\CouncilActivity;
use App\Models\CouncilActivityParticipant;
use App\Models\CouncilActivityPoint;
use App\Services\PointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentCouncilController extends Controller
{
    /**
     * Dashboard for student council.
     */
    public function dashboard(Request $request)
    {
        $stats = [
            'total_activities' => CouncilActivity::count(),
            'active_activities' => CouncilActivity::where('status', 'active')->count(),
            'total_participants' => CouncilActivityParticipant::count(),
            'points_awarded' => CouncilActivityPoint::sum('amount'),
        ];

        $recentActivities = CouncilActivity::with('organizer')
            ->latest()
            ->limit(5)
            ->get();

        return inertia('student-council/dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
        ]);
    }

    /**
     * List all activities.
     */
    public function index(Request $request)
    {
        $activities = CouncilActivity::with(['organizer', 'participants'])
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->input('status'));
            })
            ->latest()
            ->paginate(15);

        return inertia('student-council/activities/index', [
            'activities' => $activities,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show create form.
     */
    public function create()
    {
        return inertia('student-council/activities/create');
    }

    /**
     * Store new activity.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'points_reward' => 'required|integer|min:0',
            'status' => 'required|in:draft,active,closed',
        ]);

        $activity = CouncilActivity::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'location' => $validated['location'],
            'max_participants' => $validated['max_participants'],
            'points_reward' => $validated['points_reward'],
            'status' => $validated['status'],
            'organizer_id' => Auth::id(),
        ]);

        return redirect()->route('student_council.activities.show', $activity->id)
            ->with('success', '活动创建成功');
    }

    /**
     * Show activity details.
     */
    public function show(string $id)
    {
        $activity = CouncilActivity::with(['organizer', 'participants.user'])
            ->findOrFail($id);

        return inertia('student-council/activities/show', [
            'activity' => $activity,
        ]);
    }

    /**
     * Update activity.
     */
    public function update(Request $request, string $id)
    {
        $activity = CouncilActivity::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'max_participants' => 'required|integer|min:1',
            'points_reward' => 'required|integer|min:0',
            'status' => 'required|in:draft,active,closed',
        ]);

        $activity->update($validated);

        return back()->with('success', '活动已更新');
    }

    /**
     * Delete activity.
     */
    public function destroy(string $id)
    {
        $activity = CouncilActivity::findOrFail($id);

        // Check if activity has participants
        if ($activity->participants()->count() > 0) {
            return back()->with('error', '活动已有参与者，无法删除');
        }

        $activity->delete();

        return redirect()->route('student_council.activities.index')
            ->with('success', '活动已删除');
    }

    /**
     * Award points to activity participants.
     */
    public function awardPoints(Request $request, string $id)
    {
        $activity = CouncilActivity::with('participants.user')->findOrFail($id);

        $validated = $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $pointService = app(PointService::class);

        $awardedCount = 0;
        foreach ($activity->participants as $participant) {
            if (! $participant->points_awarded) {
                try {
                    $pointService->addPoints(
                        $participant->user,
                        $activity->points_reward,
                        'council_activity',
                        [
                            'description' => $activity->title,
                            'activity_id' => $activity->id,
                            'note' => $validated['note'],
                        ]
                    );

                    $participant->update([
                        'points_awarded' => true,
                        'awarded_at' => now(),
                    ]);

                    $awardedCount++;
                } catch (\Exception $e) {
                    return back()->with('error', '积分奖励失败: '.$e->getMessage());
                }
            }
        }

        // Mark activity as completed if all participants awarded
        if ($awardedCount > 0 && $activity->participants()->count() === $awardedCount) {
            $activity->update(['status' => 'closed']);
        }

        return back()->with('success', "已成功奖励 {$awardedCount} 名参与者");
    }
}
