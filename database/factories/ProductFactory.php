<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(),
            'image' => null,
            'points_required' => fake()->numberBetween(10, 1000),
            'stock' => fake()->numberBetween(0, 100),
            'category_id' => ProductCategory::factory(),
            'is_third_party' => false,
            'third_party_config' => null,
            'status' => 'active',
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }

    public function unlimitedStock(): static
    {
        return $this->state(['stock' => -1]);
    }

    public function thirdParty(): static
    {
        return $this->state([
            'is_third_party' => true,
            'third_party_config' => ['api_url' => 'https://api.example.com'],
        ]);
    }
}
