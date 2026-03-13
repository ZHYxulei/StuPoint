<?php

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

function createUserWithRole(Role $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

it('stores site name and favicon url', function () {
    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    $payload = [
        'site_name' => 'StuPoint 测试',
        'site_favicon' => 'https://example.com/favicon.ico',
    ];

    actingAs($user)
        ->post('/admin/settings/site', $payload)
        ->assertRedirect();

    expect(Setting::get('site_name'))->toBe('StuPoint 测试');
    expect(Setting::get('site_favicon'))->toBe('https://example.com/favicon.ico');
});

it('stores favicon upload as data uri', function () {
    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    $file = UploadedFile::fake()->create('favicon.png', 10, 'image/png');

    actingAs($user)
        ->post('/admin/settings/site', [
            'site_favicon_upload' => $file,
        ])
        ->assertRedirect();

    $data = Setting::get('site_favicon_data');
    expect($data)->toStartWith('data:image/png;base64,');
});

it('rejects invalid favicon upload', function () {
    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    $file = UploadedFile::fake()->create('favicon.pdf', 10, 'application/pdf');

    actingAs($user)
        ->post('/admin/settings/site', [
            'site_favicon_upload' => $file,
        ])
        ->assertSessionHasErrors('site_favicon_upload');
});

it('prevents non super admin from updating settings', function () {
    $role = Role::create([
        'name' => 'Teacher',
        'slug' => 'teacher',
        'description' => 'Teacher',
        'is_system' => false,
        'level' => 60,
    ]);
    $user = createUserWithRole($role);

    actingAs($user)
        ->post('/admin/settings/site', [
            'site_name' => Str::random(10),
        ])
        ->assertForbidden();
});
