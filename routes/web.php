<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\Points\PointController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

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
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/product/{id}', [ProductController::class, 'show'])->name('product');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{id}', [OrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{id}/regenerate-code', [OrderController::class, 'regenerateVerificationCode'])->name('orders.regenerate-code');
});

// Parent routes
Route::middleware(['auth', 'verified'])->prefix('parent')->name('parent.')->group(function () {
    Route::prefix('children')->name('children.')->group(function () {
        Route::get('/', [ParentController::class, 'index'])->name('index');
        Route::get('/create', [ParentController::class, 'create'])->name('create');
        Route::post('/', [ParentController::class, 'store'])->name('store');
        Route::get('/{childId}', [ParentController::class, 'show'])->name('show');
        Route::delete('/{childId}', [ParentController::class, 'destroy'])->name('destroy');
        Route::get('/{childId}/transactions', [ParentController::class, 'transactions'])->name('transactions');
        Route::get('/{childId}/orders', [ParentController::class, 'orders'])->name('orders');
    });
});

require __DIR__.'/settings.php';
