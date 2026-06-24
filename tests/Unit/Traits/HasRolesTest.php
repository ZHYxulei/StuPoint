<?php

use App\Models\Role;
use App\Models\User;
use App\Traits\HasRoles;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    HasRoles::$roleSlugCache = [];
});

function createRole(string $slug): Role
{
    return Role::create([
        'name' => ucfirst(str_replace('_', ' ', $slug)),
        'slug' => $slug,
        'description' => $slug.' role',
        'is_system' => true,
        'level' => 50,
    ]);
}

it('returns true when user has the role', function () {
    $role = createRole('student');
    $user = User::factory()->create();
    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();
});

it('returns false when user lacks the role', function () {
    HasRoles::$roleSlugCache = [];
    $user = User::factory()->create();

    expect($user->hasRole('student'))->toBeFalse();
});

it('returns true for multiple roles', function () {
    $studentRole = createRole('student');
    $teacherRole = createRole('teacher');
    $user = User::factory()->create();
    $user->assignRole($studentRole);
    $user->assignRole($teacherRole);

    expect($user->hasRole('student'))->toBeTrue();
    expect($user->hasRole('teacher'))->toBeTrue();
    expect($user->hasRole('admin'))->toBeFalse();
});

it('reflects assignRole in hasRole', function () {
    HasRoles::$roleSlugCache = [];
    $role = createRole('student');
    $user = User::factory()->create();

    expect($user->hasRole('student'))->toBeFalse();

    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();
});

it('reflects removeRole in hasRole', function () {
    $role = createRole('student');
    $user = User::factory()->create();
    $user->assignRole($role);

    expect($user->hasRole('student'))->toBeTrue();

    $user->removeRole($role);

    expect($user->hasRole('student'))->toBeFalse();
});

it('reflects syncRoles in hasRole', function () {
    $studentRole = createRole('student');
    $teacherRole = createRole('teacher');
    $user = User::factory()->create();
    $user->assignRole($studentRole);

    expect($user->hasRole('student'))->toBeTrue();
    expect($user->hasRole('teacher'))->toBeFalse();

    $user->syncRoles([$teacherRole]);

    expect($user->hasRole('student'))->toBeFalse();
    expect($user->hasRole('teacher'))->toBeTrue();
});

it('caches roles to reduce database queries', function () {
    $role = createRole('student');
    $user = User::factory()->create();
    $user->assignRole($role);

    DB::enableQueryLog();

    $user->hasRole('student');
    $user->hasRole('student');
    $user->hasRole('student');

    $roleQueries = collect(DB::getQueryLog())->filter(fn ($q) => str_contains($q['query'], 'roles'));

    expect($roleQueries->count())->toBe(1);

    DB::disableQueryLog();
});
