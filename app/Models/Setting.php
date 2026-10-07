<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    /**
     * Cache key holding the whole settings table.
     */
    private const CACHE_KEY = 'settings.all';

    /**
     * Container binding holding this request's copy of the settings table.
     *
     * Reading settings one key at a time turned every request into dozens of
     * cache round trips — the shared Inertia payload, the view composer and
     * the mail config each read a dozen keys. One load serves them all. The
     * copy lives on the container rather than in a static so it cannot leak
     * between tests or between jobs in a long-running worker.
     */
    private const MEMO_KEY = 'settings.indexed';

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return static::indexed()[$key]['value'] ?? $default;
    }

    /**
     * Set a setting value by key (invalidates the cached table).
     */
    public static function set(string $key, mixed $value, string $type = 'string', ?string $group = null, ?string $description = null): self
    {
        static::flushCache();

        $setting = static::where('key', $key)->first();

        if ($setting) {
            $setting->update([
                'value' => static::encodeValue($value, $type),
            ]);

            return $setting;
        }

        return static::create([
            'key' => $key,
            'value' => static::encodeValue($value, $type),
            'type' => $type,
            'group' => $group,
            'description' => $description,
        ]);
    }

    /**
     * Get all settings in a group.
     *
     * @return array<string, mixed>
     */
    public static function getByGroup(string $group): array
    {
        $result = [];

        foreach (static::indexed() as $key => $setting) {
            if ($setting['group'] === $group) {
                $result[$key] = $setting['value'];
            }
        }

        return $result;
    }

    /**
     * Get all settings with their metadata.
     */
    public static function getAllWithMetadata(): array
    {
        return static::all()->toArray();
    }

    /**
     * Drop the per-request copy and the cached table.
     */
    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);

        if (app()->bound(self::MEMO_KEY)) {
            app()->forgetInstance(self::MEMO_KEY);
        }
    }

    /**
     * Every setting, keyed by its key, cast by type.
     *
     * @return array<string, array{key: string, value: mixed, group: string|null}>
     */
    protected static function indexed(): array
    {
        if (app()->bound(self::MEMO_KEY)) {
            return app(self::MEMO_KEY);
        }

        $settings = Cache::remember(self::CACHE_KEY, 3600, function (): array {
            return static::query()
                ->get()
                ->map(fn (self $setting): array => [
                    'key' => $setting->key,
                    'value' => static::castValue($setting->value, $setting->type),
                    'group' => $setting->group,
                ])
                ->all();
        });

        $indexed = [];

        foreach ($settings as $setting) {
            $indexed[$setting['key']] = $setting;
        }

        app()->instance(self::MEMO_KEY, $indexed);

        return $indexed;
    }

    /**
     * Cast value based on type.
     */
    protected static function castValue(mixed $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json', 'array' => json_decode($value, true) ?? $value,
            default => $value,
        };
    }

    /**
     * Encode value based on type.
     */
    protected static function encodeValue(mixed $value, string $type): string
    {
        return match ($type) {
            'json', 'array' => json_encode($value),
            'boolean' => $value ? 'true' : 'false',
            default => (string) ($value ?? ''),
        };
    }
}
