<?php

namespace Plugins\NoticeBoard;

use App\Models\Role;
use Plugins\Plugin as BasePlugin;
use App\Services\PluginManager;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Throwable;

class NoticeBoardPlugin extends BasePlugin
{
    public function getName(): string
    {
        return 'notice_board';
    }

    public function getVersion(): string
    {
        return '1.0.0';
    }

    public function getSlug(): string
    {
        return 'notice_board';
    }

    public function getDescription(): ?string
    {
        return '简单的公告栏插件，支持发布和管理公告信息';
    }

    public function getAuthor(): ?string
    {
        return 'StuPoint';
    }

    /**
     * Define permissions this plugin provides.
     */
    public function getPermissions(): array
    {
        return [
            [
                'name' => '发布公告',
                'slug' => 'publish_notice',
                'description' => '创建和发布公告',
            ],
            [
                'name' => '管理公告',
                'slug' => 'manage_notice',
                'description' => '编辑、删除和置顶公告',
            ],
        ];
    }

    /**
     * Called when the plugin is booted (app startup).
     * Register routes, share data, set up hooks here.
     */
    public function boot(PluginManager $manager): void
    {
        // Register a custom hook for other plugins to extend
        $manager->addHook('plugins.booted', function () {
            // Ensure the notice_board role exists for publishers
            if ($this->canManageRoles()) {
                Role::firstOrCreate(
                    ['slug' => 'notice_publisher'],
                    [
                        'name' => '公告发布员',
                        'description' => '可以发布公告的用户',
                        'is_system' => false,
                        'level' => 50,
                    ]
                );
            }
        });

        // Register routes
        $this->loadRoutes();
    }

    /**
     * Load plugin routes.
     */
    protected function loadRoutes(): void
    {
        Route::middleware(['web', 'auth', 'verified'])
            ->prefix('notices')
            ->name('notices.')
            ->group(function () {
                // Public: anyone can view notices
                Route::get('/', [NoticeBoardController::class, 'index'])->name('index');
                Route::get('/{id}', [NoticeBoardController::class, 'show'])->name('show');

                // Protected: only publishers can manage
                Route::middleware(['permission:notice_board'])->group(function () {
                    Route::get('/create', [NoticeBoardController::class, 'create'])->name('create');
                    Route::post('/', [NoticeBoardController::class, 'store'])->name('store');
                    Route::put('/{id}', [NoticeBoardController::class, 'update'])->name('update');
                    Route::delete('/{id}', [NoticeBoardController::class, 'destroy'])->name('destroy');
                });
            });
    }

    protected function canManageRoles(): bool
    {
        if (! file_exists(storage_path('installed'))) {
            return false;
        }

        try {
            return Schema::hasTable('roles');
        } catch (Throwable) {
            return false;
        }
    }

    /**
     * Called when the plugin is installed for the first time.
     * Use this to run migrations, seed data, etc.
     */
    public function install(): void
    {
        // Create the notices table
        if (! Schema::hasTable('notices')) {
            \Schema::create('notices', function ($table) {
                $table->id();
                $table->string('title');
                $table->text('content')->nullable();
                $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
                $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
                $table->boolean('is_pinned')->default(false);
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Called when the plugin is enabled.
     */
    public function enable(): void
    {
        // Nothing special needed on enable
    }

    /**
     * Called when the plugin is disabled.
     */
    public function disable(): void
    {
        // Nothing special needed on disable
    }

    /**
     * Called when the plugin is uninstalled.
     * Clean up data, drop tables, etc.
     */
    public function uninstall(): void
    {
        // Drop the notices table
        if (Schema::hasTable('notices')) {
            Schema::dropIfExists('notices');
        }
    }
}
