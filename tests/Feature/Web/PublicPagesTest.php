<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('app.key', 'base64:'.base64_encode(str_repeat('a', 32)));
});

it('renders the welcome page', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
        );
});

it('renders the ranking page', function () {
    $studentRole = Role::factory()->student()->create();
    $student = User::factory()->approved()->create();
    $student->assignRole($studentRole);

    UserPoint::query()->create([
        'user_id' => $student->id,
        'total_points' => 120,
        'redeemable_points' => 90,
    ]);

    $this->get('/ranking')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ranking/index')
            ->has('rankings.data', 1, fn (Assert $ranking) => $ranking
                ->where('id', $student->id)
                ->where('total_points', 120)
                ->where('redeemable_points', 90)
                ->etc()
            )
        );
});
