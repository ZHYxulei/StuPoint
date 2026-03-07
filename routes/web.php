<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\Points\PointController;
use App\Http\Controllers\RankingController;
use App\Http\Controllers\Shop\OrderController;
use App\Http\Controllers\Shop\ProductController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [HomeController::class, 'index'])->name('home');

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