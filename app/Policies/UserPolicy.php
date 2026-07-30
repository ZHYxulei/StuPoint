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
        return $this->canManageRoles($actor, $target)
            && $role->slug !== 'super_admin';
    }

    protected function canManageUser(User $actor, User $target): bool
    {
        return $actor->id !== $target->id
            && $actor->hasRole('super_admin');
    }

    protected function canManageRoles(User $actor, User $target): bool
    {
        return $this->canManageUser($actor, $target);
    }
}
