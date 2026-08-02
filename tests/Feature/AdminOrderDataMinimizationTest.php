<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('returns an explicit minimal order payload without a verification code to full administrators', function () {
    $adminRole = Role::factory()->admin()->create();
    $admin = User::factory()->approved()->create();
    $admin->assignRole($adminRole);

    $customer = User::factory()->approved()->create([
        'name' => 'Order Customer',
        'email' => 'customer@example.com',
        'phone' => '13800138000',
        'id_number' => '110101199001011234',
        'student_id' => 'STU-SECRET',
    ]);
    $product = Product::factory()->create();
    $order = Order::factory()->for($customer)->for($product)->create([
        'verification_code' => '654321',
        'shipping_info' => [
            'name' => 'Receiver Name',
            'phone' => '13900139000',
            'address' => '北京市海淀区完整地址 88 号',
            'internal_note' => 'must not leak',
        ],
        'metadata' => ['secret' => 'must not leak'],
    ]);

    $this->actingAs($admin)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/show')
            ->missing('verification_code')
            ->missing('verification_code_expires_at')
            ->has('order', fn (Assert $orderPage) => $orderPage
                ->where('id', $order->id)
                ->where('order_no', $order->order_no)
                ->where('user.id', $customer->id)
                ->where('user.name', 'Order Customer')
                ->where('user.email', 'customer@example.com')
                ->missing('user.phone')
                ->missing('user.id_number')
                ->missing('user.student_id')
                ->where('shipping_info.name', 'Receiver Name')
                ->where('shipping_info.phone', '13900139000')
                ->where('shipping_info.address', '北京市海淀区完整地址 88 号')
                ->missing('shipping_info.internal_note')
                ->missing('verification_code')
                ->missing('metadata')
                ->etc()
            )
        );
});

it('masks shipping contact details for limited administrative roles', function () {
    $headTeacherRole = Role::factory()->headTeacher()->create();
    $headTeacher = User::factory()->approved()->create();
    $headTeacher->assignRole($headTeacherRole);

    $customer = User::factory()->approved()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->for($customer)->for($product)->create([
        'shipping_info' => [
            'name' => 'Receiver Name',
            'phone' => '13900139000',
            'address' => '北京市海淀区完整地址 88 号',
        ],
    ]);

    $this->actingAs($headTeacher)
        ->get(route('admin.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('order.shipping_info.name', 'Receiver Name')
            ->where('order.shipping_info.phone', '139****9000')
            ->where('order.shipping_info.address', '北京市海淀区完整地址 ****')
            ->missing('verification_code')
        );
});
