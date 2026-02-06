<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plugin extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'version',
        'description',
        'author',
        'status',
        'dependencies',
        'config',
        'installed_at',
        'enabled_at',
    ];

    protected function casts(): array
    {
        return [
            'dependencies' => 'array',
            'config' => 'array',
            'installed_at' => 'datetime',
            'enabled_at' => 'datetime',
        ];
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(PluginPermission::class);
    }

    public function scopeEnabled($query)
    {
        return $query->where('status', 'enabled');
    }

    public function scopeDisabled($query)
    {
        return $query->where('status', 'disabled');
    }

    public function enable(): void
    {
        $this->update(['status' => 'enabled', 'enabled_at' => now()]);
    }

    public function disable(): void
    {
        $this->update(['status' => 'disabled']);
    }

    public function isInstalled(): bool
    {
        return in_array($this->status, ['installed', 'enabled', 'disabled']);
    }

    public function isEnabled(): bool
    {
        return $this->status === 'enabled';
    }
}
