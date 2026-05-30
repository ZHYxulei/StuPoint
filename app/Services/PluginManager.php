<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Process;

class PluginManager
{
    protected array $plugins = [];

    protected array $hooks = [];

    protected array $bootedPlugins = [];

    /**
     * Register a plugin.
     */
    public function registerPlugin(object $plugin): void
    {
        $name = method_exists($plugin, 'getName') ? $plugin->getName() : get_class($plugin);
        $this->plugins[$name] = $plugin;
        $this->bootedPlugins[$name] = false;
    }

    /**
     * Boot all registered plugins.
     */
    public function bootPlugins(): void
    {
        foreach ($this->plugins as $name => $plugin) {
            if (! $this->bootedPlugins[$name]) {
                if (method_exists($plugin, 'boot')) {
                    $plugin->boot($this);
                }
                $this->bootedPlugins[$name] = true;
            }
        }
    }

    /**
     * Get all registered plugins.
     */
    public function getPlugins(): array
    {
        return $this->plugins;
    }

    /**
     * Get a specific plugin by name.
     */
    public function getPlugin(string $name): ?object
    {
        return $this->plugins[$name] ?? null;
    }

    /**
     * Add a hook callback.
     */
    public function addHook(string $hook, callable $callback): void
    {
        if (! isset($this->hooks[$hook])) {
            $this->hooks[$hook] = [];
        }
        $this->hooks[$hook][] = $callback;
    }

    /**
     * Execute a hook and return the first non-null result.
     */
    public function executeHook(string $hook, ...$args): mixed
    {
        foreach ($this->hooks[$hook] ?? [] as $callback) {
            $result = $callback(...$args);
            if ($result !== null) {
                return $result;
            }
        }

        return null;
    }

    /**
     * Enable a plugin in the database.
     */
    public function enablePlugin(Plugin $plugin): void
    {
        // Check plugin dependencies before enabling
        $manifest = $this->readManifest($plugin->slug);
        if ($manifest) {
            $this->checkPluginDependencies($manifest);
        }

        $plugin->update(['status' => 'enabled', 'enabled_at' => now()]);

        // Boot the plugin
        $pluginInstance = $this->loadPluginInstance($plugin);
        if ($pluginInstance && method_exists($pluginInstance, 'enable')) {
            $pluginInstance->enable();
        }

        $this->registerPlugin($pluginInstance);
        $pluginInstance->boot($this);
    }

    /**
     * Disable a plugin in the database.
     */
    public function disablePlugin(Plugin $plugin): void
    {
        $plugin->update(['status' => 'disabled']);

        // Call plugin disable method
        $pluginInstance = $this->loadPluginInstance($plugin);
        if ($pluginInstance && method_exists($pluginInstance, 'disable')) {
            $pluginInstance->disable();
        }
    }

    /**
     * Uninstall a plugin.
     */
    public function uninstallPlugin(Plugin $plugin): void
    {
        // Call plugin uninstall method
        $pluginInstance = $this->loadPluginInstance($plugin);
        if ($pluginInstance && method_exists($pluginInstance, 'uninstall')) {
            $pluginInstance->uninstall();
        }

        $plugin->delete();
    }

    /**
     * Reload a plugin.
     */
    public function reloadPlugin(Plugin $plugin): void
    {
        if ($plugin->status === 'enabled') {
            $this->disablePlugin($plugin);
            $this->enablePlugin($plugin);
        }
    }

    /**
     * Load plugin instance from database record.
     */
    public function loadPluginInstance(Plugin $plugin): ?object
    {
        $pluginClass = $this->getPluginClass($plugin->slug);

        if (! $pluginClass || ! class_exists($pluginClass)) {
            return null;
        }

        return new $pluginClass;
    }

