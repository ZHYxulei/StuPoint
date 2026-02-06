<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'System administrator with all permissions',
                'is_system' => true,
                'level' => 100,
            ],
            [
                'name' => 'Principal',
                'slug' => 'principal',
                'description' => 'School principal',
                'is_system' => true,
                'level' => 90,
            ],
            [
                'name' => 'Grade Director',
                'slug' => 'grade_director',
                'description' => 'Grade director',
                'is_system' => true,
                'level' => 80,
            ],
            [
                'name' => 'Teacher',
                'slug' => 'teacher',
                'description' => 'Teacher',
                'is_system' => true,
                'level' => 60,
            ],
            [
                'name' => 'Head Teacher',
                'slug' => 'head_teacher',
                'description' => 'Head teacher/Class teacher',
                'is_system' => true,
                'level' => 65,
            ],
            [
                'name' => 'Student',
                'slug' => 'student',
                'description' => 'Student',
                'is_system' => true,
                'level' => 40,
            ],
            [
                'name' => 'Parent',
                'slug' => 'parent',
                'description' => 'Parent',
                'is_system' => true,
                'level' => 30,
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        // Create permissions
        $permissions = [
            // User management
            ['name' => 'Manage Users', 'slug' => 'users.manage', 'module' => 'users'],
            ['name' => 'View Users', 'slug' => 'users.view', 'module' => 'users'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'module' => 'users'],
            ['name' => 'Edit Users', 'slug' => 'users.edit', 'module' => 'users'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'module' => 'users'],

            // Role management
            ['name' => 'Manage Roles', 'slug' => 'roles.manage', 'module' => 'roles'],
            ['name' => 'View Roles', 'slug' => 'roles.view', 'module' => 'roles'],
            ['name' => 'Assign Roles', 'slug' => 'roles.assign', 'module' => 'roles'],

            // Points management
            ['name' => 'Manage Points', 'slug' => 'points.manage', 'module' => 'points'],
            ['name' => 'View Points', 'slug' => 'points.view', 'module' => 'points'],
            ['name' => 'Add Points', 'slug' => 'points.add', 'module' => 'points'],
            ['name' => 'Deduct Points', 'slug' => 'points.deduct', 'module' => 'points'],

            // Shop management
            ['name' => 'Manage Shop', 'slug' => 'shop.manage', 'module' => 'shop'],
            ['name' => 'View Products', 'slug' => 'shop.products.view', 'module' => 'shop'],
            ['name' => 'Create Products', 'slug' => 'shop.products.create', 'module' => 'shop'],
            ['name' => 'Edit Products', 'slug' => 'shop.products.edit', 'module' => 'shop'],
            ['name' => 'Delete Products', 'slug' => 'shop.products.delete', 'module' => 'shop'],
            ['name' => 'Manage Orders', 'slug' => 'shop.orders.manage', 'module' => 'shop'],

            // Plugin management
            ['name' => 'Manage Plugins', 'slug' => 'plugins.manage', 'module' => 'plugins'],
            ['name' => 'View Plugins', 'slug' => 'plugins.view', 'module' => 'plugins'],
            ['name' => 'Install Plugins', 'slug' => 'plugins.install', 'module' => 'plugins'],
            ['name' => 'Enable/Disable Plugins', 'slug' => 'plugins.toggle', 'module' => 'plugins'],

            // Settings
            ['name' => 'Manage Settings', 'slug' => 'settings.manage', 'module' => 'settings'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        // Assign all permissions to super admin
        $superAdmin = Role::where('slug', 'super_admin')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->sync(Permission::all()->pluck('id'));
        }
    }
}
