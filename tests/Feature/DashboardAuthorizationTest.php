<?php

use App\Models\PointTransaction;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('limits ordinary users to their own dashboard data', function () {
    $studentRole = Role::factory()->student()->create();

    $student = User::factory()->approved()->withRole($studentRole)->create([
        'name' => 'Student User',
        'email' => 'student@example.com',
    ]);

    $otherUser = User::factory()->approved()->withRole($studentRole)->create([
        'name' => 'Other Student',
        'email' => 'other@example.com',
    ]);

    UserPoint::create([
        'user_id' => $student->id,
        'total_points' => 120,
        'redeemable_points' => 80,
    ]);

    UserPoint::create([
        'user_id' => $otherUser->id,
        'total_points' => 999,
        'redeemable_points' => 999,
    ]);

    PointTransaction::create([
        'user_id' => $student->id,
        'type' => 'total',
        'amount' => 15,
        'balance_after' => 120,
        'source' => 'manual_adjust',
        'description' => 'Own reward',
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);

    PointTransaction::create([
        'user_id' => $otherUser->id,
        'type' => 'total',
        'amount' => 500,
        'balance_after' => 999,
        'source' => 'manual_adjust',
        'description' => 'Other reward',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = actingAs($student)->get(route('dashboard'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('canViewGlobalDashboard', false)
            ->where('totalUsers', null)
            ->where('todayAdded', null)
            ->where('todayDeducted', null)
            ->where('todayTransactions', null)
            ->has('topUsers', 0)
            ->has('userPoints', fn (Assert $userPoints) => $userPoints
                ->where('total_points', 120)
                ->where('redeemable_points', 80)
                ->etc()
            )
            ->has('recentTransactions', 1, fn (Assert $transaction) => $transaction
                ->where('user_id', $student->id)
                ->where('user_name', 'Student User')
                ->where('description', 'Own reward')
                ->missing('email')
                ->etc()
            )
        );

    expect(json_encode($response->inertiaProps()))
        ->not->toContain('other@example.com')
        ->not->toContain('Other Student')
        ->not->toContain('Other reward');
});

it('does not expose school-wide dashboard data to scoped staff roles', function (string $roleState) {
    $staffRole = Role::factory()->{$roleState}()->create();
    $studentRole = Role::factory()->student()->create();

    $staff = User::factory()->approved()->withRole($staffRole)->create([
        'name' => 'Scoped Staff',
        'email' => 'scoped-staff@example.com',
        'is_head_teacher' => $roleState === 'headTeacher',
    ]);

    $otherStudent = User::factory()->approved()->withRole($studentRole)->create([
        'name' => 'Unrelated Student',
        'email' => 'unrelated@example.com',
    ]);

    UserPoint::create([
        'user_id' => $staff->id,
        'total_points' => 10,
        'redeemable_points' => 10,
    ]);

    UserPoint::create([
        'user_id' => $otherStudent->id,
        'total_points' => 999,
        'redeemable_points' => 999,
    ]);

    PointTransaction::create([
        'user_id' => $otherStudent->id,
        'type' => 'total',
        'amount' => 999,
        'balance_after' => 999,
        'source' => 'manual_adjust',
        'description' => 'Unrelated school-wide transaction',
    ]);

    $response = actingAs($staff)->get(route('dashboard'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('canViewGlobalDashboard', false)
            ->where('totalUsers', null)
            ->has('topUsers', 0)
            ->has('recentTransactions', 0)
        );

    expect(json_encode($response->inertiaProps()))
        ->not->toContain('unrelated@example.com')
        ->not->toContain('Unrelated Student')
        ->not->toContain('Unrelated school-wide transaction');
})->with([
    'head teacher' => 'headTeacher',
    'grade director' => 'gradeDirector',
]);

it('keeps aggregate dashboard data for admin users', function () {
    $adminRole = Role::factory()->admin()->create();
    $studentRole = Role::factory()->student()->create();

    $admin = User::factory()->approved()->withRole($adminRole)->create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
    ]);

    $firstStudent = User::factory()->approved()->withRole($studentRole)->create([
        'name' => 'First Student',
        'email' => 'first@example.com',
    ]);

    $secondStudent = User::factory()->approved()->withRole($studentRole)->create([
        'name' => 'Second Student',
        'email' => 'second@example.com',
    ]);

    UserPoint::create([
        'user_id' => $admin->id,
        'total_points' => 50,
        'redeemable_points' => 20,
    ]);

    UserPoint::create([
        'user_id' => $firstStudent->id,
        'total_points' => 200,
        'redeemable_points' => 150,
    ]);

    UserPoint::create([
        'user_id' => $secondStudent->id,
        'total_points' => 80,
        'redeemable_points' => 60,
    ]);

    PointTransaction::create([
        'user_id' => $firstStudent->id,
        'type' => 'total',
        'amount' => 30,
        'balance_after' => 200,
        'source' => 'manual_adjust',
        'description' => 'First reward',
        'created_at' => now()->subMinute(),
        'updated_at' => now()->subMinute(),
    ]);

    PointTransaction::create([
        'user_id' => $secondStudent->id,
        'type' => 'total',
        'amount' => -10,
        'balance_after' => 80,
        'source' => 'manual_adjust',
        'description' => 'Second deduction',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $response = actingAs($admin)->get(route('dashboard'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('canViewGlobalDashboard', true)
            ->where('totalUsers', 3)
            ->where('todayAdded', 30)
            ->where('todayDeducted', 10)
            ->where('todayTransactions', 2)
            ->has('topUsers', 3)
            ->has('recentTransactions', 2)
            ->has('userPoints', fn (Assert $userPoints) => $userPoints
                ->where('total_points', 50)
                ->where('redeemable_points', 20)
                ->etc()
            )
        );

    expect(collect($response->inertiaProps('topUsers'))->pluck('email')->all())
        ->toContain('first@example.com', 'second@example.com');

    expect(collect($response->inertiaProps('recentTransactions'))->pluck('user_id')->all())
        ->toContain($firstStudent->id, $secondStudent->id);
});
