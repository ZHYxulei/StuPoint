<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    protected static array $roleSlugCache = [];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_has_roles')
            ->withPivot('metadata')
            ->withTimestamps();
    }

    public function permissions(): Collection
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('id');
    }

    public function hasRole(string $role): bool
    {
        if (! isset(static::$roleSlugCache[$this->id])) {
            static::$roleSlugCache[$this->id] = $this->roles()->pluck('slug')->toArray();
        }

        return in_array($role, static::$roleSlugCache[$this->id]);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->contains('slug', $permission);
    }

    public function isHeadTeacher(): bool
    {
        return (bool) $this->is_head_teacher;
    }

    public function assignRole(Role|string $role, ?array $metadata = null): self
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->attach($role, ['metadata' => $metadata]);
        unset(static::$roleSlugCache[$this->id]);

        return $this;
    }

    public function removeRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->detach($role);
        unset(static::$roleSlugCache[$this->id]);

        return $this;
    }

    public function syncRoles(array $roles): self
    {
        $roleIds = [];

        foreach ($roles as $roleData) {
            if (is_string($roleData)) {
                $role = Role::where('slug', $roleData)->firstOrFail();
                $roleIds[$role->id] = [];
            } elseif (is_array($roleData) && isset($roleData['role'])) {
                $role = $roleData['role'] instanceof Role
                    ? $roleData['role']
                    : Role::where('slug', $roleData['role'])->firstOrFail();
                $roleIds[$role->id] = ['metadata' => $roleData['metadata'] ?? null];
            } elseif ($roleData instanceof Role) {
                $roleIds[$roleData->id] = [];
            }
        }

        $this->roles()->sync($roleIds);
        unset(static::$roleSlugCache[$this->id]);

        return $this;
    }
}
