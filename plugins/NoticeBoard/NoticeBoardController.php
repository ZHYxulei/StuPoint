<?php

namespace Plugins\NoticeBoard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Plugins\NoticeBoard\Models\Notice;

class NoticeBoardController extends Controller
{
    /**
     * List all published notices.
     */
    public function index(Request $request)
    {
        $notices = Notice::with('author')
            ->published()
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->paginate(15);

        return inertia('notices/index', [
            'notices' => $notices,
        ]);
    }

    /**
     * Show a single notice.
     */
    public function show(string $id)
    {
        $notice = Notice::with('author')->findOrFail($id);

        return inertia('notices/show', [
            'notice' => $notice,
        ]);
    }

    /**
     * Show create form.
     */
    public function create()
    {
        return inertia('notices/create');
    }

    /**
     * Store a new notice.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,published',
            'is_pinned' => 'boolean',
        ]);

        $notice = Notice::create([
            ...$validated,
            'author_id' => Auth::id(),
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return redirect()->route('notices.show', $notice->id)
            ->with('success', '公告创建成功');
    }

    /**
     * Update a notice.
     */
    public function update(Request $request, string $id)
    {
        $notice = Notice::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'status' => 'required|in:draft,published,archived',
            'is_pinned' => 'boolean',
        ]);

        if ($validated['status'] === 'published' && ! $notice->published_at) {
            $validated['published_at'] = now();
        }

        $notice->update($validated);

        return back()->with('success', '公告已更新');
    }

    /**
     * Delete a notice.
     */
    public function destroy(string $id)
    {
        $notice = Notice::findOrFail($id);
        $notice->delete();

        return redirect()->route('notices.index')
            ->with('success', '公告已删除');
    }
}
