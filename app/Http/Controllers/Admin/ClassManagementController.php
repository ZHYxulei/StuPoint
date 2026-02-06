<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassStudent;
use App\Models\ClassTeacher;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;

class ClassManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = SchoolClass::with('headTeacher');

        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        $classes = $query->latest()->get();

        $grades = SchoolClass::select('grade')
            ->distinct()
            ->pluck('grade')
            ->sort()
            ->values();

        return inertia('admin/classes/index', [
            'classes' => $classes->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'grade' => $c->grade,
                'full_name' => $c->full_name,
                'head_teacher' => $c->headTeacher ? [
                    'id' => $c->headTeacher->id,
                    'name' => $c->headTeacher->name,
                ] : null,
                'student_count' => $c->students()->count(),
                'teacher_count' => $c->teachers()->count(),
                'created_at' => $c->created_at->toIso8601String(),
            ]),
            'grades' => $grades,
            'filters' => $request->only(['grade']),
        ]);
    }

    public function create()
    {
        $teachers = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['super_admin', 'principal', 'grade_director', 'teacher']);
        })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return inertia('admin/classes/create', [
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'grade' => 'required|string|max:50',
            'head_teacher_id' => 'nullable|exists:users,id',
        ]);

        SchoolClass::create($validated);

        return redirect()->route('admin.classes.index')->with('success', '班级创建成功');
    }

    public function show(string $id)
    {
        $class = SchoolClass::with([
            'headTeacher',
            'teachers.teacher',
            'students.student',
        ])->findOrFail($id);

        // Get available teachers
        $assignedTeacherIds = $class->teachers->pluck('teacher_id')->toArray();
        $availableTeachers = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['super_admin', 'principal', 'grade_director', 'teacher']);
        })
            ->whereNotIn('id', $assignedTeacherIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        // Get available students
        $assignedStudentIds = $class->students->pluck('student_id')->toArray();
        $availableStudents = User::whereHas('roles', function ($q) {
            $q->where('slug', 'student');
        })
            ->whereNotIn('id', $assignedStudentIds)
            ->orderBy('name')
            ->get(['id', 'name', 'student_id']);

        return inertia('admin/classes/show', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => $class->grade,
                'full_name' => $class->full_name,
                'head_teacher' => $class->headTeacher ? [
                    'id' => $class->headTeacher->id,
                    'name' => $class->headTeacher->name,
                    'email' => $class->headTeacher->email,
                ] : null,
                'teachers' => $class->teachers->map(fn ($ct) => [
                    'id' => $ct->id,
                    'teacher' => [
                        'id' => $ct->teacher->id,
                        'name' => $ct->teacher->name,
                        'email' => $ct->teacher->email,
                    ],
                    'subject' => $ct->subject,
                ]),
                'students' => $class->students->map(fn ($cs) => [
                    'id' => $cs->id,
                    'student' => [
                        'id' => $cs->student->id,
                        'name' => $cs->student->name,
                        'student_id' => $cs->student->student_id,
                    ],
                ]),
            ],
            'availableTeachers' => $availableTeachers,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function edit(string $id)
    {
        $class = SchoolClass::findOrFail($id);

        $teachers = User::whereHas('roles', function ($q) {
            $q->whereIn('slug', ['super_admin', 'principal', 'grade_director', 'teacher']);
        })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return inertia('admin/classes/edit', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => $class->grade,
                'head_teacher_id' => $class->head_teacher_id,
            ],
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $class = SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:50',
            'grade' => 'sometimes|required|string|max:50',
            'head_teacher_id' => 'nullable|exists:users,id',
        ]);

        $class->update($validated);

        return back()->with('success', '班级信息已更新');
    }

    public function destroy(string $id)
    {
        $class = SchoolClass::findOrFail($id);

        \DB::transaction(function () use ($class) {
            $class->teachers()->delete();
            $class->students()->delete();
            $class->delete();
        });

        return redirect()->route('admin.classes.index')->with('success', '班级已删除');
    }

    public function assignTeacher(Request $request, string $id)
    {
        $class = SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:50',
        ]);

        $existing = ClassTeacher::where('class_id', $id)
            ->where('teacher_id', $validated['teacher_id'])
            ->first();

        if ($existing) {
            return back()->with('error', '该教师已分配到此班级');
        }

        ClassTeacher::create([
            'class_id' => $id,
            'teacher_id' => $validated['teacher_id'],
            'subject' => $validated['subject'],
        ]);

        return back()->with('success', '任课老师已分配');
    }

    public function removeTeacher(string $id, string $teacherId)
    {
        $classTeacher = ClassTeacher::where('class_id', $id)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $classTeacher->delete();

        return back()->with('success', '任课老师已移除');
    }

    public function addStudent(Request $request, string $id)
    {
        $class = SchoolClass::findOrFail($id);

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
        ]);

        $existing = ClassStudent::where('class_id', $id)
            ->where('student_id', $validated['student_id'])
            ->first();

        if ($existing) {
            return back()->with('error', '该学生已在此班级中');
        }

        ClassStudent::create([
            'class_id' => $id,
            'student_id' => $validated['student_id'],
        ]);

        return back()->with('success', '学生已添加');
    }

    public function removeStudent(string $id, string $studentId)
    {
        $classStudent = ClassStudent::where('class_id', $id)
            ->where('student_id', $studentId)
            ->firstOrFail();

        $classStudent->delete();

        return back()->with('success', '学生已移除');
    }
}
