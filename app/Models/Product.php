<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'image',
        'points_required',
        'stock',
        'category_id',
        'is_third_party',
        'third_party_config',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'points_required' => 'integer',
            'stock' => 'integer',
            'is_third_party' => 'boolean',
            'third_party_config' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->where('stock', '>', 0)->orWhere('stock', -1);
        });
    }

    public function hasStock(): bool
    {
        return $this->stock === -1 || $this->stock > 0;
    }

    public function decreaseStock(int $quantity = 1): void
    {
        if ($this->stock !== -1) {
            $this->decrement('stock', $quantity);
        }
    }

    public function increaseStock(int $quantity = 1): void
    {
        if ($this->stock !== -1) {
            $this->increment('stock', $quantity);
        }
    }
}
