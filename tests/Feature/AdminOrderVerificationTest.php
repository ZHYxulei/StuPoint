<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->adminRole = Role::factory()->superAdmin()->create();
    $this->admin = User::factory()->approved()->create([
        'password' => Hash::make('admin-password'),
    ]);
    $this->admin->assignRole($this->adminRole);

    $this->createOrder = function (array $attributes = []): Order {
        $customer = $attributes['user'] ?? User::factory()->approved()->create();
        $category = ProductCategory::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);

        unset($attributes['user']);

        return Order::create(array_merge([
            'order_no' => 'ORD-'.fake()->unique()->numerify('##########'),
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'points_spent' => 100,
            'status' => 'approved',
            'shipping_info' => [
                'name' => $customer->name,
                'phone' => '13800000000',
                'address' => 'Test Address',
            ],
            'third_party_order_id' => null,
            'metadata' => null,
            'verification_code' => null,
            'verification_code_expires_at' => null,
            'verified_at' => null,
            'verified_by' => null,
        ], $attributes));
    };
});

it('rejects password verification method', function () {
    $customer = User::factory()->approved()->create([
        'password' => Hash::make('student-password'),
    ]);

    $order = ($this->createOrder)([
        'user' => $customer,
        'verification_code' => '123456',
        'verification_code_expires_at' => now()->addMinutes(30),
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'password',
            'password' => 'student-password',
        ])
        ->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => '无效的核销方式',
        ]);

    expect($order->fresh()->verified_at)->toBeNull()
        ->and($order->fresh()->status)->toBe('approved');
});

it('verifies orders by persisted verification code and records a single status transition', function () {
    $order = ($this->createOrder)([
        'verification_code' => '654321',
        'verification_code_expires_at' => now()->addMinutes(30),
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '654321',
        ])
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => '核销成功（验证码）',
        ]);

    $order->refresh();

    expect($order->status)->toBe('completed')
        ->and($order->verified_at)->not->toBeNull()
        ->and($order->verified_by)->toBe($this->admin->id)
        ->and($order->verification_code)->toBe('654321');

    $history = $order->statusHistory()->get();

    expect($history)->toHaveCount(1)
        ->and($history->first()->from_status)->toBe('approved')
        ->and($history->first()->to_status)->toBe('completed')
        ->and($history->first()->note)->toContain('核销成功（验证码）');
});

it('rejects expired persisted verification codes', function () {
    $order = ($this->createOrder)([
        'verification_code' => '111222',
        'verification_code_expires_at' => now()->subMinute(),
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '111222',
        ])
        ->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => '验证码不存在或已过期',
        ]);

    expect($order->fresh()->verified_at)->toBeNull()
        ->and($order->fresh()->status)->toBe('approved')
        ->and($order->statusHistory()->count())->toBe(0);
});

it('rejects incorrect persisted verification codes', function () {
    $order = ($this->createOrder)([
        'verification_code' => '333444',
        'verification_code_expires_at' => now()->addMinutes(30),
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '999888',
        ])
        ->assertStatus(422)
        ->assertJson([
            'success' => false,
            'message' => '验证码错误',
        ]);

    expect($order->fresh()->verified_at)->toBeNull()
        ->and($order->fresh()->status)->toBe('approved')
        ->and($order->statusHistory()->count())->toBe(0);
});

it('rejects a second verification attempt after the order is already verified', function () {
    $order = ($this->createOrder)([
        'verification_code' => '777888',
        'verification_code_expires_at' => now()->addMinutes(30),
    ]);

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '777888',
        ])
        ->assertOk();

    actingAs($this->admin)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '777888',
        ])
        ->assertStatus(400)
        ->assertJson([
            'success' => false,
            'message' => '该订单已核销',
        ]);

    expect($order->fresh()->statusHistory()->count())->toBe(1);
});
