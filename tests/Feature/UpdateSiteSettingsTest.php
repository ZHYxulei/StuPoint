<?php

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

it('stores favicon upload as file path', function () {
    Storage::fake('public');

    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    Setting::set('site_favicon', 'https://example.com/old.ico', 'string', 'site');

    $file = UploadedFile::fake()->createWithContent(
        'favicon.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', true),
    );

    actingAs($user)
        ->post('/admin/settings/site', [
            'site_favicon' => 'https://example.com/old.ico',
            'site_favicon_upload' => $file,
        ])
        ->assertRedirect();

    $path = Setting::get('site_favicon_path');
    expect($path)->toBeString();
    Storage::disk('public')->assertExists($path);
    expect(Setting::get('site_favicon_data'))->toBeNull();
    expect(Setting::get('site_favicon'))->toBe('');
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

it('does not expose stored secrets to the settings page', function () {
    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    Setting::set('mail_password', 'super-secret-smtp', 'string', 'mail');
    Setting::set('sms_tencent_secret_key', 'super-secret-sms', 'string', 'sms');
    Setting::set('captcha_google_secret_key', 'super-secret-captcha', 'string', 'captcha');

    $response = actingAs($user)->get('/admin/settings');

    $response->assertOk();

    $props = json_encode($response->inertiaProps());

    expect($props)
        ->not->toContain('super-secret-smtp')
        ->not->toContain('super-secret-sms')
        ->not->toContain('super-secret-captcha');

    expect($response->inertiaProps('mailSettings.mail_password_set'))->toBeTrue()
        ->and($response->inertiaProps('smsSettings.sms_tencent_secret_key_set'))->toBeTrue()
        ->and($response->inertiaProps('captchaSettings.captcha_google_secret_key_set'))->toBeTrue();
});

it('keeps the stored secret when the settings form submits a blank secret', function () {
    $role = Role::create([
        'name' => 'Super Admin',
        'slug' => 'super_admin',
        'description' => 'System administrator',
        'is_system' => true,
        'level' => 100,
    ]);
    $user = createUserWithRole($role);

    Setting::set('mail_password', 'super-secret-smtp', 'string', 'mail');

    actingAs($user)
        ->post('/admin/settings/mail', [
            'mail_host' => 'smtp.example.com',
            'mail_password' => '',
        ])
        ->assertRedirect();

    expect(Setting::get('mail_password'))->toBe('super-secret-smtp');
});
