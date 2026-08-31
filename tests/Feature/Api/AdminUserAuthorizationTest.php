<?php

use App\Models\Grade;
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

describe('Admin user listing authorization', function () {
    it('limits grade directors to users in their own grade', function () {
        $managedGrade = Grade::query()->create([
            'name' => 'Managed Grade',
            'is_active' => true,
        ]);
        $otherGrade = Grade::query()->create([
            'name' => 'Other Grade',
            'is_active' => true,
        ]);
        $gradeDirector = createApprovedApiAdminUser($this->gradeDirectorRole, [
            'grade_id' => $managedGrade->id,
        ]);
        $managedStudent = createApprovedApiAdminUser($this->studentRole, [
            'grade_id' => $managedGrade->id,
        ]);
        $otherStudent = createApprovedApiAdminUser($this->studentRole, [
            'grade_id' => $otherGrade->id,
        ]);

        $response = $this->actingAs($gradeDirector, 'api')->getJson('/api/admin/users');

        $response->assertOk();

        expect($response->json('data'))
            ->toHaveCount(2)
            ->and(collect($response->json('data'))->pluck('id')->all())
            ->toContain($gradeDirector->id, $managedStudent->id)
            ->not->toContain($otherStudent->id);
    });

    it('does not let grade director searches escape their grade scope', function () {
        $managedGrade = Grade::query()->create([
            'name' => 'Managed Search Grade',
            'is_active' => true,
        ]);
        $otherGrade = Grade::query()->create([
            'name' => 'Other Search Grade',
            'is_active' => true,
        ]);
        $gradeDirector = createApprovedApiAdminUser($this->gradeDirectorRole, [
            'grade_id' => $managedGrade->id,
        ]);
        createApprovedApiAdminUser($this->studentRole, [
            'grade_id' => $managedGrade->id,
            'email' => 'managed@example.com',
            'student_id' => 'MANAGED-STUDENT',
        ]);
        $otherStudent = createApprovedApiAdminUser($this->studentRole, [
            'grade_id' => $otherGrade->id,
            'email' => 'escaped@example.com',
            'student_id' => 'ESCAPED-STUDENT',
        ]);

        $response = $this->actingAs($gradeDirector, 'api')
            ->getJson('/api/admin/users?search=escaped@example.com');

        $response->assertOk();

        expect(collect($response->json('data'))->pluck('id')->all())
            ->not->toContain($otherStudent->id);
    });

    it('forbids a grade director from viewing a user outside their grade', function () {
        $managedGrade = Grade::query()->create([
            'name' => 'Managed Detail Grade',
            'is_active' => true,
        ]);
        $otherGrade = Grade::query()->create([
            'name' => 'Other Detail Grade',
            'is_active' => true,
        ]);
        $gradeDirector = createApprovedApiAdminUser($this->gradeDirectorRole, [
            'grade_id' => $managedGrade->id,
        ]);
        $otherStudent = createApprovedApiAdminUser($this->studentRole, [
            'grade_id' => $otherGrade->id,
        ]);

        $this->actingAs($gradeDirector, 'api')
            ->getJson("/api/admin/users/{$otherStudent->id}")
            ->assertForbidden();
    });

    it('returns a minimal user field set from the admin api', function () {
        $superAdmin = createApprovedApiAdminUser($this->superAdminRole);
        createApprovedApiAdminUser($this->studentRole, [
            'phone' => '13800138000',
            'student_id' => 'SENSITIVE-ID',
        ]);

        $response = $this->actingAs($superAdmin, 'api')->getJson('/api/admin/users');

        $response->assertOk();

        expect($response->json('data.0'))->toHaveKeys([
            'id',
            'name',
            'nickname',
            'email',
            'avatar',
            'grade_id',
            'class_id',
            'is_head_teacher',
            'registration_status',
            'created_at',
            'roles',
            'points',
        ])->not->toHaveKeys(['phone', 'student_id']);
    });
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
