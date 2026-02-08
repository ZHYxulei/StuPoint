<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find and remove duplicate roles based on slug
        // Keep the first occurrence of each slug and delete the rest
        $duplicates = DB::table('roles')
            ->select('slug', DB::raw('MIN(id) as min_id'))
            ->groupBy('slug')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $minId = $duplicate->min_id;

            // Delete all duplicate records except the one with minimum id
            DB::table('roles')
                ->where('slug', $duplicate->slug)
                ->where('id', '!=', $minId)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be easily reversed
        // as we don't know which records were deleted
    }
};
