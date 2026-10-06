<?php

use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    foreach (['parent', 'student', 'teacher', 'student_union_member'] as $slug) {
        Role::query()->firstOrCreate(
            ['slug' => $slug],
            [
                'name' => $slug,
                'is_system' => true,
                'level' => 10,
            ],
        );
    }
});

it('registers a parent using only a phone number', function () {
    $response = $this->post('/register', [
        'role' => 'parent',
        'email' => '',
        'phone' => '13800138000',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasNoErrors();

    $user = User::query()->where('phone', '13800138000')->first();

    expect($user)->not->toBeNull()
        ->and($user->registration_status)->toBe('approved')
        ->and($user->roles->pluck('slug')->all())->toBe(['parent']);
});

it('registers a parent using only an email address', function () {
    $response = $this->post('/register', [
        'role' => 'parent',
        'email' => 'parent@example.com',
        'phone' => '',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasNoErrors();

    $user = User::query()->where('email', 'parent@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->registration_status)->toBe('approved');
});

it('registers a student using only a phone number', function () {
    $class = SchoolClass::query()->create([
        'name' => '1班',
        'grade' => '一年级',
    ]);

    $response = $this->post('/register', [
        'role' => 'student',
        'name' => 'Phone Student',
        'nickname' => 'PS',
        'id_number' => '110101200001011234',
        'class_id' => $class->id,
        'email' => '',
        'phone' => '13900139000',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertSessionHasNoErrors();

    $user = User::query()->where('phone', '13900139000')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Phone Student')
        ->and($user->registration_status)->toBe('pending');
});
