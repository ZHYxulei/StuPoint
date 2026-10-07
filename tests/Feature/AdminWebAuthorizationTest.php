<?php

use App\Models\Order;
use App\Models\Plugin;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createOrderForAuthorizationTest(string $orderNo = 'ORD-AUTHZ-1'): Order
{
    $customer = User::factory()->approved()->create();
    $product = Product::factory()->create();

    return Order::create([
        'order_no' => $orderNo,
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 1,
        'unit_points_spent' => 30,
        'points_spent' => 30,
        'status' => 'pending',
        'shipping_info' => [
            'name' => 'Receiver',
            'phone' => '13800000000',
            'address' => 'Test Address',
        ],
    ]);
}

function createApprovedWebUserWithRole(Role $role): User
{
    $user = User::factory()->approved()->create();
    $user->assignRole($role);

    return $user;
}

it('forbids a head teacher from uploading plugins', function () {
    $headTeacher = createApprovedWebUserWithRole(Role::factory()->headTeacher()->create());

    actingAs($headTeacher)
        ->post(route('admin.plugins.upload'), [
            'plugin' => UploadedFile::fake()->create('plugin.zip', 1, 'application/zip'),
        ])
        ->assertForbidden();
});

it('forbids a grade director from changing another users role', function () {
    $gradeDirector = createApprovedWebUserWithRole(Role::factory()->gradeDirector()->create());
    $target = createApprovedWebUserWithRole(Role::factory()->student()->create());
    $adminRole = Role::factory()->admin()->create();

    actingAs($gradeDirector)
        ->put(route('admin.users.updateRoles', $target->id), [
            'role_id' => $adminRole->id,
        ])
        ->assertForbidden();

    expect($target->fresh()->roles->pluck('slug')->all())->toBe(['student']);
});

it('forbids a principal from resetting another users password', function () {
    $principal = createApprovedWebUserWithRole(Role::factory()->principal()->create());
    $target = createApprovedWebUserWithRole(Role::factory()->student()->create());
    $originalPassword = $target->password;

    actingAs($principal)
        ->put(route('admin.users.updatePassword', $target->id), [
            'password' => 'ChangedPassword123!',
            'password_confirmation' => 'ChangedPassword123!',
        ])
        ->assertForbidden();

    expect($target->fresh()->password)->toBe($originalPassword);
});

it('forbids a principal from updating arbitrary users through the admin api', function () {
    $principal = createApprovedWebUserWithRole(Role::factory()->principal()->create());
    $target = createApprovedWebUserWithRole(Role::factory()->student()->create());

    $this->actingAs($principal, 'api')
        ->putJson("/api/admin/users/{$target->id}", [
            'name' => 'Unauthorized Update',
            'is_head_teacher' => true,
        ])
        ->assertForbidden();

    expect($target->fresh()->name)->not->toBe('Unauthorized Update')
        ->and($target->fresh()->is_head_teacher)->toBeFalse();
});

it('forbids a principal from updating arbitrary users through the web admin route', function () {
    $principal = createApprovedWebUserWithRole(Role::factory()->principal()->create());
    $target = createApprovedWebUserWithRole(Role::factory()->student()->create());

    actingAs($principal)
        ->put(route('admin.users.update', $target->id), [
            'name' => 'Web Unauthorized Update',
            'email' => $target->email,
            'is_head_teacher' => true,
        ])
        ->assertForbidden();

    expect($target->fresh()->name)->not->toBe('Web Unauthorized Update')
        ->and($target->fresh()->is_head_teacher)->toBeFalse();
});

it('forbids a grade director from driving the plugin lifecycle', function (string $method, string $routeName) {
    $gradeDirector = createApprovedWebUserWithRole(Role::factory()->gradeDirector()->create());
    $plugin = Plugin::create([
        'name' => 'Lifecycle Plugin',
        'slug' => 'lifecycle-plugin',
        'version' => '1.0.0',
        'description' => 'Plugin used to assert lifecycle authorization',
        'author' => 'Tester',
        'status' => 'disabled',
        'dependencies' => ['composer' => [], 'plugins' => []],
        'config' => [],
    ]);

    $payload = $method === 'put' ? ['config' => ['secret' => 'value']] : [];

    actingAs($gradeDirector)
        ->{$method}(route($routeName, $plugin->id), $payload)
        ->assertForbidden();

    expect($plugin->fresh()->status)->toBe('disabled')
        ->and($plugin->fresh()->config)->toBe([]);
})->with([
    'enable' => ['post', 'admin.plugins.enable'],
    'disable' => ['post', 'admin.plugins.disable'],
    'uninstall' => ['delete', 'admin.plugins.uninstall'],
    'update config' => ['put', 'admin.plugins.updateConfig'],
]);

it('forbids a head teacher from changing order status', function () {
    $headTeacher = createApprovedWebUserWithRole(Role::factory()->headTeacher()->create());
    $order = createOrderForAuthorizationTest();

    actingAs($headTeacher)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Head teacher should not be able to void this order',
        ])
        ->assertForbidden();

    expect($order->fresh()->status)->toBe('pending')
        ->and($order->statusHistory()->count())->toBe(0);
});

it('forbids a head teacher from verifying an order', function () {
    $headTeacher = createApprovedWebUserWithRole(Role::factory()->headTeacher()->create());
    $order = createOrderForAuthorizationTest('ORD-AUTHZ-2');

    actingAs($headTeacher)
        ->postJson(route('admin.orders.verify', $order->id), [
            'method' => 'code',
            'code' => '123456',
        ])
        ->assertForbidden();

    expect($order->fresh()->verified_at)->toBeNull()
        ->and($order->fresh()->status)->toBe('pending');
});

it('lets a grade director change order status', function () {
    $gradeDirector = createApprovedWebUserWithRole(Role::factory()->gradeDirector()->create());
    $order = createOrderForAuthorizationTest('ORD-AUTHZ-3');

    actingAs($gradeDirector)
        ->from(route('admin.orders.show', $order->id))
        ->put(route('admin.orders.updateStatus', $order->id), [
            'status' => 'cancelled',
            'note' => 'Cancelled by grade director',
        ])
        ->assertRedirect(route('admin.orders.show', $order->id));

    expect($order->fresh()->status)->toBe('cancelled');
});

it('forbids creating a user with a role at or above the actor level', function () {
    $gradeDirector = createApprovedWebUserWithRole(Role::factory()->gradeDirector()->create());
    $principalRole = Role::factory()->principal()->create();

    actingAs($gradeDirector)
        ->post(route('admin.users.store'), [
            'role_id' => $principalRole->id,
            'email' => 'escalated@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertForbidden();

    expect(User::query()->where('email', 'escalated@example.com')->exists())->toBeFalse();
});

it('lets a principal create a user below their own level', function () {
    $principal = createApprovedWebUserWithRole(Role::factory()->principal()->create());
    $gradeDirectorRole = Role::factory()->gradeDirector()->create();

    actingAs($principal)
        ->post(route('admin.users.store'), [
            'role_id' => $gradeDirectorRole->id,
            'email' => 'junior@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertRedirect();

    expect(User::query()->where('email', 'junior@example.com')->first()?->roles->pluck('slug')->all())
        ->toBe(['grade_director']);
});
