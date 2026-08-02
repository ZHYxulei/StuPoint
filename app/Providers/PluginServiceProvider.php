<?php

namespace App\Providers;

use App\Services\PluginManager;
use Illuminate\Support\Facades\Schema;
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
    public function boot(PluginManager $pluginManager): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        // During installation, the database is not configured yet.
        if (! file_exists(storage_path('installed'))) {
            return;
        }

        try {
            if (! Schema::hasTable('plugins')) {
                return;
            }
        } catch (\Throwable) {
            return;
        }

        $pluginManager->bootEnabledPlugins();
        $pluginManager->executeHook('plugins.booted');
    }
}
