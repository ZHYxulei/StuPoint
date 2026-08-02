<?php

use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Models\UserPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['registration_status' => 'approved']);
});

describe('Products', function () {
    it('returns paginated products', function () {
        $category = ProductCategory::factory()->create();
        Product::factory()->count(3)->create(['category_id' => $category->id, 'status' => 'active']);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/shop/products');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'name', 'description', 'points_required', 'stock', 'category'],
                ],
                'meta',
            ])
            ->assertJson(['success' => true]);

        expect($response->json('data'))->toHaveCount(3);
    });

    it('filters by category', function () {
        $category1 = ProductCategory::factory()->create();
        $category2 = ProductCategory::factory()->create();
        Product::factory()->count(2)->create(['category_id' => $category1->id, 'status' => 'active']);
        Product::factory()->count(3)->create(['category_id' => $category2->id, 'status' => 'active']);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/shop/products?category='.$category1->id);

        $response->assertOk();

        expect($response->json('data'))->toHaveCount(2);
    });

    it('only returns active products', function () {
        Product::factory()->count(2)->active()->create();
        Product::factory()->count(3)->inactive()->create();

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/shop/products');

        $response->assertOk();

        expect($response->json('data'))->toHaveCount(2);
    });
});

describe('Orders', function () {
    it('returns user orders', function () {
        $product = Product::factory()->create(['status' => 'active', 'stock' => 10]);
        UserPoint::create(['user_id' => $this->user->id, 'total_points' => 1000, 'redeemable_points' => 1000]);

        // Create order
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/shop/orders', [
                'product_id' => $product->id,
                'quantity' => 1,
                'shipping_info' => [
                    'name' => 'Test User',
                    'phone' => '1234567890',
                    'address' => '123 Test St',
                ],
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Get orders
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/shop/orders');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'order_no', 'product', 'points_spent', 'status'],
                ],
            ]);

        expect($response->json('data'))->toHaveCount(1);
    });

    it('returns an active unexpired verification code only to the order owner', function () {
        $product = Product::factory()->create();
        $activeOrder = Order::factory()->for($this->user)->for($product)->create([
            'status' => 'pending',
            'verification_code' => '123456',
            'verification_code_expires_at' => now()->addHour(),
        ]);
        Order::factory()->for($this->user)->for($product)->completed()->create([
            'verification_code' => '222222',
            'verification_code_expires_at' => now()->addHour(),
        ]);
        Order::factory()->for($this->user)->for($product)->cancelled()->create([
            'verification_code' => '333333',
            'verification_code_expires_at' => now()->addHour(),
        ]);
        Order::factory()->for($this->user)->for($product)->create([
            'status' => 'pending',
            'verification_code' => '444444',
            'verification_code_expires_at' => now()->subMinute(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/shop/orders');

        $response->assertOk();

        $orders = collect($response->json('data'));

        expect($orders->firstWhere('id', $activeOrder->id))
            ->toHaveKey('verification_code', '123456');
        expect($orders->where('id', '!=', $activeOrder->id)->values()->all())
            ->each->not->toHaveKey('verification_code');
    });

    it('does not expose an order verification code through the resource to another user', function () {
        $owner = User::factory()->approved()->create();
        $order = Order::factory()->for($owner)->create([
            'status' => 'pending',
            'verification_code' => '987654',
            'verification_code_expires_at' => now()->addHour(),
        ]);

        $request = request()->duplicate();
        $request->setUserResolver(fn () => $this->user);

        $payload = (new OrderResource($order))->toResponse($request)->getData(true);

        expect($payload['data'])->not->toHaveKey('verification_code');
    });

    it('returns 400 with insufficient points', function () {
        $product = Product::factory()->create(['status' => 'active', 'stock' => 10, 'points_required' => 1000]);
        UserPoint::create(['user_id' => $this->user->id, 'total_points' => 100, 'redeemable_points' => 100]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/shop/orders', [
                'product_id' => $product->id,
                'quantity' => 1,
                'shipping_info' => [
                    'name' => 'Test User',
                    'phone' => '1234567890',
                    'address' => '123 Test St',
                ],
            ]);

        $response->assertStatus(400);
    });

    it('validates required fields', function () {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/shop/orders', []);

        $response->assertStatus(422);
    });
});
