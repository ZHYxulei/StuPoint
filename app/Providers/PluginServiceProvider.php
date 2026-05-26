<?php

namespace App\Providers;

use App\Services\PluginManager;
use Illuminate\Support\ServiceProvider;

class PluginServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(PluginManager::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        // During installation, the database is not configured yet.
        // Avoid booting plugins that may touch the database.
        if (! file_exists(storage_path('installed'))) {
            return;
        }

        $pluginManager = $this->app->make(PluginManager::class);

        // Auto-load plugins from plugins/ directory
        $pluginDirs = glob(base_path('plugins/*'), GLOB_ONLYDIR);

        foreach ($pluginDirs as $pluginDir) {
            $manifestPath = $pluginDir.'/manifest.json';

            // Try manifest.json for class name, fallback to convention
            $pluginClass = null;
            if (file_exists($manifestPath)) {
                try {
                    $manifest = json_decode(file_get_contents($manifestPath), true);
                    if ($manifest && isset($manifest['class'])) {
                        $dirName = basename($pluginDir);
                        $pluginClass = "Plugins\\{$dirName}\\{$manifest['class']}";
                    }
                } catch (\Throwable) {
                    // fallback below
                }
            }

            if (! $pluginClass) {
                $pluginClass = 'Plugins\\'.basename($pluginDir).'\\'.basename($pluginDir).'Plugin';
            }

            if (class_exists($pluginClass)) {
                $plugin = new $pluginClass;
                $pluginManager->registerPlugin($plugin);
            }
        }

        // Boot all plugins
        $pluginManager->bootPlugins();

        $pluginManager->executeHook('plugins.booted');
    }
}
