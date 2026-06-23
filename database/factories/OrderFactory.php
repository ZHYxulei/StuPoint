<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'order_no' => 'ORD-'.fake()->unique()->numerify('##########'),
            'user_id' => User::factory(),
            'product_id' => Product::factory(),
            'points_spent' => fake()->numberBetween(10, 1000),
            'status' => 'pending',
            'shipping_info' => [
                'name' => fake()->name(),
                'phone' => fake()->phoneNumber(),
                'address' => fake()->address(),
            ],
            'third_party_order_id' => null,
            'metadata' => null,
            'verification_code' => null,
            'verification_code_expires_at' => null,
            'verified_at' => null,
            'verified_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function approved(): static
    {
        return $this->state(['status' => 'approved']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled']);
    }

    public function withVerificationCode(): static
    {
        return $this->state([
            'verification_code' => fake()->numerify('######'),
            'verification_code_expires_at' => now()->addHours(24),
        ]);
    }

    public function verified(): static
    {
        return $this->state([
            'status' => 'completed',
            'verified_at' => now(),
            'verified_by' => User::factory(),
        ]);
    }
}
