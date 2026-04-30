<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('stores uploaded avatar as file path', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('avatar.png', 256, 256);

    actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $file,
        ])
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->avatar_path)->toBeString();
    expect($user->avatar)->toContain('/storage/avatars/');
    Storage::disk('public')->assertExists($user->avatar_path);
});

it('removes avatar file when requested', function () {
    Storage::fake('public');

    $path = 'avatars/1/existing-avatar.png';
    Storage::disk('public')->put($path, 'avatar');

    $user = User::factory()->create([
        'avatar_path' => $path,
    ]);

    actingAs($user)
        ->patch('/settings/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'remove_avatar' => '1',
        ])
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});
