<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * Display a listing of grades.
     */
    public function index(Request $request)
    {
        $grades = Grade::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%')
                    ->orWhere('description', 'like', '%'.$request->input('search').'%');
            })
            ->orderBy('name')
            ->paginate(20);

        return inertia('admin/grades/index', [
            'grades' => $grades,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new grade.
     */
    public function create()
    {
        return inertia('admin/grades/create');
    }

    /**
     * Store a newly created grade in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:grades,name',
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        Grade::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.grades.index')
            ->with('success', '年级创建成功');
    }

    /**
     * Display the specified grade.
     */
    public function show(Grade $grade)
    {
        $grade->load(['classes' => function ($query) {
            $query->orderBy('name');
        }]);

        return inertia('admin/grades/show', [
            'grade' => $grade,
        ]);
    }

    /**
     * Show the form for editing the specified grade.
     */
    public function edit(Grade $grade)
    {
        return inertia('admin/grades/edit', [
            'grade' => $grade,
        ]);
    }

    /**
     * Update the specified grade in storage.
     */
    public function update(Request $request, Grade $grade)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:grades,name,'.$grade->id,
            'description' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $grade->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', '年级更新成功');
    }

    /**
     * Remove the specified grade from storage.
     */
    public function destroy(Grade $grade)
    {
        // Check if grade has associated classes
        if ($grade->classes()->count() > 0) {
            return back()->with('error', '该年级下还有班级，无法删除');
        }

        // Check if grade has associated users
        if ($grade->teachers()->count() > 0) {
            return back()->with('error', '该年级下还有教师，无法删除');
        }

        $grade->delete();

        return redirect()->route('admin.grades.index')
            ->with('success', '年级删除成功');
    }
}
