<?php

namespace App\Services;

use App\Models\Plugin;

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
        $plugin->update(['status' => 'enabled']);

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
        // Convert slug to class name (student_council -> StudentCouncil)
        $className = str_replace('_', '', ucwords($slug, '_'));
        $fullClass = "App\\Plugins\\{$className}\\{$className}Plugin";

        if (class_exists($fullClass)) {
            return $fullClass;
        }

        return null;
    }

    /**
     * Register plugin permissions.
     */
    public function registerPluginPermissions(object $plugin, Plugin $pluginModel): void
    {
        if (method_exists($plugin, 'getPermissions')) {
            $permissions = $plugin->getPermissions();

            foreach ($permissions as $permission) {
                $pluginModel->permissions()->firstOrCreate([
                    'name' => $permission['name'],
                    'slug' => $permission['slug'],
                ], [
                    'description' => $permission['description'] ?? '',
                    'module' => $plugin->getSlug(),
                ]);
            }
        }
    }

    /**
     * Get all enabled plugins from database.
     */
    public function getEnabledPlugins(): \Illuminate\Database\Eloquent\Collection
    {
        return Plugin::enabled()->get();
    }
}
