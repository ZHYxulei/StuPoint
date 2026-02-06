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
        $pluginManager = $this->app->make(PluginManager::class);

        // Auto-load plugins from app/Plugins directory
        $pluginDirs = glob(app_path('Plugins/*'), GLOB_ONLYDIR);

        foreach ($pluginDirs as $pluginDir) {
            $pluginFile = $pluginDir.'/'.basename($pluginDir).'Plugin.php';

            if (file_exists($pluginFile)) {
                require_once $pluginFile;

                $pluginClass = 'App\\Plugins\\'.basename($pluginDir).'\\'.basename($pluginDir, '.php');

                if (class_exists($pluginClass)) {
                    $plugin = new $pluginClass;
                    $pluginManager->registerPlugin($plugin);
                }
            }
        }

        // Boot all plugins
        $pluginManager->bootPlugins();
    }
}
