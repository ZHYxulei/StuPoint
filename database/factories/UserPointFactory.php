<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserPointFactory extends Factory
{
    protected $model = UserPoint::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'total_points' => fake()->numberBetween(0, 1000),
            'redeemable_points' => fn (array $attributes) => fake()->numberBetween(0, $attributes['total_points']),
        ];
    }

    public function withPoints(int $total, ?int $redeemable = null): static
    {
        return $this->state([
            'total_points' => $total,
            'redeemable_points' => $redeemable ?? $total,
        ]);
    }

    public function zero(): static
    {
        return $this->state([
            'total_points' => 0,
            'redeemable_points' => 0,
        ]);
    }
}
