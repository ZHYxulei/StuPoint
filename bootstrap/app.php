<?php

use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\CheckRegistrationStatus;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EnsureApiUserIsApproved;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\InstallationMiddleware;
use App\Http\Middleware\UseFileSessionDuringInstallation;
use App\Http\Middleware\VerifyCaptcha;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Sentry\Laravel\Integration;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

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
            'role' => CheckRole::class,
            'captcha' => VerifyCaptcha::class,
            'registration.approved.api' => EnsureApiUserIsApproved::class,
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
        Integration::handles($exceptions);

        // API-specific exception handling
        $exceptions->render(function (ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => '资源不存在',
                    'error' => 'not_found',
                ], 404);
            }
        });

        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => '未认证',
                    'error' => 'unauthenticated',
                ], 401);
            }
        });

        $exceptions->render(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => '数据验证失败',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (HttpExceptionInterface $e, $request) {
            if ($request->is('api/*')) {
                $status = $e->getStatusCode();
                $messages = [
                    403 => '权限不足',
                    404 => '资源不存在',
                    405 => '方法不允许',
                    429 => '请求过于频繁',
                    500 => '服务器内部错误',
                ];

                return response()->json([
                    'success' => false,
                    'message' => $messages[$status] ?? $e->getMessage() ?: '请求错误',
                    'error' => strtolower(str_replace(' ', '_', HttpExceptionInterface::class)),
                ], $status);
            }
        });

        if (config('app.hide_error_details')) {
            $exceptions->render(function (Throwable $e) {
                $status = 500;

                if ($e instanceof HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                }

                return response((string) $status, $status)->header('Content-Type', 'text/plain; charset=UTF-8');
            });
        }
    })->create();
