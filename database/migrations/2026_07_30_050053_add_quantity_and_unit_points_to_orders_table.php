<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('quantity')->default(1)->after('product_id')->comment('Ordered quantity snapshot');
            $table->bigInteger('unit_points_spent')->default(0)->after('quantity')->comment('Unit points snapshot at order time');
        });

        DB::table('orders')->update([
            'quantity' => 1,
            'unit_points_spent' => DB::raw('points_spent'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'unit_points_spent']);
        });
    }
};
