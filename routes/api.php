<?php

use App\Http\Controllers\Api\Admin\ClassController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\PointController;
use App\Http\Controllers\Api\ShopController;
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

// Public routes - Authentication
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes - require authentication
Route::middleware('auth:api')->group(function () {
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
        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
        Route::post('/users/{id}/adjust-points', [\App\Http\Controllers\Api\UserController::class, 'adjustPoints']);

        // Classes
        Route::apiResource('classes', ClassController::class);
        Route::post('/classes/{id}/teachers', [ClassController::class, 'assignTeacher']);
        Route::delete('/classes/{id}/teachers/{teacherId}', [ClassController::class, 'removeTeacher']);

        // Plugins
        Route::get('/plugins', [\App\Http\Controllers\Api\PluginController::class, 'index']);
        Route::post('/plugins/upload', [\App\Http\Controllers\Api\PluginController::class, 'upload']);
    });
});
