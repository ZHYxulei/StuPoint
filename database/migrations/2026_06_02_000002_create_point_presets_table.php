<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // 预设名称：上课回答问题
            $table->enum('type', ['add', 'deduct']);    // 类型：加分/减分
            $table->integer('amount');                   // 分数：5 / -2
            $table->string('reason');                    // 加分原因
            $table->string('scope')->default('global');  // global / school / grade / class
            $table->unsignedBigInteger('scope_id')->nullable(); // 关联的年级/班级ID
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['scope', 'scope_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_presets');
    }
};
