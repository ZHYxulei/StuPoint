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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('verification_code', 6)->nullable()->unique()->after('order_no')->comment('6位验证码，用于核销');
            $table->timestamp('verified_at')->nullable()->after('updated_at')->comment('核销时间');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->onDelete('set null')->comment('核销人');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['orders_verified_by_foreign']);
            $table->dropColumn(['verification_code', 'verified_at', 'verified_by']);
        });
    }
};
