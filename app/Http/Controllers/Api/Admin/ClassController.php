<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassTeacher;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'grade' => 'nullable|string',
        ]);

        $query = SchoolClass::with('headTeacher');

        if ($request->filled('grade')) {
            $query->where('grade', $request->input('grade'));
        }

        $classes = $query->latest()->get()->map(fn ($c) => [
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
        ]);

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'grade' => 'required|string|max:50',
            'head_teacher_id' => 'nullable|exists:users,id',
        ]);

        $class = SchoolClass::create([
            'name' => $request->name,
            'grade' => $request->grade,
            'head_teacher_id' => $request->head_teacher_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => '班级创建成功',
            'data' => [
                'id' => $class->id,
                'name' => $class->name,
                'grade' => $class->grade,
                'full_name' => $class->full_name,
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $class = SchoolClass::with([
            'headTeacher',
            'teachers.teacher',
            'students.student',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
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
                    'id' => $ct->teacher->id,
                    'name' => $ct->teacher->name,
                    'subject' => $ct->subject,
                ]),
                'students' => $class->students->map(fn ($cs) => [
                    'id' => $cs->student->id,
                    'name' => $cs->student->name,
                    'student_id' => $cs->student->student_id,
                ]),
                'created_at' => $class->created_at->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $class = SchoolClass::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:50',
            'grade' => 'sometimes|string|max:50',
            'head_teacher_id' => 'nullable|exists:users,id',
        ]);

        $class->update($request->only(['name', 'grade', 'head_teacher_id']));

        return response()->json([
            'success' => true,
            'message' => '班级信息已更新',
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $class = SchoolClass::findOrFail($id);

        DB::transaction(function () use ($class) {
            // Delete all class relationships
            $class->teachers()->delete();
            $class->students()->delete();
            $class->delete();
        });

        return response()->json([
            'success' => true,
            'message' => '班级已删除',
        ]);
    }

    public function assignTeacher(Request $request, string $id): JsonResponse
    {
        $class = SchoolClass::findOrFail($id);

        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:50',
        ]);

        // Check if teacher already assigned
        $existing = ClassTeacher::where('class_id', $id)
            ->where('teacher_id', $request->teacher_id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => '该教师已分配到此班级',
            ], 400);
        }

        ClassTeacher::create([
            'class_id' => $id,
            'teacher_id' => $request->teacher_id,
            'subject' => $request->subject,
        ]);

        return response()->json([
            'success' => true,
            'message' => '任课老师已分配',
        ]);
    }

    public function removeTeacher(string $id, string $teacherId): JsonResponse
    {
        $classTeacher = ClassTeacher::where('class_id', $id)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $classTeacher->delete();

        return response()->json([
            'success' => true,
            'message' => '任课老师已移除',
        ]);
    }
}
