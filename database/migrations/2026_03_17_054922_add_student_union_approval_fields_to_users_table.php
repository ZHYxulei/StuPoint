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
            if (! Schema::hasColumn('users', 'head_teacher_approved_at')) {
                $table->timestamp('head_teacher_approved_at')->nullable()->after('reviewed_at');
            }

            if (! Schema::hasColumn('users', 'grade_director_approved_at')) {
                $table->timestamp('grade_director_approved_at')->nullable()->after('head_teacher_approved_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'grade_director_approved_at')) {
                $table->dropColumn('grade_director_approved_at');
            }

            if (Schema::hasColumn('users', 'head_teacher_approved_at')) {
                $table->dropColumn('head_teacher_approved_at');
            }
        });
    }
};
