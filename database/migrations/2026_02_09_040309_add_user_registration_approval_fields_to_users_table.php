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
            $table->enum('registration_status', ['pending', 'approved', 'rejected'])->default('pending')->after('email_verified_at');
            $table->boolean('requires_review')->default(false)->after('registration_status');
            $table->unsignedBigInteger('reviewer_id')->nullable()->after('requires_review');
            $table->timestamp('reviewed_at')->nullable()->after('reviewer_id');
            $table->text('rejection_reason')->nullable()->after('reviewed_at');
            $table->unsignedBigInteger('class_id')->nullable()->after('rejection_reason');
            $table->unsignedBigInteger('grade_id')->nullable()->after('class_id');
            $table->string('student_union_department')->nullable()->after('grade_id');

            $table->foreign('reviewer_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('class_id')->references('id')->on('classes')->nullOnDelete();
            $table->foreign('grade_id')->references('id')->on('grades')->nullOnDelete();
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
