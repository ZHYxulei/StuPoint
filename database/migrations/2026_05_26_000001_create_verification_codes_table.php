<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20);
            $table->string('code', 10);
            $table->string('type', 20);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index(['phone', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
    }
};
