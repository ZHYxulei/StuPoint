<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassStudent;
use App\Models\ClassTeacher;
use App\Models\PointTransaction;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display list of users.
     */
    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%')
                    ->orWhere('email', 'like', '%'.$request->input('search').'%');
            })
            ->when($request->filled('role'), function ($query) use ($request) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('slug', $request->input('role'));
                });
            })
            ->latest()
            ->paginate(20);

        $roles = Role::orderBy('level')->get();

        return inertia('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * Show form for creating a new user.
     */
    public function create(Request $request)
    {
        // Exclude super_admin role from being selectable through UI
        $roles = Role::orderBy('level')
            ->where('slug', '!=', 'super_admin')
            ->get();
        $classes = SchoolClass::select('id', 'name', 'grade')
            ->orderBy('grade')
            ->orderBy('name')
            ->get();
        $subjects = Subject::active()
            ->ordered()
            ->get(['id', 'name', 'code']);

        return inertia('admin/users/create', [
            'roles' => $roles,
            'classes' => $classes,
            'subjects' => $subjects,
            'defaultRole' => $request->input('role'),
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'id_number' => 'nullable|string|max:50|unique:users,id_number',
            'student_id' => 'nullable|string|max:50|unique:users,student_id',
            'nickname' => 'nullable|string|max:255',
            'class_id' => 'nullable|exists:classes,id',
            'is_head_teacher' => 'boolean',
            'teaching_classes' => 'nullable|array',
            'teaching_classes.*' => 'exists:classes,id',
            'subjects' => 'nullable|array',
            'subjects.*' => 'exists:subjects,id',
        ]);

        return DB::transaction(function () use ($validated) {
            $role = Role::findOrFail($validated['role_id']);

            // Prevent assignment of super_admin role
            if ($role->slug === 'super_admin') {
                abort(403, '无法分配超级管理员角色');
            }

            // Prepare user data
            $userData = [
                'password' => Hash::make($validated['password']),
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
            ];

            // Add role-specific fields
            if ($role->slug === 'student') {
                $userData['name'] = $validated['name'];
                $userData['id_number'] = $validated['id_number'];
                $userData['nickname'] = $validated['nickname'] ?? null;
                $userData['student_id'] = $validated['student_id'] ?? null;
            } elseif ($role->slug === 'teacher') {
                $userData['is_head_teacher'] = $validated['is_head_teacher'] ?? false;
            }

            // Create user
            $user = User::create($userData);

            // Attach role
            $user->roles()->attach($role->id);

            // Handle role-specific additional data
            if ($role->slug === 'student' && ! empty($validated['class_id'])) {
                $class = SchoolClass::find($validated['class_id']);
                if ($class) {
                    ClassStudent::create([
                        'class_id' => $class->id,
                        'student_id' => $user->id,
                    ]);

                    $user->update([
                        'grade' => $class->grade,
                        'class' => $class->name,
                    ]);
                }
            } elseif ($role->slug === 'teacher') {
                // Set default name if not provided
                if (empty($user->name) && $user->email) {
                    $user->update(['name' => explode('@', $user->email)[0]]);
                }

                // Attach teaching classes
                if (! empty($validated['teaching_classes']) && is_array($validated['teaching_classes'])) {
                    foreach ($validated['teaching_classes'] as $classId) {
                        ClassTeacher::updateOrCreate(
                            [
                                'class_id' => $classId,
                                'teacher_id' => $user->id,
                            ],
                            ['subject' => null]
                        );
                    }
                }

                // Attach subjects
                if (! empty($validated['subjects']) && is_array($validated['subjects'])) {
                    $user->subjects()->sync($validated['subjects']);
                }
            } elseif ($role->slug === 'parent') {
                // Set default name if not provided
                if (empty($user->name) && ($user->email || $user->phone)) {
                    $user->update(['name' => $user->email ?: $user->phone]);
                }
            }

            return redirect()->route('admin.users.show', $user->id)
                ->with('success', '用户创建成功');
        });
    }

    /**
     * Show user details.
     */
    public function show(Request $request, string $id)
    {
        $user = User::with('roles', 'points')->findOrFail($id);

        $roles = Role::orderBy('level')->get();

        return inertia('admin/users/show', [
            'user' => $user,
            'availableRoles' => $roles,
        ]);
    }

    /**
     * Update user information.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:20',
            'student_id' => 'nullable|string|max:50|unique:users,student_id,'.$id,
            'id_number' => 'nullable|string|max:50|unique:users,id_number,'.$id,
            'grade' => 'nullable|string|max:50',
            'class' => 'nullable|string|max:50',
            'is_head_teacher' => 'boolean',
        ]);

        $user->update($validated);

        return back()->with('success', '用户信息已更新');
    }

    /**
     * Update user roles.
     */
    public function updateRoles(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->roles()->sync([$validated['role_id']]);

        return back()->with('success', '用户角色已更新');
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|confirmed|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', '密码已更新');
    }

    /**
     * Delete user.
     */
    public function destroy(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return back()->with('error', '不能删除自己的账户');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', '用户已删除');
    }

    /**
     * Adjust user points manually.
     */
    public function adjustPoints(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:add,deduct',
            'amount' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $pointService = app(\App\Services\PointService::class);

        if ($validated['type'] === 'add') {
            $pointService->addPoints(
                $user,
                $validated['amount'],
                'manual_adjust',
                [
                    'description' => $validated['reason'],
                    'operator_id' => $request->user()->id,
                ]
            );
        } else {
            try {
                $pointService->deductRedeemablePoints(
                    $user,
                    $validated['amount'],
                    'manual_adjust',
                    [
                        'description' => $validated['reason'],
                        'operator_id' => $request->user()->id,
                    ]
                );
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        return back()->with('success', '积分调整成功');
    }

    /**
     * Display user points statistics.
     */
    public function statistics(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $sortBy = $request->input('sort_by', 'total_points');
        $sortOrder = $request->input('sort_order', 'desc');

        $query = User::query()
            ->with(['points', 'roles'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%')
                    ->orWhere('email', 'like', '%'.$request->input('search').'%')
                    ->orWhere('student_id', 'like', '%'.$request->input('search').'%');
            })
            ->when($request->filled('role'), function ($query) use ($request) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('slug', $request->input('role'));
                });
            });

        // Sort by points
        if (in_array($sortBy, ['total_points', 'redeemable_points'])) {
            $query->leftJoin('user_points', 'users.id', '=', 'user_points.user_id')
                ->orderBy("user_points.{$sortBy}", $sortOrder)
                ->select('users.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $users = $query->paginate($perPage);

        // Get statistics summary
        $stats = [
            'total_users' => User::count(),
            'total_points' => (int) UserPoint::sum('total_points'),
            'total_redeemable' => (int) UserPoint::sum('redeemable_points'),
            'top_user' => UserPoint::with('user:id,name')
                ->orderByDesc('total_points')
                ->first(),
        ];

        $roles = Role::orderBy('level')->get();

        return inertia('admin/users/statistics', [
            'users' => $users,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role', 'sort_by', 'sort_order', 'per_page']),
        ]);
    }

    /**
     * Get detailed transaction logs for a user.
     */
    public function transactions(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $transactions = PointTransaction::query()
            ->where('user_id', $id)
            ->when($request->filled('type'), function ($query) use ($request) {
                $query->where('type', $request->input('type'));
            })
            ->when($request->filled('source'), function ($query) use ($request) {
                $query->where('source', 'like', '%'.$request->input('source').'%');
            })
            ->orderByDesc('created_at')
            ->paginate(50);

        return inertia('admin/users/transactions', [
            'user' => $user->load('points'),
            'transactions' => $transactions,
            'filters' => $request->only(['type', 'source']),
        ]);
    }
}
