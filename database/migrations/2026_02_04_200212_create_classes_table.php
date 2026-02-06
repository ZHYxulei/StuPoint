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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->comment('班级名称');
            $table->string('grade', 50)->comment('年级');
            $table->unsignedBigInteger('head_teacher_id')->nullable()->comment('班主任ID');
            $table->timestamps();

            $table->index('grade');
            $table->foreign('head_teacher_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
