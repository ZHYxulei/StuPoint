<?php

use App\Http\Controllers\Install\InstallController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Install Routes
|--------------------------------------------------------------------------
|
| These routes are used for the initial installation wizard.
|
*/

Route::get('/install', [InstallController::class, 'welcome'])
    ->name('install.welcome');

Route::get('/install/language', [InstallController::class, 'language'])
    ->name('install.language');

Route::post('/install/language', [InstallController::class, 'storeLanguage'])
    ->name('install.language.store');

Route::post('/install/check', [InstallController::class, 'checkEnvironment'])
    ->name('install.check.environment');

Route::get('/install/check', [InstallController::class, 'check'])
    ->name('install.check');

Route::get('/install/database', [InstallController::class, 'database'])
    ->name('install.database');

Route::post('/install/database', [InstallController::class, 'storeDatabase'])
    ->name('install.database.store');

Route::get('/install/redis', [InstallController::class, 'redis'])
    ->name('install.redis');

Route::post('/install/redis', [InstallController::class, 'storeRedis'])
    ->name('install.redis.store');

Route::get('/install/cache', [InstallController::class, 'cache'])
    ->name('install.cache');

Route::post('/install/cache', [InstallController::class, 'storeCache'])
    ->name('install.cache.store');

Route::get('/install/site', [InstallController::class, 'site'])
    ->name('install.site');

Route::post('/install/site', [InstallController::class, 'storeSite'])
    ->name('install.site.store');

Route::get('/install/account', [InstallController::class, 'account'])
    ->name('install.account');

Route::post('/install/account', [InstallController::class, 'storeAccount'])
    ->name('install.account.store');

Route::get('/install/complete', [InstallController::class, 'complete'])
    ->name('install.complete');
