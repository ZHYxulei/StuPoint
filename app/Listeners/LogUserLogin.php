<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Request;

class LogUserLogin
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => Request::ip(),
        ]);
    }
}
