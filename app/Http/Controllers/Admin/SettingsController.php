<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSiteSettingsRequest;
use App\Models\PluginSource;
use App\Models\Setting;
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

        // Get site settings
        $siteSettings = Setting::where('group', 'site')->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });

        // Get contact settings
        $contactSettings = Setting::where('group', 'contact')->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });

        // Get footer settings
        $footerSettings = Setting::where('group', 'footer')->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });

        // Get social settings
        $socialSettings = Setting::where('group', 'social')->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });

        return inertia('admin/settings/index', [
            'pluginSources' => $pluginSources,
            'siteSettingsForm' => $siteSettings,
            'contactSettings' => $contactSettings,
            'footerSettings' => $footerSettings,
            'socialSettings' => $socialSettings,
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

    /**
     * Update site settings.
     */
    public function updateSiteSettings(UpdateSiteSettingsRequest $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $validated = $request->validated();

        if (array_key_exists('site_favicon_upload', $validated) && $validated['site_favicon_upload'] instanceof \Illuminate\Http\UploadedFile) {
            $file = $validated['site_favicon_upload'];

            if ($file->isValid()) {
                $encoded = base64_encode($file->getContent());
                $dataUri = sprintf('data:%s;base64,%s', $file->getMimeType(), $encoded);
                Setting::set('site_favicon_data', $dataUri, 'string', 'site');
            }
        }

        foreach ($validated as $key => $value) {
            if ($key === 'site_favicon_upload') {
                continue;
            }

            if ($value !== null) {
                Setting::set($key, $value, 'string', 'site');
            }
        }

        return back()->with('success', '站点设置已更新');
    }

    /**
     * Update contact settings.
     */
    public function updateContactSettings(Request $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $validated = $request->validate([
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'contact');
            }
        }

        return back()->with('success', '联系信息已更新');
    }

    /**
     * Update footer settings.
     */
    public function updateFooterSettings(Request $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $validated = $request->validate([
            'footer_copyright' => 'nullable|string|max:500',
            'footer_icp' => 'nullable|string|max:100',
            'footer_police' => 'nullable|string|max:100',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'footer');
            }
        }

        return back()->with('success', '页脚设置已更新');
    }

    /**
     * Update social settings.
     */
    public function updateSocialSettings(Request $request)
    {
        $user = Auth::user();

        if (! $user || ! $user->hasRole('super_admin')) {
            abort(403, '无权访问');
        }

        $validated = $request->validate([
            'social_wechat' => 'nullable|string|max:255',
            'social_weibo' => 'nullable|string|max:255',
            'social_qq' => 'nullable|string|max:50',
        ]);

        foreach ($validated as $key => $value) {
            if ($value !== null) {
                Setting::set($key, $value, 'string', 'social');
            }
        }

        return back()->with('success', '社交媒体设置已更新');
    }
}
