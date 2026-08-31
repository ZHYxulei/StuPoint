<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Models\PluginSource;
use App\Services\PluginManager;
use App\Services\PluginUploader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rules\File as FileRule;

class PluginController extends Controller
{
    public function __construct(
        private PluginManager $pluginManager,
        private PluginUploader $uploader
    ) {}

    /**
     * Display list of all plugins.
     */
    public function index()
    {
        $plugins = Plugin::withCount('permissions')->latest()->get();

        $plugins = $plugins->map(function ($plugin) {
            $manifest = $this->uploader->readStoredManifest($plugin->slug) ?? $this->pluginManager->readManifest($plugin->slug);
            $repo = $manifest['repository']['repo'] ?? null;

            if ($repo && ! preg_match('/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/', $repo)) {
                $repo = null;
            }

            $stars = null;
            if ($repo) {
                $stars = \Cache::remember("github.stars.{$repo}", 3600, function () use ($repo) {
                    try {
                        $response = \Http::timeout(5)->get("https://api.github.com/repos/{$repo}");
                        if ($response->successful()) {
                            return $response->json('stargazers_count');
                        }
                    } catch (\Throwable) {
                        // silently fail
                    }

                    return null;
                });
            }

            return [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'slug' => $plugin->slug,
                'version' => $plugin->version,
                'description' => $plugin->description,
                'author' => $plugin->author,
                'status' => $plugin->status,
                'config' => $plugin->config,
                'permissions_count' => $plugin->permissions_count,
                'created_at' => $plugin->created_at,
                'enabled_at' => $plugin->enabled_at,
                'github_url' => $repo ? "https://github.com/{$repo}" : null,
                'github_stars' => $stars,
            ];
        });

        $pluginSources = PluginSource::orderBy('sort_order')->orderBy('name')->get();

        return inertia('admin/plugins/index', [
            'plugins' => $plugins,
            'pluginSources' => $pluginSources,
        ]);
    }

    /**
     * Show plugin details.
     */
    public function show(string $id)
    {
        $plugin = Plugin::with('permissions')->findOrFail($id);

        $pluginInstance = $this->pluginManager->loadPluginInstance($plugin);
        $configSchema = [];
        if ($pluginInstance && method_exists($pluginInstance, 'getConfigSchema')) {
            $configSchema = $pluginInstance->getConfigSchema();
        }

        $mergedConfig = [];
        $storedConfig = $plugin->config ?? [];
        foreach ($configSchema as $key => $field) {
            $mergedConfig[$key] = [
                'value' => $storedConfig[$key] ?? $field['default'],
                'label' => $field['label'] ?? $key,
                'description' => $field['description'] ?? '',
                'type' => $field['type'] ?? 'text',
            ];
        }

        return inertia('admin/plugins/show', [
            'plugin' => $plugin,
            'configSchema' => $mergedConfig,
        ]);
    }

    /**
     * Install a plugin.
     */
    public function install(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|string',
        ]);

        $plugin = Plugin::where('slug', $validated['slug'])->first();

        if (! $plugin || ! $this->uploader->hasStoredPackage($validated['slug'])) {
            return back()->with('error', '插件未找到');
        }

        if ($plugin->status !== 'installed') {
            $plugin->update([
                'status' => 'installed',
                'installed_at' => $plugin->installed_at ?? now(),
            ]);
        }

        return back()->with('success', '插件安装成功');
    }

    /**
     * Enable a plugin.
     */
    public function enable(string $id)
    {
        $plugin = Plugin::findOrFail($id);

        try {
            $this->pluginManager->enablePlugin($plugin);

            return back()->with('success', '插件已启用');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return back()->with('error', '插件启用失败: '.$e->getMessage());
        }
    }

    /**
     * Disable a plugin.
     */
    public function disable(string $id)
    {
        $plugin = Plugin::findOrFail($id);

        try {
            $this->pluginManager->disablePlugin($plugin);

            return back()->with('success', '插件已禁用');
        } catch (\Exception $e) {
            return back()->with('error', '插件禁用失败: '.$e->getMessage());
        }
    }

    /**
     * Uninstall a plugin.
     */
    public function uninstall(string $id)
    {
        $plugin = Plugin::findOrFail($id);

        try {
            if ($plugin->metadata && isset($plugin->metadata['has_data']) && $plugin->metadata['has_data']) {
                return back()->with('error', '插件包含数据，请先清理数据后再卸载');
            }

            $this->pluginManager->uninstallPlugin($plugin);

            return redirect()->route('admin.plugins.index')->with('success', '插件已卸载');
        } catch (\Exception $e) {
            return back()->with('error', '插件卸载失败: '.$e->getMessage());
        }
    }

    /**
     * Upload a plugin from ZIP file.
     */
    public function upload(Request $request)
    {
        Gate::authorize('uploadPlugin');

        $validated = $request->validate([
            'plugin' => ['required', FileRule::types(['zip'])->max(50 * 1024)],
        ]);

        try {
            $result = $this->uploader->upload($validated['plugin']);

            return back()->with('success', $result['message']);
        } catch (\Throwable $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update plugin configuration.
     */
    public function updateConfig(Request $request, string $id)
    {
        $plugin = Plugin::findOrFail($id);

        $validated = $request->validate([
            'config' => 'array',
        ]);

        try {
            $plugin->update([
                'config' => $validated['config'],
            ]);

            if (cache()->has("plugin.{$plugin->slug}.config")) {
                cache()->forget("plugin.{$plugin->slug}.config");
            }

            $this->pluginManager->reloadPlugin($plugin);

            return back()->with('success', '插件配置已更新');
        } catch (\Exception $e) {
            return back()->with('error', '配置更新失败: '.$e->getMessage());
        }
    }
}
