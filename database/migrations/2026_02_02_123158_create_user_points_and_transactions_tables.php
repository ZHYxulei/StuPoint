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
        // User points table
        Schema::create('user_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->bigInteger('total_points')->default(0)->comment('Total accumulated points');
            $table->bigInteger('redeemable_points')->default(0)->comment('Points available for redemption');
            $table->timestamps();
        });

        // Point transactions table
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['total', 'redeemable'])->comment('Type of points affected');
            $table->bigInteger('amount')->comment('Amount changed (positive or negative)');
            $table->bigInteger('balance_after')->comment('Balance after this transaction');
            $table->string('source')->comment('Source of the points (e.g., sign_in, task, manual)');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable()->comment('Additional data');
            $table->foreignId('operator_id')->nullable()->constrained('users')->onDelete('set null')->comment('User who initiated this change');
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index('created_at');
        });

        // Point rules table (optional)
        Schema::create('point_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('type', ['total', 'both'])->default('both')->comment('Which type of points to award');
            $table->bigInteger('amount')->comment('Points awarded');
            $table->unsignedInteger('max_daily_times')->default(0)->comment('0 = unlimited');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('conditions')->nullable()->comment('Conditions to trigger this rule');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_rules');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('user_points');
    }
};
