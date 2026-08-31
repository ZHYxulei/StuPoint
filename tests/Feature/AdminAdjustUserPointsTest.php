<?php

use App\Models\PointTransaction;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createApprovedUserWithRole(Role $role, array $attributes = []): User
{
    $user = User::factory()->create(array_merge([
        'registration_status' => 'approved',
    ], $attributes));
    $user->assignRole($role);

    return $user;
}

it('allows admin to add points and records transactions', function () {
    $adminRole = Role::create([
        'name' => 'Admin',
        'slug' => 'admin',
        'description' => 'Administrator',
        'is_system' => true,
        'level' => 90,
    ]);

    $studentRole = Role::create([
        'name' => 'Student',
        'slug' => 'student',
        'description' => 'Student',
        'is_system' => false,
        'level' => 10,
    ]);

    $operator = createApprovedUserWithRole($adminRole);
    $target = createApprovedUserWithRole($studentRole);

    actingAs($operator)
        ->post("/admin/users/{$target->id}/adjust-points", [
            'type' => 'add',
            'amount' => 15,
            'reason' => 'Manual bonus',
        ])
        ->assertOk();

    $target->refresh();

    expect($target->points)->not->toBeNull();
    expect($target->points->total_points)->toBe(15);
    expect($target->points->redeemable_points)->toBe(15);
    expect(PointTransaction::query()->where('user_id', $target->id)->count())->toBe(2);

    $this->assertDatabaseHas('point_transactions', [
        'user_id' => $target->id,
        'type' => 'total',
        'amount' => 15,
        'balance_after' => 15,
        'source' => 'manual_adjust',
        'description' => 'Manual bonus',
        'operator_id' => $operator->id,
    ]);

    $this->assertDatabaseHas('point_transactions', [
        'user_id' => $target->id,
        'type' => 'redeemable',
        'amount' => 15,
        'balance_after' => 15,
        'source' => 'manual_adjust',
        'description' => 'Manual bonus',
        'operator_id' => $operator->id,
    ]);
});

it('allows super admin to add points and records transactions', function () {
    $superAdminRole = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);

    $studentRole = Role::create([
        'name' => 'Student',
        'slug' => 'student',
        'description' => 'Student',
        'is_system' => false,
        'level' => 10,
    ]);

    $operator = createApprovedUserWithRole($superAdminRole);
    $target = createApprovedUserWithRole($studentRole);

    actingAs($operator)
        ->post("/admin/users/{$target->id}/adjust-points", [
            'type' => 'add',
            'amount' => 12,
            'reason' => 'Manual bonus by super admin',
        ])
        ->assertOk();

    $target->refresh();

    expect($target->points)->not->toBeNull();
    expect($target->points->total_points)->toBe(12);
    expect($target->points->redeemable_points)->toBe(12);
    expect(PointTransaction::query()->where('user_id', $target->id)->count())->toBe(2);
});

it('rejects unauthorized point adjustment without changing balances', function () {
    $teacherRole = Role::create([
        'name' => 'Teacher',
        'slug' => 'teacher',
        'description' => 'Teacher',
        'is_system' => false,
        'level' => 60,
    ]);

    $studentRole = Role::create([
        'name' => 'Student',
        'slug' => 'student',
        'description' => 'Student',
        'is_system' => false,
        'level' => 10,
    ]);

    $operator = createApprovedUserWithRole($teacherRole);
    $target = createApprovedUserWithRole($studentRole, [
        'class_id' => null,
    ]);

    UserPoint::create([
        'user_id' => $target->id,
        'total_points' => 20,
        'redeemable_points' => 20,
    ]);

    actingAs($operator)
        ->from(route('admin.users.show', $target->id))
        ->post("/admin/users/{$target->id}/adjust-points", [
            'type' => 'add',
            'amount' => 10,
            'reason' => 'Unauthorized bonus',
        ])
        ->assertForbidden();

    $target->refresh();

    expect($target->points)->not->toBeNull();
    expect($target->points->total_points)->toBe(20);
    expect($target->points->redeemable_points)->toBe(20);
    expect(PointTransaction::query()->where('user_id', $target->id)->count())->toBe(0);
});

it('rejects deducting more redeemable points than available', function () {
    $superAdminRole = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);

    $studentRole = Role::create([
        'name' => 'Student',
        'slug' => 'student',
        'description' => 'Student',
        'is_system' => false,
        'level' => 10,
    ]);

    $operator = createApprovedUserWithRole($superAdminRole);
    $target = createApprovedUserWithRole($studentRole);

    UserPoint::create([
        'user_id' => $target->id,
        'total_points' => 5,
        'redeemable_points' => 5,
    ]);

    actingAs($operator)
        ->from(route('admin.users.show', $target->id))
        ->post("/admin/users/{$target->id}/adjust-points", [
            'type' => 'deduct',
            'amount' => 10,
            'reason' => 'Too much deduction',
        ])
        ->assertRedirect(route('admin.users.show', $target->id))
        ->assertSessionHasErrors('amount');

    $target->refresh();

    expect($target->points)->not->toBeNull();
    expect($target->points->total_points)->toBe(5);
    expect($target->points->redeemable_points)->toBe(5);
    expect(PointTransaction::query()->where('user_id', $target->id)->count())->toBe(0);
});
