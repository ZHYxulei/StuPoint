<?php

use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->studentRole = Role::factory()->student()->create();
    $this->user = User::factory()->approved()->create();
    $this->user->assignRole($this->studentRole);
});

function createApiSchoolClass(array $attributes = []): SchoolClass
{
    return SchoolClass::create(array_merge([
        'name' => fake()->randomElement(['1班', '2班', '3班']),
        'grade' => '一年级',
        'grade_id' => null,
        'head_teacher_id' => null,
    ], $attributes));
}

test('ranking rejects invalid sort field', function () {
    $response = $this->actingAs($this->user, 'api')
        ->getJson('/api/points/ranking?sort_by=total_points%20desc');

    $response->assertUnprocessable()
        ->assertJsonValidationErrorFor('sort_by');
});

test('ranking sorts by validated redeemable points', function () {
    $class = createApiSchoolClass();

    $first = User::factory()->approved()->create([
        'name' => 'First Place',
        'class_id' => $class->id,
        'grade' => '一年级',
    ]);
    $first->assignRole($this->studentRole);
    UserPoint::create([
        'user_id' => $first->id,
        'total_points' => 80,
        'redeemable_points' => 75,
    ]);

    $second = User::factory()->approved()->create([
        'name' => 'Second Place',
        'class_id' => $class->id,
        'grade' => '一年级',
    ]);
    $second->assignRole($this->studentRole);
    UserPoint::create([
        'user_id' => $second->id,
        'total_points' => 120,
        'redeemable_points' => 30,
    ]);

    $response = $this->actingAs($this->user, 'api')
        ->getJson('/api/points/ranking?sort_by=redeemable_points&limit=2');

    $response->assertOk()
        ->assertJsonPath('data.0.user_id', $first->id)
        ->assertJsonPath('data.0.rank', 1)
        ->assertJsonPath('data.0.redeemable_points', 75)
        ->assertJsonPath('data.1.user_id', $second->id)
        ->assertJsonPath('data.1.rank', 2)
        ->assertJsonPath('data.1.redeemable_points', 30);
});
