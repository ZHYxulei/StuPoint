<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model
{
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function classes(): HasMany
    {
        return $this->hasMany(ClassModel::class);
    }

    public function hasTeachers(): bool
    {
        return ClassTeacher::whereHas('class', fn ($q) => $q->where('grade_id', $this->id))->exists();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
