<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('registration_status');
            $table->index('class_id');
            $table->index('grade_id');
            $table->index('requires_review');
            $table->index(['registration_status', 'requires_review']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('order_no');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('status');
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['registration_status']);
            $table->dropIndex(['class_id']);
            $table->dropIndex(['grade_id']);
            $table->dropIndex(['requires_review']);
            $table->dropIndex(['registration_status', 'requires_review']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['order_no']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['category_id']);
        });
    }
};
