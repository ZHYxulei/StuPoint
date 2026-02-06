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
        Schema::create('parent_child', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->comment('家长ID');
            $table->unsignedBigInteger('child_id')->comment('子女ID');
            $table->string('relationship', 20)->nullable()->comment('关系：父亲、母亲、其他');
            $table->boolean('is_approved')->default(false)->comment('是否已确认');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('child_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['parent_id', 'child_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_child');
    }
};
