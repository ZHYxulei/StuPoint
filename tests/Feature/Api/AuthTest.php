<?php

use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->studentRole = Role::factory()->student()->create();
    $this->adminRole = Role::factory()->admin()->create();
});

describe('Login', function () {
    it('returns token and user on valid credentials', function () {
        $user = User::factory()->approved()->create([
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole($this->studentRole);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['token', 'token_type', 'expires_in', 'user'],
            ])
            ->assertJson(['success' => true]);

        expect($response->json('data.user.id'))->toBe($user->id);
    });

    it('returns 422 on invalid credentials', function () {
        $user = User::factory()->create();

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    });

    it('rejects pending users before issuing a token', function () {
        $user = User::factory()->pending()->create([
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole($this->studentRole);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');

        expect($user->tokens()->count())->toBe(0);
    });

    it('rejects rejected users before issuing a token', function () {
        $user = User::factory()->rejected()->create([
            'password' => bcrypt('password123'),
        ]);
        $user->assignRole($this->studentRole);

        $response = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');

        expect($user->tokens()->count())->toBe(0);
    });

    it('validates required fields', function () {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422);
    });
});

describe('Me', function () {
    it('returns authenticated user data', function () {
        $user = User::factory()->create();
        $user->assignRole($this->studentRole);
        UserPoint::create(['user_id' => $user->id, 'total_points' => 100, 'redeemable_points' => 50]);

        $response = $this->actingAs($user, 'api')
            ->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'name', 'email', 'roles', 'points'],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ]);
    });

    it('returns 401 when unauthenticated', function () {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    });
});

describe('Logout', function () {
    it('revokes the token', function () {
        $user = User::factory()->create();
        $user->assignRole($this->studentRole);

        $response = $this->actingAs($user, 'api')
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJson(['success' => true]);
    });
});
