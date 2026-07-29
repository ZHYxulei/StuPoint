<?php

use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;

uses()->group('mysql');

beforeEach(function (): void {
    if (config('database.default') !== 'mysql') {
        $this->markTestSkipped('MySQL compatibility tests require DB_CONNECTION=mysql.');
    }
});

it('round trips mysql json columns through eloquent casts', function () {
    $user = User::factory()->approved()->create();
    $product = Product::factory()->create();

    $pointTransactionMetadata = [
        'source_context' => [
            'channel' => 'admin',
            'batch' => 7,
        ],
        'flags' => ['manual', 'bonus'],
        'operator_note' => 'mysql-json-round-trip',
    ];

    $pointTransaction = PointTransaction::query()->create([
        'user_id' => $user->id,
        'type' => 'total',
        'amount' => 15,
        'balance_after' => 115,
        'source' => 'manual_adjust',
        'description' => 'MySQL metadata compatibility check',
        'metadata' => $pointTransactionMetadata,
        'operator_id' => null,
    ]);

    $shippingInfo = [
        'recipient' => [
            'name' => 'MySQL Tester',
            'phone' => '13800138000',
        ],
        'address' => [
            'province' => 'Zhejiang',
            'city' => 'Hangzhou',
            'line1' => 'No. 1 Test Road',
        ],
        'notes' => ['fragile', 'weekend-delivery'],
    ];

    $orderMetadata = [
        'fulfillment' => [
            'mode' => 'manual',
            'priority' => 2,
        ],
        'tags' => ['mysql', 'compatibility'],
        'extra' => [
            'gift' => true,
            'message' => 'Cast check',
        ],
    ];

    $order = Order::factory()->for($user)->for($product)->create([
        'order_no' => 'ORD-MYSQL-'.strtoupper(fake()->bothify('########')),
        'points_spent' => 88,
        'status' => 'pending',
        'shipping_info' => $shippingInfo,
        'third_party_order_id' => null,
        'metadata' => $orderMetadata,
        'verification_code' => null,
        'verification_code_expires_at' => null,
        'verified_at' => null,
        'verified_by' => null,
    ]);

    expect($pointTransaction->fresh()->metadata)->toBe($pointTransactionMetadata)
        ->and($order->fresh()->shipping_info)->toBe($shippingInfo)
        ->and($order->fresh()->metadata)->toBe($orderMetadata);
});

it('sets product category foreign keys to null when the category is deleted', function () {
    $category = ProductCategory::factory()->create();
    $product = Product::factory()->create([
        'category_id' => $category->id,
    ]);

    $category->delete();

    expect($product->fresh()->category_id)->toBeNull();
});

it('cascades order deletion when the owning user is deleted', function () {
    $user = User::factory()->approved()->create();
    $product = Product::factory()->create();

    $order = Order::factory()->for($user)->for($product)->create([
        'order_no' => 'ORD-CASCADE-'.strtoupper(fake()->bothify('########')),
        'points_spent' => 66,
        'status' => 'pending',
        'shipping_info' => [
            'name' => 'Cascade Check',
            'phone' => '13800138001',
            'address' => 'Deletion Street',
        ],
        'metadata' => [
            'scenario' => 'user-delete-cascade',
        ],
    ]);

    $user->delete();

    $this->assertDatabaseMissing('orders', [
        'id' => $order->id,
    ]);
});
