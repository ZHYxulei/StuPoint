<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class UserPolicy
{
    public function update(User $actor, User $target): bool
    {
        return $this->canManageUser($actor, $target);
    }

    public function syncRoles(User $actor, User $target): bool
    {
        return $this->canManageRoles($actor, $target);
    }

    public function assignRole(User $actor, User $target, Role $role): bool
    {
        if ($role->slug === 'super_admin') {
            return false;
        }

        return $this->canManageRoles($actor, $target);
    }

    public function updatePassword(User $actor, User $target): bool
    {
        return $this->canManageUser($actor, $target);
    }

    protected function canManageUser(User $actor, User $target): bool
    {
        return $actor->id !== $target->id
            && ($actor->hasRole('super_admin') || $actor->hasRole('admin'));
    }

    protected function canManageRoles(User $actor, User $target): bool
    {
        return $this->canManageUser($actor, $target);
    }
}
