<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Models\PluginSource;
use App\Services\PluginManager;
use App\Services\PluginUploader;
use Illuminate\Http\Request;

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

        // Auto-register plugins from plugins/ folder using manifest.json
        $pluginDirs = glob(base_path('plugins/*'), GLOB_ONLYDIR);

        foreach ($pluginDirs as $pluginDir) {
            $jsonPath = $pluginDir.'/manifest.json';
            if (! file_exists($jsonPath)) {
                continue;
            }

            try {
                $manifest = json_decode(file_get_contents($jsonPath), true);
            } catch (\Throwable) {
                continue;
            }

            if (! $manifest) {
                continue;
            }

            $slug = $manifest['slug'] ?? basename($pluginDir);
            $pluginFile = $pluginDir.'/'.($manifest['class'] ?? basename($pluginDir).'Plugin').'.php';

            if (! file_exists($pluginFile)) {
                continue;
            }

            $className = $this->getClassNameFromFile($pluginFile);
            if ($className && class_exists($className)) {
                $pluginInstance = new $className;
                if ($pluginInstance instanceof \Plugins\Plugin) {
                    if (! Plugin::where('slug', $slug)->exists()) {
                        Plugin::create([
                            'name' => $manifest['name'] ?? $pluginInstance->getName(),
                            'slug' => $slug,
                            'version' => $manifest['version'] ?? $pluginInstance->getVersion(),
                            'description' => $manifest['description'] ?? $pluginInstance->getDescription() ?? '',
                            'author' => $this->resolveAuthor($manifest, $pluginInstance),
                            'dependencies' => $manifest['dependencies'] ?? ['composer' => [], 'plugins' => []],
                            'status' => 'disabled',
                        ]);
                    }
                }
            }
        }

        // Reload plugins after auto-registration
        $plugins = Plugin::withCount('permissions')->latest()->get();

        // Enrich plugins with GitHub info from manifest.json
        $plugins = $plugins->map(function ($plugin) {
            $manifest = $this->pluginManager->readManifest($plugin->slug);
            $repo = $manifest['repository']['repo'] ?? null;

            $plugin->github_url = $repo ? "https://github.com/{$repo}" : null;
            $plugin->github_stars = null;

            if ($repo) {
                $plugin->github_stars = \Cache::remember("github.stars.{$repo}", 3600, function () use ($repo) {
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

            return $plugin;
        });

        // Get plugin sources for the settings
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

        // Merge plugin config schema with stored config
        $pluginInstance = $this->pluginManager->loadPluginInstance($plugin);
        $configSchema = [];
        if ($pluginInstance && method_exists($pluginInstance, 'getConfigSchema')) {
            $configSchema = $pluginInstance->getConfigSchema();
        }

        // Build merged config: stored values override defaults
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

        $pluginClass = $this->pluginManager->getPluginClass($validated['slug']);

        if (! $pluginClass) {
            return back()->with('error', '插件未找到');
        }

        try {
            $pluginInstance = new $pluginClass;
            $pluginInstance->install();

            // Install composer dependencies from plugin.yaml
            $plugin = Plugin::where('slug', $validated['slug'])->first();
            if ($plugin) {
                $composerResult = $this->pluginManager->installComposerDependencies($plugin);
                if (! empty($composerResult['installed'])) {
                    \Log::info("Plugin [{$validated['slug']}] composer deps: {$composerResult['message']}");
                }
            }

            // Create plugin record if not exists
            if (! $plugin) {
                $manifest = $this->pluginManager->readManifest($validated['slug']);
                $plugin = Plugin::create([
                    'name' => $manifest['name'] ?? $pluginInstance->getName(),
                    'slug' => $pluginInstance->getSlug(),
                    'version' => $manifest['version'] ?? $pluginInstance->getVersion(),
                    'description' => $manifest['description'] ?? $pluginInstance->getDescription() ?? '',
                    'author' => $this->resolveAuthor($manifest, $pluginInstance),
                    'dependencies' => $manifest['dependencies'] ?? ['composer' => [], 'plugins' => []],
                    'status' => 'installed',
                ]);
            }

            // Register plugin permissions
            $this->pluginManager->registerPluginPermissions($pluginInstance, $plugin);

            return back()->with('success', '插件安装成功');
        } catch (\Exception $e) {
            return back()->with('error', '插件安装失败: '.$e->getMessage());
        }
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
            // Check if plugin has data
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
        $validated = $request->validate([
            'plugin' => 'required|file|mimes:zip|max:51200', // 50MB
        ]);

        try {
            $result = $this->uploader->upload($validated['plugin']);

            return back()->with('success', $result['message']);
        } catch (\Exception $e) {
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

            // Clear plugin cache
            if (cache()->has("plugin.{$plugin->slug}.config")) {
                cache()->forget("plugin.{$plugin->slug}.config");
            }

            // Reload plugin
            $this->pluginManager->reloadPlugin($plugin);

            return back()->with('success', '插件配置已更新');
        } catch (\Exception $e) {
            return back()->with('error', '配置更新失败: '.$e->getMessage());
        }
    }

    /**
     * Get plugin class name from file path.
     */
    protected function getClassNameFromFile(string $file): ?string
    {
        $content = file_get_contents($file);

        if (! preg_match('/namespace\s+([\w\\\\]+);/', $content, $namespaceMatch)) {
            return null;
        }

        if (! preg_match('/class\s+(\w+)\s+extends/', $content, $classMatch)) {
            return null;
        }

        return $namespaceMatch[1].'\\'.$classMatch[1];
    }

    /**
     * Resolve author string from manifest (supports legacy 'author' and new 'authors' array).
     */
    protected function resolveAuthor(?array $manifest, object $pluginInstance): string
    {
        if ($manifest && isset($manifest['authors']) && is_array($manifest['authors'])) {
            return implode(', ', array_column($manifest['authors'], 'name'));
        }

        if ($manifest && isset($manifest['author'])) {
            return $manifest['author'];
        }

        return method_exists($pluginInstance, 'getAuthor') ? ($pluginInstance->getAuthor() ?? '') : '';
    }
}
