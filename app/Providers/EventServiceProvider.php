<?php

namespace App\Providers;

use App\Events\RegistrationStatusChanged;
use App\Listeners\SendRegistrationStatusNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        RegistrationStatusChanged::class => [
            SendRegistrationStatusNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
