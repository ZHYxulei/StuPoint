<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_binding_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('code_hash', 64)->unique();
            $table->string('code_last_four', 4);
            $table->string('purpose', 32)->default('parent_binding');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->foreignId('consumed_by_parent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'expires_at']);
            $table->index(['student_id', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_binding_invitations');
    }
};
