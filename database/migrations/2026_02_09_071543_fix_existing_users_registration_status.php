<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix existing users who don't require review but have pending status
        User::where('requires_review', false)
            ->where('registration_status', 'pending')
            ->update([
                'registration_status' => 'approved',
                'email_verified_at' => \DB::raw('COALESCE(email_verified_at, NOW())'),
            ]);

        // Also handle NULL registration_status - set to approved if doesn't require review
        User::whereNull('registration_status')
            ->where('requires_review', false)
            ->update([
                'registration_status' => 'approved',
                'email_verified_at' => \DB::raw('COALESCE(email_verified_at, NOW())'),
            ]);

        // For NULL registration_status that requires review, set to pending
        User::whereNull('registration_status')
            ->where('requires_review', true)
            ->update([
                'registration_status' => 'pending',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert changes - set back to pending or NULL
        User::where('registration_status', 'approved')
            ->where('requires_review', false)
            ->update([
                'registration_status' => 'pending',
            ]);
    }
};
