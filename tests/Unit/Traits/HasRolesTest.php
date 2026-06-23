<?php

use App\Models\Role;
use App\Models\User;

uses(RefreshDatabase::class);

it('returns true when user has the role', function () {
    $role = Role::factory()->student()->create();
    $user = User::factory()->create();
    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();
});

it('returns false when user lacks the role', function () {
    $user = User::factory()->create();

    expect($user->hasRole('student'))->toBeFalse();
});

it('returns true for multiple roles', function () {
    $studentRole = Role::factory()->student()->create();
    $teacherRole = Role::factory()->teacher()->create();
    $user = User::factory()->create();
    $user->assignRole($studentRole);
    $user->assignRole($teacherRole);

    expect($user->hasRole('student'))->toBeTrue();
    expect($user->hasRole('teacher'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
});

it('reflects assignRole in hasRole', function () {
    $role = Role::factory()->student()->create();
    $user = User::factory()->create();

    expect($user->hasRole('student'))->toBeFalse();

    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();
});

it('reflects removeRole in hasRole', function () {
    $role = Role::factory()->student()->create();
    $user = User::factory()->create();
    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();

    $user->removeRole($role);

    expect($user->hasRole('student'))->toBeFalse();
});

it('reflects syncRoles in hasRole', function () {
    $studentRole = Role::factory()->student()->create();
    $teacherRole = Role::factory()->teacher()->create();
    $user = User::factory()->create();
    $user->assignRole($studentRole);

    expect($user->hasRole('student'))->toBeTrue();
    expect($user->hasRole('teacher'))->toBeFalse();

    $user->syncRoles([$teacherRole]);

    expect($user->hasRole('student'))->toBeFalse();
    expect($user->hasRole('teacher'))->toBeTrue();
});

it('caches roles to reduce database queries', function () {
    $role = Role::factory()->student()->create();
    $user = User::factory()->create();
    $user->assignRole($role);

    // Enable query log
    DB::enableQueryLog();

    // Call hasRole multiple times
    $user->hasRole('student');
    $user->hasRole('student');
    $user->hasRole('student');

    // Should only have 1 query for roles (the first call)
    $roleQueries = collect(DB::getQueryLog())->filter(fn ($q) => str_contains($q['query'], 'roles'));

    expect($roleQueries->count())->toBe(1);

    DB::disableQueryLog();
});
