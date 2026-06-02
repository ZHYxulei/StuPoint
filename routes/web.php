<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\Points\PointController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\ShopController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('about', [AboutController::class, 'index'])->name('about')
    ->middleware(['auth', 'verified']);

// API route for user stats (called by frontend)
Route::get('/api/user-stats', [HomeController::class, 'userStats'])
    ->middleware(['auth', 'verified'])
    ->name('api.user-stats');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Ranking route (public)
Route::get('/ranking', [RankingController::class, 'index'])->name('ranking');

// Points routes
Route::middleware(['auth', 'verified'])->prefix('points')->name('points.')->group(function () {
    Route::get('/', [PointController::class, 'index'])->name('index');
    Route::get('/history', [PointController::class, 'history'])->name('history');
});

// Shop routes
Route::middleware(['auth', 'verified'])->prefix('shop')->name('shop.')->group(function () {
    Route::get('/', [ShopController::class, 'index'])->name('index');
    Route::get('/{id}', [ShopController::class, 'show'])->name('show');
    Route::get('/orders/list', [ShopController::class, 'orders'])->name('orders');
    Route::get('/orders/{id}', [ShopController::class, 'orderDetail'])->name('orderDetail');
});

// Parent routes
Route::middleware(['auth', 'verified'])->prefix('parent')->name('parent.')->group(function () {
    Route::get('/children', [ParentController::class, 'index'])->name('children.index');
    Route::get('/children/create', [ParentController::class, 'create'])->name('children.create');
    Route::post('/children', [ParentController::class, 'store'])->name('children.store');
    Route::get('/children/{childId}', [ParentController::class, 'show'])->name('children.show');
    Route::get('/children/{childId}/transactions', [ParentController::class, 'transactions'])->name('children.transactions');
    Route::get('/children/{childId}/orders', [ParentController::class, 'orders'])->name('children.orders');
    Route::delete('/children/{childId}', [ParentController::class, 'destroy'])->name('children.destroy');
});
