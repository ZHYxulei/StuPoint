<?php

namespace Database\Factories;

use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['1班', '2班', '3班', '4班']),
            'grade' => fake()->randomElement(['一年级', '二年级', '三年级']),
            'grade_id' => Grade::factory(),
            'head_teacher_id' => null,
        ];
    }

    public function withHeadTeacher(?User $teacher = null): static
    {
        return $this->state([
            'head_teacher_id' => $teacher?->id ?? User::factory(),
        ]);
    }
}
