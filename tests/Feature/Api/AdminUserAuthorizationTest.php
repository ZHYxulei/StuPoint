<?php

use App\Models\PointTransaction;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;

function createApprovedApiAdminUser(Role $role, array $attributes = []): User
{
    $user = User::factory()->approved()->create($attributes);
    $user->assignRole($role);

    return $user;
}

beforeEach(function () {
    $this->superAdminRole = Role::factory()->superAdmin()->create();
    $this->principalRole = Role::factory()->principal()->create();
    $this->gradeDirectorRole = Role::factory()->gradeDirector()->create();
    $this->studentRole = Role::factory()->student()->create();
    $this->teacherRole = Role::factory()->teacher()->create();
    $this->adminRole = Role::factory()->admin()->create();
});

describe('Admin user update authorization', function () {
    it('forbids a principal from syncing roles through the api update endpoint', function () {
        $principal = createApprovedApiAdminUser($this->principalRole);
        $target = createApprovedApiAdminUser($this->studentRole);

        $response = $this->actingAs($principal, 'api')->putJson("/api/admin/users/{$target->id}", [
            'name' => 'Updated Name',
            'roles' => [$this->adminRole->id],
        ]);

        $response->assertForbidden();

        expect($target->fresh()->name)->not->toBe('Updated Name');
        expect($target->fresh()->roles->pluck('slug')->all())->toBe(['student']);
    });
});

describe('Admin point adjustment authorization', function () {
    it('forbids a grade director from adjusting points outside point service authorization', function () {
        $gradeDirector = createApprovedApiAdminUser($this->gradeDirectorRole);
        $target = createApprovedApiAdminUser($this->studentRole);

        UserPoint::create([
            'user_id' => $target->id,
            'total_points' => 30,
            'redeemable_points' => 30,
        ]);

        $response = $this->actingAs($gradeDirector, 'api')->postJson("/api/admin/users/{$target->id}/adjust-points", [
            'type' => 'add',
            'amount' => 10,
            'reason' => 'Unauthorized bonus',
        ]);

        $response->assertForbidden();

        expect($target->fresh()->points->total_points)->toBe(30);
        expect($target->fresh()->points->redeemable_points)->toBe(30);
        expect(PointTransaction::query()->where('user_id', $target->id)->count())->toBe(0);
    });
});