    /**
     * Get plugin class from slug.
     */
    public function getPluginClass(string $slug): ?string
    {
        // Try reading class from manifest.json first
        $manifest = $this->readManifest($slug);
        if ($manifest && isset($manifest['class'])) {
            $className = $manifest['class'];
            $dirName = str_replace('_', '', ucwords($slug, '_'));
            $fullClass = "Plugins\\{$dirName}\\{$className}";

            if (class_exists($fullClass)) {
                return $fullClass;
            }
        }

        // Fallback: convert slug to class name (student_council -> StudentCouncil)
        $className = str_replace('_', '', ucwords($slug, '_'));
        $fullClass = "Plugins\\{$className}\\{$className}Plugin";

        if (class_exists($fullClass)) {
            return $fullClass;
        }

        return null;
    }

    /**
     * Read manifest.json from a plugin directory.
     */
    public function readManifest(string $slug): ?array
    {
        $dirName = str_replace('_', '', ucwords($slug, '_'));
        $jsonPath = base_path("plugins/{$dirName}/manifest.json");

        if (! file_exists($jsonPath)) {
            // Try with original slug (lowercase)
            $jsonPath = base_path("plugins/{$slug}/manifest.json");
        }

        if (! file_exists($jsonPath)) {
            return null;
        }

        try {
            $content = file_get_contents($jsonPath);

            return json_decode($content, true);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Check and install composer dependencies for a plugin.
     */
    public function installComposerDependencies(Plugin $plugin): array
    {
        $manifest = $this->readManifest($plugin->slug);

        if (! $manifest || empty($manifest['dependencies']['composer'])) {
            return ['installed' => [], 'message' => '无 Composer 依赖'];
        }

        $composerDeps = $manifest['dependencies']['composer'];
        $packages = [];

        foreach ($composerDeps as $package => $constraint) {
            // Validate package name format (vendor/package)
            if (! preg_match('/^[a-z0-9]([_.-]?[a-z0-9]+)*\/[a-z0-9]([_.-]?[a-z0-9]+)*$/', $package)) {
                return ['installed' => [], 'message' => "无效的包名: {$package}"];
            }
            // Validate version constraint format
            if (! preg_match('/^[~^>=<]*[\d\.\*]+(-[a-z0-9.]+)?$/', $constraint)) {
                return ['installed' => [], 'message' => "无效的版本约束: {$constraint}"];
            }
            $packages[] = "{$package}:{$constraint}";
        }

        if (empty($packages)) {
            return ['installed' => [], 'message' => '无 Composer 依赖'];
        }

        try {
            $result = Process::run(array_merge(['composer', 'require'], $packages, ['--no-interaction']));

            if ($result->successful()) {
                return [
                    'installed' => array_keys($composerDeps),
                    'message' => 'Composer 依赖安装成功: ' . implode(', ', array_keys($composerDeps)),
                ];
            }

            return [
                'installed' => [],
                'message' => 'Composer 依赖安装失败: ' . $result->errorOutput(),
            ];
        } catch (\Throwable $e) {
            return [
                'installed' => [],
                'message' => 'Composer 依赖安装异常: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check if all plugin dependencies are satisfied.
     *
     * @throws \RuntimeException
     */
    protected function checkPluginDependencies(array $manifest): void
    {
        if (empty($manifest['dependencies']['plugins'])) {
            return;
        }

        $missing = [];

        foreach ($manifest['dependencies']['plugins'] as $dependencySlug) {
            $dependency = Plugin::where('slug', $dependencySlug)
                ->where('status', 'enabled')
                ->first();

            if (! $dependency) {
                $missing[] = $dependencySlug;
            }
        }

        if (! empty($missing)) {
            throw new \RuntimeException(
                '插件依赖未满足，请先启用以下插件: ' . implode(', ', $missing)
            );
        }
    }

    /**
     * Get all enabled plugins from database.
     */
    public function getEnabledPlugins(): Collection
    {
        return Plugin::enabled()->get();
    }

    /**
     * Get all plugin slugs that are enabled.
     */
    public function getEnabledPluginSlugs(): array
    {
        return Plugin::enabled()->pluck('slug')->toArray();
    }
}
