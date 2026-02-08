<?php

use App\Http\Controllers\Admin\ClassManagementController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\OrderVerificationController;
use App\Http\Controllers\Admin\PluginController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    // System Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::post('/plugin-sources', [SettingsController::class, 'storePluginSource'])->name('plugin-sources.store');
        Route::put('/plugin-sources/{id}', [SettingsController::class, 'updatePluginSource'])->name('plugin-sources.update');
        Route::delete('/plugin-sources/{id}', [SettingsController::class, 'deletePluginSource'])->name('plugin-sources.delete');
        Route::post('/plugin-sources/{id}/test', [SettingsController::class, 'testPluginSource'])->name('plugin-sources.test');
    });

    // User Management
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/statistics', [UserController::class, 'statistics'])->name('statistics');
        Route::get('/{id}', [UserController::class, 'show'])->name('show');
        Route::get('/{id}/transactions', [UserController::class, 'transactions'])->name('transactions');
        Route::put('/{id}', [UserController::class, 'update'])->name('update');
        Route::put('/{id}/roles', [UserController::class, 'updateRoles'])->name('updateRoles');
        Route::put('/{id}/password', [UserController::class, 'updatePassword'])->name('updatePassword');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/adjust-points', [UserController::class, 'adjustPoints'])->name('adjustPoints');
    });

    // Product Management
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [AdminProductController::class, 'index'])->name('index');
        Route::get('/create', [AdminProductController::class, 'create'])->name('create');
        Route::post('/', [AdminProductController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminProductController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminProductController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminProductController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/statistics', [AdminProductController::class, 'statistics'])->name('statistics');
    });

    // Order Management
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->name('index');
        Route::get('/{id}', [AdminOrderController::class, 'show'])->name('show');
        Route::put('/{id}/status', [AdminOrderController::class, 'updateStatus'])->name('updateStatus');
        Route::get('/statistics', [AdminOrderController::class, 'statistics'])->name('statistics');
        Route::post('/{id}/verify', [OrderVerificationController::class, 'verify'])->name('verify');
    });

    // Plugin Management
    Route::prefix('plugins')->name('plugins.')->group(function () {
        Route::get('/', [PluginController::class, 'index'])->name('index');
        Route::get('/{id}', [PluginController::class, 'show'])->name('show');
        Route::post('/install', [PluginController::class, 'install'])->name('install');
        Route::post('/upload', [PluginController::class, 'upload'])->name('upload');
        Route::post('/{id}/enable', [PluginController::class, 'enable'])->name('enable');
        Route::post('/{id}/disable', [PluginController::class, 'disable'])->name('disable');
        Route::delete('/{id}', [PluginController::class, 'uninstall'])->name('uninstall');
        Route::put('/{id}/config', [PluginController::class, 'updateConfig'])->name('updateConfig');
    });

    // Class Management
    Route::prefix('classes')->name('classes.')->group(function () {
        Route::get('/', [ClassManagementController::class, 'index'])->name('index');
        Route::get('/create', [ClassManagementController::class, 'create'])->name('create');
        Route::post('/', [ClassManagementController::class, 'store'])->name('store');
        Route::get('/{id}', [ClassManagementController::class, 'show'])->name('show');
        Route::get('/{id}/edit', [ClassManagementController::class, 'edit'])->name('edit');
        Route::put('/{id}', [ClassManagementController::class, 'update'])->name('update');
        Route::delete('/{id}', [ClassManagementController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/teachers', [ClassManagementController::class, 'assignTeacher'])->name('assignTeacher');
        Route::delete('/{id}/teachers/{teacherId}', [ClassManagementController::class, 'removeTeacher'])->name('removeTeacher');
        Route::post('/{id}/students', [ClassManagementController::class, 'addStudent'])->name('addStudent');
        Route::delete('/{id}/students/{studentId}', [ClassManagementController::class, 'removeStudent'])->name('removeStudent');
    });

    // Subject Management
    Route::prefix('subjects')->name('subjects.')->group(function () {
        Route::get('/', [SubjectController::class, 'index'])->name('index');
        Route::get('/create', [SubjectController::class, 'create'])->name('create');
        Route::post('/', [SubjectController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [SubjectController::class, 'edit'])->name('edit');
        Route::put('/{id}', [SubjectController::class, 'update'])->name('update');
        Route::delete('/{id}', [SubjectController::class, 'destroy'])->name('destroy');
    });
});
