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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('student_id')->nullable()->unique()->after('phone');
            $table->string('grade')->nullable()->after('student_id');
            $table->string('class')->nullable()->after('grade');
            $table->boolean('is_head_teacher')->default(false)->after('class');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'student_id', 'grade', 'class', 'is_head_teacher']);
        });
    }
};
