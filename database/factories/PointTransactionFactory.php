<?php

namespace Database\Factories;

use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PointTransactionFactory extends Factory
{
    protected $model = PointTransaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['total', 'redeemable']),
            'amount' => fake()->numberBetween(-100, 100),
            'balance_after' => fake()->numberBetween(0, 1000),
            'source' => fake()->randomElement(['manual_adjust', 'exchange', 'system']),
            'description' => fake()->sentence(),
            'metadata' => null,
            'operator_id' => null,
        ];
    }

    public function added(): static
    {
        return $this->state([
            'type' => 'total',
            'amount' => fake()->numberBetween(1, 100),
        ]);
    }

    public function deducted(): static
    {
        return $this->state([
            'type' => 'total',
            'amount' => fake()->numberBetween(-100, -1),
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(['user_id' => $user->id]);
    }

    public function withSource(string $source): static
    {
        return $this->state(['source' => $source]);
    }
}
