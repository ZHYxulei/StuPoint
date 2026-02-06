<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PluginSource extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'url',
        'api_key',
        'metadata',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
