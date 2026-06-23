<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->studentRole = Role::factory()->student()->create();
    $this->user = User::factory()->create();
    $this->user->assignRole($this->studentRole);
    $this->token = $this->user->createToken('test')->plainTextToken;
});

describe('Products', function () {
    it('returns paginated products', function () {
        $category = ProductCategory::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id, 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/shop/products');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'description', 'points_required', 'stock', 'category'],
                ],
                'meta',
            ])
            ->assertJson(['success' => true]);

        expect($response->json('data'))->toHaveCount(3);
    });

    it('filters by category', function () {
        $category1 = ProductCategory::factory()->create();
        $category2 = ProductCategory::factory()->create();
        Product::factory()->count(2)->create(['category_id' => $category1->id, 'status' => 'active']);
        Product::factory()->count(3)->create(['category_id' => $category2->id, 'status' => 'active']);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/shop/products?category='.$category1->id);

        $response->assertOk();

        expect($response->json('data'))->toHaveCount(2);
    });

    it('only returns active products', function () {
        Product::factory()->count(2)->active()->create();
        Product::factory()->count(3)->inactive()->create();

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/shop/products');

        $response->assertOk();

        expect($response->json('data'))->toHaveCount(2);
    });
});

describe('Orders', function () {
    it('returns user orders', function () {
        $product = Product::factory()->create(['status' => 'active', 'stock' => 10]);
        UserPoint::create(['user_id' => $this->user->id, 'total_points' => 1000, 'redeemable_points' => 1000]);

        // Create order
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/shop/orders', [
                'product_id' => $product->id,
                'quantity' => 1,
                'shipping_info' => [
                    'name' => 'Test User',
                    'phone' => '1234567890',
                    'address' => '123 Test St',
                ],
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Get orders
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->getJson('/api/shop/orders');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'order_no', 'product', 'points_spent', 'status'],
                ],
            ]);

        expect($response->json('data'))->toHaveCount(1);
    });

    it('returns 400 with insufficient points', function () {
        $product = Product::factory()->create(['status' => 'active', 'stock' => 10, 'points_required' => 1000]);
        UserPoint::create(['user_id' => $this->user->id, 'total_points' => 100, 'redeemable_points' => 100]);

        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/shop/orders', [
                'product_id' => $product->id,
                'quantity' => 1,
                'shipping_info' => [
                    'name' => 'Test User',
                    'phone' => '1234567890',
                    'address' => '123 Test St',
                ],
            ]);

        $response->assertStatus(400);
    });

    it('validates required fields', function () {
        $response = $this->withHeader('Authorization', 'Bearer '.$this->token)
            ->postJson('/api/shop/orders', []);

        $response->assertStatus(422);
    });
});
