<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the head_teacher and teacher roles
        $headTeacherRole = Role::where('slug', 'head_teacher')->first();
        $teacherRole = Role::where('slug', 'teacher')->first();

        if (! $headTeacherRole || ! $teacherRole) {
            // Roles don't exist, nothing to migrate
            return;
        }

        DB::transaction(function () use ($headTeacherRole, $teacherRole) {
            // Get all user IDs that have the head_teacher role
            $userIdsWithHeadTeacherRole = DB::table('user_has_roles')
                ->where('role_id', $headTeacherRole->id)
                ->pluck('user_id');

            if ($userIdsWithHeadTeacherRole->isNotEmpty()) {
                // Update users to set is_head_teacher flag
                User::whereIn('id', $userIdsWithHeadTeacherRole)
                    ->update(['is_head_teacher' => true]);

                // Update role_user relationships to use teacher role
                // Delete old head_teacher role assignments
                DB::table('user_has_roles')
                    ->where('role_id', $headTeacherRole->id)
                    ->delete();

                // Add teacher role assignments for these users (avoiding duplicates)
                foreach ($userIdsWithHeadTeacherRole as $userId) {
                    $existing = DB::table('user_has_roles')
                        ->where('user_id', $userId)
                        ->where('role_id', $teacherRole->id)
                        ->first();

                    if (! $existing) {
                        DB::table('user_has_roles')->insert([
                            'user_id' => $userId,
                            'role_id' => $teacherRole->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            // Delete the head_teacher role
            $headTeacherRole->delete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the head_teacher role
        $headTeacherRole = Role::create([
            'name' => 'Head Teacher',
            'slug' => 'head_teacher',
            'description' => 'Head teacher/Class teacher',
            'is_system' => false,
            'level' => 65,
        ]);

        // Get all users with is_head_teacher flag
        $usersWithIsHeadTeacher = User::where('is_head_teacher', true)->get();

        foreach ($usersWithIsHeadTeacher as $user) {
            // Remove teacher role assignment
            DB::table('user_has_roles')
                ->where('user_id', $user->id)
                ->where('role_id', Role::where('slug', 'teacher')->value('id'))
                ->delete();

            // Add head_teacher role assignment
            DB::table('user_has_roles')->insert([
                'user_id' => $user->id,
                'role_id' => $headTeacherRole->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
};
