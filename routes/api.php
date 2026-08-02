<?php

use App\Http\Controllers\Api\Admin\ClassController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\PluginController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\ShopController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes - Authentication (rate limited + captcha protected)
Route::post('/auth/login', [AuthController::class, 'login'])->middleware(['throttle:5,1', 'captcha']);

// Verification code routes (public, rate limited + captcha)
Route::post('/verification/send', [VerificationController::class, 'send'])->middleware(['throttle:3,1', 'captcha']);
Route::post('/verification/verify', [VerificationController::class, 'verify'])->middleware('throttle:10,1');

// Protected routes - require authentication and approved registration
Route::middleware(['auth:api', 'registration.approved.api'])->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Points
    Route::get('/points', [PointController::class, 'index']);
    Route::get('/points/history', [PointController::class, 'history']);
    Route::get('/points/ranking', [PointController::class, 'ranking']);

    // Shop
    Route::get('/shop/products', [ShopController::class, 'products']);
    Route::post('/shop/orders', [ShopController::class, 'createOrder']);
    Route::get('/shop/orders', [ShopController::class, 'orders']);

    // Parent
    Route::prefix('/parent')->group(function () {
        Route::post('/bind-child', [ParentController::class, 'bindChild']);
        Route::get('/children', [ParentController::class, 'children']);
        Route::get('/children/{childId}/points', [ParentController::class, 'childPoints']);
        Route::get('/children/{childId}/ranking', [ParentController::class, 'childRanking']);
        Route::get('/children/{childId}/transactions', [ParentController::class, 'childTransactions']);
        Route::get('/children/{childId}/orders', [ParentController::class, 'childOrders']);
        Route::delete('/children/{childId}', [ParentController::class, 'unbindChild']);
    });

    // Admin routes
    Route::middleware(['role:super_admin,principal,grade_director'])->prefix('/admin')->group(function () {
        // Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::post('/users/{id}/adjust-points', [UserController::class, 'adjustPoints']);

        // Classes
        Route::apiResource('classes', ClassController::class);
        Route::post('/classes/{id}/teachers', [ClassController::class, 'assignTeacher']);
        Route::delete('/classes/{id}/teachers/{teacherId}', [ClassController::class, 'removeTeacher']);

        // Plugins
        Route::get('/plugins', [PluginController::class, 'index']);
        Route::post('/plugins/upload', [PluginController::class, 'upload']);
    });
});
