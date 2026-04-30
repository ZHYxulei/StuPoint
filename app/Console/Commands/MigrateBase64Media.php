<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class MigrateBase64Media extends Command
{
    protected $signature = 'media:migrate-base64';

    protected $description = 'Migrate legacy base64 avatars and favicon data to public file storage';

    public function handle(): int
    {
        $avatarStats = ['migrated' => 0, 'skipped' => 0, 'failed' => 0];
        $faviconStats = ['migrated' => 0, 'skipped' => 0, 'failed' => 0];

        User::query()
            ->whereNotNull('avatar')
            ->select(['id', 'avatar', 'avatar_path'])
            ->chunkById(100, function ($users) use (&$avatarStats) {
                foreach ($users as $user) {
                    if (! is_string($user->avatar) || ! str_starts_with($user->avatar, 'data:image/')) {
                        $avatarStats['skipped']++;
                        continue;
                    }

                    if (is_string($user->avatar_path) && $user->avatar_path !== '') {
                        $avatarStats['skipped']++;
                        continue;
                    }

                    try {
                        $stored = $this->storeDataUri($user->avatar, "avatars/{$user->id}", 'avatar');

                        if ($stored === null) {
                            $avatarStats['failed']++;
                            $this->warn("Avatar decode failed for user #{$user->id}");
                            continue;
                        }

                        $user->forceFill([
                            'avatar_path' => $stored,
                            'avatar' => null,
                        ])->save();

                        $avatarStats['migrated']++;
                    } catch (Throwable $e) {
                        $avatarStats['failed']++;
                        $this->warn("Avatar migrate failed for user #{$user->id}: {$e->getMessage()}");
                    }
                }
            });

        $legacyFavicon = Setting::query()->where('key', 'site_favicon_data')->first();
        $existingFaviconPath = Setting::get('site_favicon_path');

        if (! $legacyFavicon || ! is_string($legacyFavicon->value) || ! str_starts_with($legacyFavicon->value, 'data:image/')) {
            $faviconStats['skipped']++;
        } elseif (is_string($existingFaviconPath) && $existingFaviconPath !== '') {
            $faviconStats['skipped']++;
        } else {
            try {
                $stored = $this->storeDataUri($legacyFavicon->value, 'site/favicon', 'favicon');

                if ($stored === null) {
                    $faviconStats['failed']++;
                    $this->warn('Favicon decode failed');
                } else {
                    Setting::set('site_favicon_path', $stored, 'string', 'site');
                    $legacyFavicon->delete();
                    $faviconStats['migrated']++;
                }
            } catch (Throwable $e) {
                $faviconStats['failed']++;
                $this->warn('Favicon migrate failed: '.$e->getMessage());
            }
        }

        $this->table(
            ['Type', 'Migrated', 'Skipped', 'Failed'],
            [
                ['avatars', $avatarStats['migrated'], $avatarStats['skipped'], $avatarStats['failed']],
                ['favicon', $faviconStats['migrated'], $faviconStats['skipped'], $faviconStats['failed']],
            ]
        );

        return ($avatarStats['failed'] + $faviconStats['failed']) > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function storeDataUri(string $dataUri, string $directory, string $prefix): ?string
    {
        if (! preg_match('/^data:image\/(?P<type>[a-zA-Z0-9.+-]+);base64,(?P<data>.+)$/', $dataUri, $matches)) {
            return null;
        }

        $extension = $this->normalizeExtension(strtolower($matches['type']));
        if ($extension === null) {
            return null;
        }

        $decoded = base64_decode($matches['data'], true);
        if ($decoded === false) {
            return null;
        }

        $path = sprintf('%s/%s-%s.%s', trim($directory, '/'), $prefix, Str::uuid()->toString(), $extension);
        Storage::disk('public')->put($path, $decoded);

        return $path;
    }

    protected function normalizeExtension(string $type): ?string
    {
        return match ($type) {
            'jpeg', 'jpg' => 'jpg',
            'png' => 'png',
            'gif' => 'gif',
            'webp' => 'webp',
            'x-icon', 'vnd.microsoft.icon', 'ico' => 'ico',
            default => null,
        };
    }
}
