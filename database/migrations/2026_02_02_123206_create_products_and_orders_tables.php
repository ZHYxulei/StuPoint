<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Product categories table
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('product_categories')->onDelete('set null');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Products table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->bigInteger('points_required')->comment('Points needed to redeem');
            $table->integer('stock')->default(0)->comment('Available stock (-1 = unlimited)');
            $table->foreignId('category_id')->nullable()->constrained('product_categories')->onDelete('set null');
            $table->boolean('is_third_party')->default(false)->comment('Is this a third-party product?');
            $table->json('third_party_config')->nullable()->comment('Third-party API configuration');
            $table->enum('status', ['active', 'inactive', 'out_of_stock'])->default('active');
            $table->timestamps();
        });

        // Orders table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->bigInteger('points_spent')->comment('Points spent on this order');
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled', 'failed'])->default('pending');
            $table->json('shipping_info')->nullable()->comment('Shipping information');
            $table->string('third_party_order_id')->nullable()->comment('External order ID for third-party products');
            $table->json('metadata')->nullable()->comment('Additional order information');
            $table->timestamps();
        });

        // Order status history table
        Schema::create('order_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('note')->nullable();
            $table->foreignId('operator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_history');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
    }
};
