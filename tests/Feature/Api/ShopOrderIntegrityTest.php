<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createApprovedShopUser(): User
{
    $user = User::factory()->approved()->create();
    $user->assignRole(Role::factory()->student()->create());

    return $user;
}

function shippingInfo(): array
{
    return [
        'name' => 'Test User',
        'phone' => '1234567890',
        'address' => '123 Test St',
    ];
}

it('persists an active verification code when creating an order', function () {
    $user = createApprovedShopUser();

    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => 100,
        'redeemable_points' => 100,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 5,
        'points_required' => 25,
    ]);

    actingAs($user, 'api')
        ->postJson('/api/shop/orders', [
            'product_id' => $product->id,
            'quantity' => 1,
            'shipping_info' => shippingInfo(),
        ])
        ->assertCreated();

    $order = Order::query()->latest('id')->firstOrFail();

    expect($order->verification_code)
        ->toBeString()
        ->toHaveLength(6)
        ->and($order->verification_code_expires_at)->not->toBeNull()
        ->and($order->verification_code_expires_at?->isFuture())->toBeTrue();

    actingAs($user, 'api')
        ->getJson('/api/shop/orders')
        ->assertOk()
        ->assertJsonPath('data.0.verification_code', $order->verification_code);
});

it('honors quantity end to end when creating an order', function () {
    $user = createApprovedShopUser();

    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => 100,
        'redeemable_points' => 100,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 5,
        'points_required' => 25,
    ]);

    actingAs($user, 'api')
        ->postJson('/api/shop/orders', [
            'product_id' => $product->id,
            'quantity' => 3,
            'shipping_info' => shippingInfo(),
        ])
        ->assertCreated()
        ->assertJsonPath('data.quantity', 3)
        ->assertJsonPath('data.unit_points_spent', 25)
        ->assertJsonPath('data.points_spent', 75);

    $order = Order::query()->latest('id')->first();

    expect($order)->not->toBeNull();
    expect($order->quantity)->toBe(3);
    expect($order->unit_points_spent)->toBe(25);
    expect($order->points_spent)->toBe(75);
    expect($product->fresh()->stock)->toBe(2);
    expect($user->fresh()->points->redeemable_points)->toBe(25);
});

it('rejects orders when requested quantity exceeds stock', function () {
    $user = createApprovedShopUser();

    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => 500,
        'redeemable_points' => 500,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 2,
        'points_required' => 40,
    ]);

    actingAs($user, 'api')
        ->postJson('/api/shop/orders', [
            'product_id' => $product->id,
            'quantity' => 3,
            'shipping_info' => shippingInfo(),
        ])
        ->assertStatus(400)
        ->assertJson(['success' => false]);

    expect(Order::count())->toBe(0);
    expect($product->fresh()->stock)->toBe(2);
    expect($user->fresh()->points->redeemable_points)->toBe(500);
});

it('rejects orders when total requested points exceed the redeemable balance', function () {
    $user = createApprovedShopUser();

    UserPoint::create([
        'user_id' => $user->id,
        'total_points' => 100,
        'redeemable_points' => 100,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 10,
        'points_required' => 60,
    ]);

    actingAs($user, 'api')
        ->postJson('/api/shop/orders', [
            'product_id' => $product->id,
            'quantity' => 2,
            'shipping_info' => shippingInfo(),
        ])
        ->assertStatus(400)
        ->assertJson(['success' => false]);

    expect(Order::count())->toBe(0);
    expect($product->fresh()->stock)->toBe(10);
    expect($user->fresh()->points->redeemable_points)->toBe(100);
});
