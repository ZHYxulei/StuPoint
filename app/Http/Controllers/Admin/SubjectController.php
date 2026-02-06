<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $subjects = $query->ordered()->get();

        return inertia('admin/subjects/index', [
            'subjects' => $subjects->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'description' => $s->description,
                'is_active' => $s->is_active,
                'sort_order' => $s->sort_order,
                'created_at' => $s->created_at->toIso8601String(),
            ]),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return inertia('admin/subjects/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        Subject::create($validated);

        return redirect()->route('admin.subjects.index')->with('success', '科目创建成功');
    }

    public function edit(string $id)
    {
        $subject = Subject::findOrFail($id);

        return inertia('admin/subjects/edit', [
            'subject' => [
                'id' => $subject->id,
                'name' => $subject->name,
                'code' => $subject->code,
                'description' => $subject->description,
                'is_active' => $subject->is_active,
                'sort_order' => $subject->sort_order,
            ],
        ]);
    }

    public function update(Request $request, string $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50|unique:subjects,code,'.$id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $subject->update($validated);

        return back()->with('success', '科目信息已更新');
    }

    public function destroy(string $id)
    {
        $subject = Subject::findOrFail($id);

        $subject->delete();

        return redirect()->route('admin.subjects.index')->with('success', '科目已删除');
    }
}
