<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserApprovalController extends Controller
{
    /**
     * Display list of pending approvals for the current user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = User::with(['class.grade', 'grade', 'roles'])
            ->where('registration_status', 'pending')
            ->where('requires_review', true);

        // Filter based on user role
        if ($user->is_head_teacher) {
            // Head teachers can only see students in their class
            $query->where('class_id', optional($user->headOfClass)?->id)
                ->whereHas('roles', fn ($q) => $q->whereIn('slug', ['student', 'student_union_member']));
        } elseif ($user->hasRole('grade_director')) {
            // Grade directors can only see teachers in their grade
            $query->where('grade_id', $user->grade_id)
                ->whereHas('roles', fn ($q) => $q->where('slug', 'teacher'));
        } elseif ($user->hasRole(['admin', 'super_admin'])) {
            // Admins can see all pending registrations
            // No additional filtering needed
        } else {
            // Other roles cannot see approvals
            $query->whereRaw('1 = 0');
        }

        $pendingApprovals = $query->latest()->paginate(20);

        // Get statistics
        $stats = $this->getApprovalStats($user);

        return inertia('admin/approvals/index', [
            'approvals' => $pendingApprovals,
            'stats' => $stats,
            'userRole' => $this->getUserApprovalRole($user),
        ]);
    }

    /**
     * Show details for a specific approval.
     */
    public function show(string $id)
    {
        $user = Auth::user();

        $approvalUser = User::with(['class.grade', 'grade', 'roles', 'class.headTeacher'])
            ->where('registration_status', 'pending')
            ->findOrFail($id);

        // Check if current user can review this user
        if (! $approvalUser->canReview($user)) {
            abort(403, '您没有权限审核此用户');
        }

        return inertia('admin/approvals/show', [
            'approval' => $approvalUser,
            'userRole' => $this->getUserApprovalRole($user),
        ]);
    }

    /**
     * Approve a user registration.
     */
    public function approve(Request $request, string $id)
    {
        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $reviewer = Auth::user();
        $approvalUser = User::where('registration_status', 'pending')->findOrFail($id);

        // Check if current user can review this user
        if (! $approvalUser->canReview($reviewer)) {
            return back()->with('error', '您没有权限审核此用户');
        }

        // Handle student union member - needs double approval
        if ($approvalUser->hasRole('student_union_member')) {
            $this->handleStudentUnionApproval($approvalUser, $reviewer);
        } else {
            // Standard approval
            $approvalUser->approve($reviewer, $request->input('note'));
        }

        return back()->with('success', '用户已批准');
    }

    /**
     * Reject a user registration.
     */
    public function reject(Request $request, string $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $reviewer = Auth::user();
        $approvalUser = User::where('registration_status', 'pending')->findOrFail($id);

        // Check if current user can review this user
        if (! $approvalUser->canReview($reviewer)) {
            return back()->with('error', '您没有权限审核此用户');
        }

        $approvalUser->reject($reviewer, $request->input('reason'));

        return back()->with('success', '用户已拒绝');
    }

    /**
     * Get approval statistics for the current user.
     */
    protected function getApprovalStats(User $user): array
    {
        $query = User::where('requires_review', true);

        if ($user->is_head_teacher) {
            $query->where('class_id', optional($user->headOfClass)?->id)
                ->whereHas('roles', fn ($q) => $q->whereIn('slug', ['student', 'student_union_member']));
        } elseif ($user->hasRole('grade_director')) {
            $query->where('grade_id', $user->grade_id)
                ->whereHas('roles', fn ($q) => $q->where('slug', 'teacher'));
        } elseif ($user->hasRole(['admin', 'super_admin'])) {
            // No filtering for admins
        } else {
            return [
                'total' => 0,
                'students' => 0,
                'teachers' => 0,
                'student_union_members' => 0,
            ];
        }

        return [
            'total' => $query->count(),
            'students' => (clone $query)->whereHas('roles', fn ($q) => $q->where('slug', 'student'))->count(),
            'teachers' => (clone $query)->whereHas('roles', fn ($q) => $q->where('slug', 'teacher'))->count(),
            'student_union_members' => (clone $query)->whereHas('roles', fn ($q) => $q->where('slug', 'student_union_member'))->count(),
        ];
    }

    /**
     * Get the approval role for the current user.
     */
    protected function getUserApprovalRole(User $user): ?string
    {
        if ($user->hasRole(['super_admin', 'admin'])) {
            return 'admin';
        }

        if ($user->hasRole('grade_director')) {
            return 'grade_director';
        }

        if ($user->is_head_teacher) {
            return 'head_teacher';
        }

        return null;
    }

    /**
     * Handle student union member approval (requires double approval).
     */
    protected function handleStudentUnionApproval(User $studentUnionMember, User $reviewer): void
    {
        DB::transaction(function () use ($studentUnionMember, $reviewer) {
            // First approval (head teacher)
            if ($reviewer->is_head_teacher) {
                // Check if this is the head teacher of the student's class
                if ($studentUnionMember->class_id !== optional($reviewer->headOfClass)?->id) {
                    abort(403, '您不是该学生所在班级的班主任');
                }

                // Mark as approved by head teacher, still needs grade director approval
                $studentUnionMember->update([
                    'registration_status' => 'pending', // Still pending
                    'reviewer_id' => $reviewer->id,
                    'reviewed_at' => now(),
                ]);

                // Note: In a real system, you'd add a field to track which approvals are done
                // For now, we're using a simpler approach
            }

            // Second approval (grade director)
            if ($reviewer->hasRole('grade_director')) {
                // Check if this grade director is in charge of the student's grade
                if ($studentUnionMember->grade_id !== $reviewer->grade_id) {
                    abort(403, '您不是该学生所在年级的年级主任');
                }

                // Check if head teacher has already approved
                if (! $studentUnionMember->reviewer_id) {
                    abort(403, '该学生尚未通过班主任审核');
                }

                // Both approvals done - approve the user
                $studentUnionMember->approve($reviewer);
            }
        });
    }

    /**
     * Get all approvals (admin only).
     */
    public function all(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::with(['class.grade', 'grade', 'reviewer', 'roles'])
            ->where('registration_status', '!=', 'approved');

        $approvals = $query->latest()->paginate(20);

        return inertia('admin/approvals/all', [
            'approvals' => $approvals,
        ]);
    }
}
