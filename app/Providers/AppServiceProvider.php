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
use Inertia\Inertia;
use Throwable;

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
        $this->configurePassport();
        $this->configureEvents();

        if ($this->app->runningInConsole()) {
            return;
        }

        $this->configureLocale();
        $this->configureViewShare();

        // Apply mail settings from database (if configured)
        if (file_exists(storage_path('installed'))) {
            \App\Services\MailConfigService::apply();
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        // Configure SSL CA certificate bundle for cURL/PHP
        // Uses project-bundled cacert.pem to fix "unable to get local issuer certificate"
        $caCertPath = base_path('storage/certs/cacert.pem');
        if (file_exists($caCertPath) && empty(env('CURL_CA_BUNDLE')) && empty(env('SSL_CERT_FILE'))) {
            putenv("CURL_CA_BUNDLE={$caCertPath}");
            putenv("SSL_CERT_FILE={$caCertPath}");
        }

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
            Inertia::share(array_merge([
                'locale' => App::getLocale(),
                'fallback_locale' => config('app.fallback_locale'),
            ], $this->getSharedSettings()));
        }
    }

    protected function getSharedSettings(): array
    {
        if (! $this->hasSettingsTable()) {
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
            if (! $this->hasSettingsTable()) {
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

    protected function hasSettingsTable(): bool
    {
        if (! $this->canAccessSettings()) {
            return false;
        }

        try {
            return Schema::hasTable('settings');
        } catch (Throwable) {
            return false;
        }
    }

    protected function canAccessSettings(): bool
    {
        // Before installation completes, the database may not be configured yet.
        if (! file_exists(storage_path('installed'))) {
            return false;
        }

        $defaultConnection = config('database.default');

        if ($defaultConnection !== 'sqlite') {
            return true;
        }

        $databasePath = config('database.connections.sqlite.database');

        if (! $databasePath || $databasePath === ':memory:') {
            return false;
        }

        return file_exists($databasePath);
    }

    protected function configurePassport(): void
    {
        if (class_exists(\Laravel\Passport\Passport::class)) {
            \Laravel\Passport\Passport::tokensExpireIn(now()->addDays(15));
            \Laravel\Passport\Passport::refreshTokensExpireIn(now()->addDays(30));
            \Laravel\Passport\Passport::personalAccessTokensExpireIn(now()->addDays(30));
        }
    }
}
