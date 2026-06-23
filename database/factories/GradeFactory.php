<?php

namespace Database\Factories;

use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

class GradeFactory extends Factory
{
    protected $model = Grade::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['一年级', '二年级', '三年级', '四年级', '五年级', '六年级']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }

    public function active(): static
    {
        return $this->state(['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
