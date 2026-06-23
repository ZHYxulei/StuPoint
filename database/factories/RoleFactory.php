<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'name' => fake()->jobTitle(),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->sentence(),
            'is_system' => false,
            'level' => fake()->numberBetween(1, 100),
        ];
    }

    public function student(): static
    {
        return $this->state([
            'name' => '学生',
            'slug' => 'student',
            'description' => '学生角色',
            'is_system' => true,
            'level' => 1,
        ]);
    }

    public function teacher(): static
    {
        return $this->state([
            'name' => '教师',
            'slug' => 'teacher',
            'description' => '教师角色',
            'is_system' => true,
            'level' => 50,
        ]);
    }

    public function admin(): static
    {
        return $this->state([
            'name' => '管理员',
            'slug' => 'admin',
            'description' => '系统管理员',
            'is_system' => true,
            'level' => 90,
        ]);
    }

    public function superAdmin(): static
    {
        return $this->state([
            'name' => '超级管理员',
            'slug' => 'super_admin',
            'description' => '超级管理员',
            'is_system' => true,
            'level' => 100,
        ]);
    }

    public function headTeacher(): static
    {
        return $this->state([
            'name' => '班主任',
            'slug' => 'head_teacher',
            'description' => '班主任角色',
            'is_system' => true,
            'level' => 60,
        ]);
    }

    public function gradeDirector(): static
    {
        return $this->state([
            'name' => '年级主任',
            'slug' => 'grade_director',
            'description' => '年级主任角色',
            'is_system' => true,
            'level' => 70,
        ]);
    }

    public function principal(): static
    {
        return $this->state([
            'name' => '校长',
            'slug' => 'principal',
            'description' => '校长角色',
            'is_system' => true,
            'level' => 80,
        ]);
    }
}
