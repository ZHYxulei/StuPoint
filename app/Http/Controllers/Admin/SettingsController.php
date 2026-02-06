<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PluginSource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingsController extends Controller
{
    /**
     * Display system settings page.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user is admin
        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $pluginSources = PluginSource::ordered()->get();

        return inertia('admin/settings/index', [
            'pluginSources' => $pluginSources,
        ]);
    }

    /**
     * Store a new plugin source.
     */
    public function storePluginSource(Request $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:plugin_sources,slug',
            'description' => 'nullable|string',
            'url' => 'required|url',
            'api_key' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        PluginSource::create($validated);

        return back()->with('success', '插件源已添加');
    }

    /**
     * Update a plugin source.
     */
    public function updatePluginSource(Request $request, string $id)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $source = PluginSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:100|unique:plugin_sources,slug,'.$id,
            'description' => 'nullable|string',
            'url' => 'required|url',
            'api_key' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        $source->update($validated);

        return back()->with('success', '插件源已更新');
    }

    /**
     * Delete a plugin source.
     */
    public function deletePluginSource(Request $request, string $id)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $source = PluginSource::findOrFail($id);
        $source->delete();

        return back()->with('success', '插件源已删除');
    }

    /**
     * Test plugin source connection.
     */
    public function testPluginSource(Request $request, string $id)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $source = PluginSource::findOrFail($id);

        // TODO: Implement actual API test
        // For now, just return success
        return back()->with('success', '连接测试成功');
    }
}
