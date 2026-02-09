<?php

namespace App\Listeners;

use App\Events\RegistrationStatusChanged;
use App\Mail\RegistrationApproved;
use App\Mail\RegistrationRejected;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

class SendRegistrationStatusNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(RegistrationStatusChanged $event): void
    {
        $user = $event->user;

        // Only send notifications for approved or rejected status
        if (! in_array($event->newStatus, ['approved', 'rejected'])) {
            return;
        }

        // Send email if user has email address
        if ($user->email) {
            try {
                if ($event->newStatus === 'approved') {
                    Mail::to($user->email)->send(new RegistrationApproved($user, $event->reviewer));
                } elseif ($event->newStatus === 'rejected') {
                    Mail::to($user->email)->send(new RegistrationRejected($user, $event->reviewer, $event->reason));
                }
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('Failed to send registration status email', [
                    'user_id' => $user->id,
                    'status' => $event->newStatus,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
