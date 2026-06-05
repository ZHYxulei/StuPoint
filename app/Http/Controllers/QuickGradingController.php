<?php

namespace App\Http\Controllers;

use App\Models\PointPreset;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\PointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuickGradingController extends Controller
{
    public function __construct(
        private PointService $pointService
    ) {}

    /**
     * Display the quick grading page.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $classId = $request->input('class_id');

        // Get classes the user can access
        $classes = $this->getAccessibleClasses($user);

        // Default to first class if none selected
        if (! $classId && $classes->isNotEmpty()) {
            $classId = $classes->first()->id;
        }

        // Get students in the selected class
        $students = collect();
        $selectedClass = null;

        if ($classId) {
            $selectedClass = SchoolClass::find($classId);
            if ($selectedClass) {
                $students = User::whereHas('schoolClassesAsStudent', function ($q) use ($classId) {
                    $q->where('class_id', $classId);
                })
                    ->orwhere('class_id', $classId)
                    ->with('points')
                    ->get()
                    ->sortByDesc(fn ($s) => $s->points?->total_points ?? 0)
                    ->values()
                    ->map(function ($student, $index) {
                        $student->rank = $index + 1;

                        return $student;
                    });
            }
        }

        // Get presets (user's presets + defaults)
        $userPresets = PointPreset::forUser($user);
        $presets = $userPresets->isNotEmpty()
            ? $userPresets
            : collect(PointPreset::defaults());

        return inertia('admin/quick-grading/index', [
            'classes' => $classes->values(),
            'selectedClassId' => $classId ? (int) $classId : null,
            'students' => $students,
            'presets' => $presets,
        ]);
    }

    /**
     * Adjust points for a student (quick action).
     */
    public function adjustPoints(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $operator = $request->user();

        $validated = $request->validate([
            'type' => 'required|in:add,deduct',
            'amount' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        if (! $this->pointService->canModifyPoints($operator, $user)) {
            throw ValidationException::withMessages([
                'amount' => '您没有权限修改该学生的积分',
            ]);
        }

        try {
            if ($validated['type'] === 'add') {
                $this->pointService->addPoints(
                    $user,
                    $validated['amount'],
                    'quick_grading',
                    [
                        'description' => $validated['reason'],
                        'operator_id' => $operator->id,
                        'operator_type' => $operator->roles->first()?->slug ?? 'unknown',
                    ]
                );
            } else {
                $this->pointService->deductRedeemablePoints(
                    $user,
                    $validated['amount'],
                    'quick_grading',
                    [
                        'description' => $validated['reason'],
                        'operator_id' => $operator->id,
                        'operator_type' => $operator->roles->first()?->slug ?? 'unknown',
                    ]
                );
            }
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'amount' => $e->getMessage(),
            ]);
        }

        // Return updated student data
        $user->refresh()->load('points');
        $students = $this->getStudentsWithRank($user->class_id);

        return back()->with([
            'success' => '积分调整成功',
            'student' => [
                'id' => $user->id,
                'points' => [
                    'total_points' => $user->points?->total_points ?? 0,
                    'redeemable_points' => $user->points?->redeemable_points ?? 0,
                ],
            ],
        ]);
    }

    /**
     * Get presets for the current user.
     */
    public function getPresets(Request $request)
    {
        $user = $request->user();
        $presets = PointPreset::forUser($user);

        return response()->json($presets);
    }

    /**
     * Save presets for the current user.
     */
    public function savePresets(Request $request)
    {
        $validated = $request->validate([
            'presets' => 'required|array',
            'presets.*.name' => 'required|string|max:50',
            'presets.*.type' => 'required|in:add,deduct',
            'presets.*.amount' => 'required|integer|min:1',
            'presets.*.reason' => 'required|string|max:200',
            'scope' => 'required|in:global,school,grade,class',
            'scope_id' => 'nullable|integer',
        ]);

        $user = $request->user();

        // Delete existing presets for this scope
        PointPreset::where('scope', $validated['scope'])
            ->when($validated['scope_id'], fn ($q) => $q->where('scope_id', $validated['scope_id']))
            ->where('created_by', $user->id)
            ->delete();

        // Create new presets
        foreach ($validated['presets'] as $preset) {
            PointPreset::create([
                'name' => $preset['name'],
                'type' => $preset['type'],
                'amount' => $preset['amount'],
                'reason' => $preset['reason'],
                'scope' => $validated['scope'],
                'scope_id' => $validated['scope_id'] ?? null,
                'created_by' => $user->id,
            ]);
        }

        return back()->with('success', '预设已保存');
    }

    /**
     * Get classes accessible by the current user.
     */
    private function getAccessibleClasses(User $user): \Illuminate\Support\Collection
    {
        if ($user->hasRole('super_admin') || $user->hasRole('admin')) {
            return SchoolClass::orderBy('grade')->orderBy('name')->get();
        }

        if ($user->hasRole('principal')) {
            return SchoolClass::orderBy('grade')->orderBy('name')->get();
        }

        if ($user->hasRole('grade_director') && $user->grade_id) {
            return SchoolClass::where('grade_id', $user->grade_id)
                ->orderBy('name')->get();
        }

        if ($user->hasRole('head_teacher')) {
            return SchoolClass::where('head_teacher_id', $user->id)
                ->orderBy('grade')->orderBy('name')->get();
        }

        if ($user->hasRole('teacher')) {
            return $user->teachingClasses()->orderBy('grade')->orderBy('name')->get();
        }

        return collect();
    }

    /**
     * Get students with ranking for a class.
     */
    private function getStudentsWithRank(?int $classId): \Illuminate\Support\Collection
    {
        if (! $classId) {
            return collect();
        }

        return User::whereHas('schoolClassesAsStudent', fn ($q) => $q->where('class_id', $classId))
            ->orwhere('class_id', $classId)
            ->with('points')
            ->get()
            ->sortByDesc(fn ($s) => $s->points?->total_points ?? 0)
            ->values()
            ->map(fn ($student, $index) => tap($student, fn ($s) => $s->rank = $index + 1));
    }
}
