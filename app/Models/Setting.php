<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    /**
     * Get a setting value by key (cached for 1 hour).
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("setting.{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            if (! $setting) {
                return $default;
            }

            return static::castValue($setting->value, $setting->type);
        });
    }

    /**
     * Set a setting value by key (invalidates cache).
     */
    public static function set(string $key, mixed $value, string $type = 'string', ?string $group = null, ?string $description = null): self
    {
        Cache::forget("setting.{$key}");

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
     * Get all settings by group (cached for 1 hour).
     */
    public static function getByGroup(string $group): array
    {
        return Cache::remember("setting.group.{$group}", 3600, function () use ($group) {
            $settings = static::where('group', $group)->get();
            $result = [];

            foreach ($settings as $setting) {
                $result[$setting->key] = static::castValue($setting->value, $setting->type);
            }

            return $result;
        });
    }

    /**
     * Get all settings with their metadata.
     */
    public static function getAllWithMetadata(): array
    {
        return static::all()->toArray();
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
