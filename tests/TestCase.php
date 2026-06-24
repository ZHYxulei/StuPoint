<?php

namespace Tests;

use App\Traits\HasRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure installation middleware doesn't block tests
        $installedPath = storage_path('installed');
        if (! file_exists($installedPath)) {
            touch($installedPath);
        }

        // Clear static role cache between tests
        HasRoles::$roleSlugCache = [];

        // Ensure Passport keys exist
        Artisan::call('passport:keys', ['--no-interaction' => true]);

        // Run Passport migrations (vendor migrations not in default path)
        Artisan::call('migrate', [
            '--path' => 'vendor/laravel/passport/database/migrations',
            '--no-interaction' => true,
        ]);
    }
}
