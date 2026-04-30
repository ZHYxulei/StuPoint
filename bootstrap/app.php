<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\CheckRegistrationStatus;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\InstallationMiddleware;
use App\Http\Middleware\UseFileSessionDuringInstallation;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withCommands([
        __DIR__.'/../app/Console/Commands',
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware(['web', UseFileSessionDuringInstallation::class])
                ->group(base_path('routes/install.php'));
            Route::middleware('web')
                ->group(base_path('routes/admin.php'));
            Route::middleware('web')
                ->group(base_path('routes/settings.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'theme_color', 'sidebar_state']);

        $middleware->alias([
            'permission' => CheckPermission::class,
        ]);

        $middleware->web(append: [
            CheckRegistrationStatus::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            InstallationMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        if (config('app.hide_error_details')) {
            $exceptions->render(function (\Throwable $e) {
                $status = 500;

                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                }

                return response((string) $status, $status)->header('Content-Type', 'text/plain; charset=UTF-8');
            });
        }
    })->create();
