<?php

namespace App\Plugins\StudentCouncil;

use App\Models\Role;
use App\Plugins\Plugin as BasePlugin;
use App\Services\PluginManager;
use Illuminate\Support\Facades\Route;

class StudentCouncilPlugin extends BasePlugin
{
    public function getName(): string
    {
        return 'student_council';
    }

    public function getVersion(): string
    {
        return '1.0.0';
    }

    public function getSlug(): string
    {
        return 'student_council';
    }

    public function getDescription(): ?string
    {
        return '学生会插件 - 允许学生会成员组织活动和管理学生积分奖励';
    }

    public function getAuthor(): ?string
    {
        return 'System';
    }

    public function getPermissions(): array
    {
        return [
            [
                'name' => '管理活动',
                'slug' => 'manage_activities',
                'description' => '创建、编辑和删除学生会活动',
            ],
            [
                'name' => '奖励积分',
                'slug' => 'award_points',
                'description' => '为学生活动参与者奖励积分',
            ],
            [
                'name' => '查看活动报告',
                'slug' => 'view_activity_reports',
                'description' => '查看活动统计和参与情况',
            ],
        ];
    }

    public function boot(PluginManager $manager): void
    {
        // Register student council role
        $manager->addHook('plugins.booted', function () {
            Role::firstOrCreate(
                ['slug' => 'student_council'],
                [
                    'name' => '学生会',
                    'description' => '学生会成员 - 可以组织活动和管理积分奖励',
                    'is_system' => false,
                    'level' => 70,
                ]
            );
        });

        // Load routes
        $this->loadRoutes();

        // Share data with Inertia
        if (class_exists('Inertia\Inertia')) {
            \Inertia\Inertia::share('student_council_enabled', true);
        }
    }

    protected function loadRoutes(): void
    {
        Route::middleware(['web', 'auth', 'verified'])
            ->prefix('student-council')
            ->name('student_council.')
            ->group(function () {
                // Check if user has student_council role or permission
                Route::middleware(['can:student_council'])->group(function () {
                    Route::get('/dashboard', [StudentCouncilController::class, 'dashboard'])->name('dashboard');
                    Route::get('/activities', [StudentCouncilController::class, 'index'])->name('activities.index');
                    Route::get('/activities/create', [StudentCouncilController::class, 'create'])->name('activities.create');
                    Route::post('/activities', [StudentCouncilController::class, 'store'])->name('activities.store');
                    Route::get('/activities/{id}', [StudentCouncilController::class, 'show'])->name('activities.show');
                    Route::put('/activities/{id}', [StudentCouncilController::class, 'update'])->name('activities.update');
                    Route::delete('/activities/{id}', [StudentCouncilController::class, 'destroy'])->name('activities.destroy');
                    Route::post('/activities/{id}/award', [StudentCouncilController::class, 'awardPoints'])->name('activities.award');
                });
            });
    }

    public function install(): void
    {
        // Migrations are already published and run
        // Tables: council_activities, council_activity_participants, council_activity_points
    }

    public function enable(): void
    {
        // Enable student council features
    }

    public function disable(): void
    {
        // Disable student council features
    }

    public function uninstall(): void
    {
        // Note: Data cleanup should be handled separately
    }
}
