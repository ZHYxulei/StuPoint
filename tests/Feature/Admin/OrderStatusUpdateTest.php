<?php

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createApprovedAdminUser(): User
{
    return User::factory()
        ->approved()
        ->withRole(Role::factory()->superAdmin()->create())
        ->create();
}

function createApprovedCustomer(): User
{
    return User::factory()
        ->approved()
        ->withRole(Role::factory()->student()->create())
        ->create();
}

function orderShippingInfo(): array
{
    return [
        'name' => 'Test User',
        'phone' => '1234567890',
        'address' => '123 Test St',
    ];
}

it('restores stock and points when cancelling a pending order', function () {
    $admin = createApprovedAdminUser();
    $customer = createApprovedCustomer();

    UserPoint::create([
        'user_id' => $customer->id,
        'total_points' => 100,
        'redeemable_points' => 40,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 3,
        'points_required' => 30,
    ]);

    $order = Order::create([
        'order_no' => 'ORD-CANCEL-1',
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_points_spent' => 30,
        'points_spent' => 60,
        'status' => 'pending',
        'shipping_info' => orderShippingInfo(),
    ]);

    actingAs($admin)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Customer requested cancellation',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id));

    expect($order->fresh()->status)->toBe('cancelled');
    expect($product->fresh()->stock)->toBe(5);
    expect($customer->fresh()->points->total_points)->toBe(100);
    expect($customer->fresh()->points->redeemable_points)->toBe(100);

    $this->assertDatabaseHas('order_status_history', [
        'order_id' => $order->id,
        'from_status' => 'pending',
        'to_status' => 'cancelled',
    ]);
});

it('restores stock and points when failing a processing order', function () {
    $admin = createApprovedAdminUser();
    $customer = createApprovedCustomer();

    UserPoint::create([
        'user_id' => $customer->id,
        'total_points' => 100,
        'redeemable_points' => 60,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 1,
        'points_required' => 20,
    ]);

    $order = Order::create([
        'order_no' => 'ORD-FAILED-1',
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_points_spent' => 20,
        'points_spent' => 40,
        'status' => 'processing',
        'shipping_info' => orderShippingInfo(),
    ]);

    actingAs($admin)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'failed',
            'note' => 'Third-party exchange failed',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id));

    expect($order->fresh()->status)->toBe('failed');
    expect($product->fresh()->stock)->toBe(3);
    expect($customer->fresh()->points->redeemable_points)->toBe(100);

    $this->assertDatabaseHas('order_status_history', [
        'order_id' => $order->id,
        'from_status' => 'processing',
        'to_status' => 'failed',
    ]);
});

it('does not compensate twice when cancellation is repeated', function () {
    $admin = createApprovedAdminUser();
    $customer = createApprovedCustomer();

    UserPoint::create([
        'user_id' => $customer->id,
        'total_points' => 100,
        'redeemable_points' => 40,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 3,
        'points_required' => 30,
    ]);

    $order = Order::create([
        'order_no' => 'ORD-CANCEL-2',
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_points_spent' => 30,
        'points_spent' => 60,
        'status' => 'pending',
        'shipping_info' => orderShippingInfo(),
    ]);

    actingAs($admin)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Initial cancellation',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id));

    actingAs($admin)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Repeated cancellation',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id))
        ->assertSessionHas('error');

    expect($order->fresh()->status)->toBe('cancelled');
    expect($product->fresh()->stock)->toBe(5);
    expect($customer->fresh()->points->redeemable_points)->toBe(100);
    expect(OrderStatusHistory::query()->where('order_id', $order->id)->count())->toBe(1);
});

it('rejects illegal transitions from completed orders', function () {
    $admin = createApprovedAdminUser();
    $customer = createApprovedCustomer();

    UserPoint::create([
        'user_id' => $customer->id,
        'total_points' => 100,
        'redeemable_points' => 40,
    ]);

    $product = Product::factory()->create([
        'status' => 'active',
        'stock' => 3,
        'points_required' => 30,
    ]);

    $order = Order::create([
        'order_no' => 'ORD-COMPLETE-1',
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
        'unit_points_spent' => 30,
        'points_spent' => 60,
        'status' => 'completed',
        'shipping_info' => orderShippingInfo(),
    ]);

    actingAs($admin)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Attempted rollback after completion',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id))
        ->assertSessionHas('error');

    expect($order->fresh()->status)->toBe('completed');
    expect($product->fresh()->stock)->toBe(3);
    expect($customer->fresh()->points->redeemable_points)->toBe(40);
    expect(OrderStatusHistory::query()->where('order_id', $order->id)->count())->toBe(0);
});
