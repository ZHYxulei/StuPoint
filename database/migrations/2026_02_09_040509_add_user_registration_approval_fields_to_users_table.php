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
            // Check and add columns only if they don't exist
            if (! Schema::hasColumn('users', 'registration_status')) {
                $table->enum('registration_status', ['pending', 'approved', 'rejected'])->default('pending')->after('email_verified_at');
            }
            if (! Schema::hasColumn('users', 'requires_review')) {
                $table->boolean('requires_review')->default(false)->after('registration_status');
            }
            if (! Schema::hasColumn('users', 'reviewer_id')) {
                $table->unsignedBigInteger('reviewer_id')->nullable()->after('requires_review');
            }
            if (! Schema::hasColumn('users', 'reviewed_at')) {
                $table->timestamp('reviewed_at')->nullable()->after('reviewer_id');
            }
            if (! Schema::hasColumn('users', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('reviewed_at');
            }
            if (! Schema::hasColumn('users', 'class_id')) {
                $table->unsignedBigInteger('class_id')->nullable()->after('rejection_reason');
            }
            if (! Schema::hasColumn('users', 'grade_id')) {
                $table->unsignedBigInteger('grade_id')->nullable()->after('class_id');
            }
            if (! Schema::hasColumn('users', 'student_union_department')) {
                $table->string('student_union_department')->nullable()->after('grade_id');
            }

            // Add foreign keys if they don't exist
            if (! Schema::hasColumn('users', 'registration_status')) {
                $table->foreign('reviewer_id')->references('id')->on('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'class_id')) {
                $table->foreign('class_id')->references('id')->on('classes')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'grade_id')) {
                $table->foreign('grade_id')->references('id')->on('grades')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['reviewer_id']);
            $table->dropForeign(['class_id']);
            $table->dropForeign(['grade_id']);

            $table->dropColumn([
                'registration_status',
                'requires_review',
                'reviewer_id',
                'reviewed_at',
                'rejection_reason',
                'class_id',
                'grade_id',
                'student_union_department',
            ]);
        });
    }
};
