<?php

namespace App\Providers;

use App\Listeners\LogUserLogin;
use App\Services\SettingsService;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureLocale();
        $this->configureEvents();
        $this->configureViewShare();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function configureLocale(): void
    {
        if (class_exists('Inertia\Inertia')) {
            \Inertia\Inertia::share(array_merge([
                'locale' => App::getLocale(),
                'fallback_locale' => config('app.fallback_locale'),
            ], $this->getSharedSettings()));
        }
    }

    protected function getSharedSettings(): array
    {
        if (! Schema::hasTable('settings')) {
            return [];
        }

        return [
            'siteSettings' => [
                'site_name' => SettingsService::getSiteName(),
                'site_description' => SettingsService::get('site_description'),
                'site_keywords' => SettingsService::get('site_keywords'),
                'site_logo' => SettingsService::getSiteLogo(),
                'site_favicon' => SettingsService::getSiteFaviconHref(),
            ],
            'footerSettings' => [
                'copyright' => SettingsService::getFooterCopyright(),
                'icp' => SettingsService::getFooterIcp(),
                'police' => SettingsService::getFooterPolice(),
            ],
            'contactSettings' => [
                'email' => SettingsService::getContactEmail(),
                'phone' => SettingsService::getContactPhone(),
            ],
        ];
    }

    protected function configureEvents(): void
    {
        // Register login event listener
        Event::listen(Login::class, LogUserLogin::class);
    }

    protected function configureViewShare(): void
    {
        // Share site settings with all views
        View::composer('*', function ($view) {
            if (! Schema::hasTable('settings')) {
                return;
            }

            $view->with('siteSettings', [
                'site_name' => SettingsService::getSiteName(),
                'site_description' => SettingsService::get('site_description'),
                'site_keywords' => SettingsService::get('site_keywords'),
                'site_logo' => SettingsService::getSiteLogo(),
                'site_favicon' => SettingsService::getSiteFaviconHref(),
            ]);

            $view->with('footerSettings', [
                'copyright' => SettingsService::getFooterCopyright(),
                'icp' => SettingsService::getFooterIcp(),
                'police' => SettingsService::getFooterPolice(),
            ]);

            $view->with('contactSettings', [
                'email' => SettingsService::getContactEmail(),
                'phone' => SettingsService::getContactPhone(),
            ]);
        });
    }
}
