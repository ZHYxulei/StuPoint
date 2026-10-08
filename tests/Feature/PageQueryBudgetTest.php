<?php

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

/**
 * Every query is a network round trip against the configured database, so the
 * count per page render is what decides how the app feels on a slow link.
 */
function queriesFor(callable $request): int
{
    DB::flushQueryLog();
    DB::enableQueryLog();

    $request();

    return count(DB::getQueryLog());
}

it('renders the dashboard within a small query budget', function () {
    $student = User::factory()->approved()
        ->withRole(Role::factory()->student()->create())
        ->create();

    UserPoint::create([
        'user_id' => $student->id,
        'total_points' => 10,
        'redeemable_points' => 5,
    ]);

    Setting::set('site_name', 'StuPoint', 'string', 'site');
    Setting::set('footer_icp', 'ICP-1', 'string', 'footer');

    $count = queriesFor(function () use ($student) {
        $this->actingAs($student)->get('/dashboard')->assertOk();
    });

    expect($count)->toBeLessThanOrEqual(10);
});

it('renders the settings page without reading settings key by key', function () {
    $admin = User::factory()->approved()
        ->withRole(Role::factory()->superAdmin()->create())
        ->create();

    Setting::set('site_name', 'StuPoint', 'string', 'site');
    Setting::set('mail_host', 'smtp.example.com', 'string', 'mail');
    Setting::set('captcha_provider', 'log', 'string', 'captcha');

    // Warm caches so the budget measures steady-state rendering.
    $this->actingAs($admin)->get('/admin/settings')->assertOk();

    $count = queriesFor(function () use ($admin) {
        $this->actingAs($admin)->get('/admin/settings')->assertOk();
    });

    expect($count)->toBeLessThanOrEqual(12);
});
