<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
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

        // Get all available plugin files
        $pluginFiles = glob(base_path('plugins/*/*Plugin.php'));
        $availablePlugins = [];

        foreach ($pluginFiles as $file) {
            $className = $this->getClassNameFromFile($file);
            if ($className && class_exists($className)) {
                $pluginInstance = new $className;
                if ($pluginInstance instanceof \App\Plugins\Plugin) {
                    $slug = $pluginInstance->getSlug();
                    $availablePlugins[$slug] = [
                        'name' => $pluginInstance->getName(),
                        'version' => $pluginInstance->getVersion(),
                        'description' => $pluginInstance->getDescription() ?? '',
                        'author' => $pluginInstance->getAuthor() ?? '',
                        'installed' => Plugin::where('slug', $slug)->exists(),
                    ];
                }
            }
        }

        return inertia('admin/plugins/index', [
            'plugins' => $plugins,
            'availablePlugins' => $availablePlugins,
        ]);
    }

    /**
     * Show plugin details.
     */
    public function show(string $id)
    {
        $plugin = Plugin::with('permissions')->findOrFail($id);

        return inertia('admin/plugins/show', [
            'plugin' => $plugin,
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

            // Create plugin record
            $plugin = Plugin::create([
                'name' => $pluginInstance->getName(),
                'slug' => $pluginInstance->getSlug(),
                'version' => $pluginInstance->getVersion(),
                'description' => $pluginInstance->getDescription() ?? '',
                'author' => $pluginInstance->getAuthor() ?? '',
                'status' => 'installed',
            ]);

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
}
