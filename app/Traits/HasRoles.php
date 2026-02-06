<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
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
        return $this->roles()->where('slug', $role)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->contains('slug', $permission);
    }

    public function isHeadTeacher(): bool
    {
        return $this->is_head_teacher || $this->hasRole('head_teacher');
    }

    public function assignRole(Role|string $role, ?array $metadata = null): self
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->attach($role, ['metadata' => $metadata]);

        return $this;
    }

    public function removeRole(Role|string $role): self
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->detach($role);

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

        return $this;
    }
}
