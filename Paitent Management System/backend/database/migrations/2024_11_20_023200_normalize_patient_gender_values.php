<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Normalize gender values to title case (Male, Female, Other)
        DB::table('patients')
            ->whereNotNull('gender')
            ->update([
                'gender' => DB::raw("
                    CASE 
                        WHEN UPPER(gender) = 'MALE' THEN 'Male'
                        WHEN UPPER(gender) = 'FEMALE' THEN 'Female'
                        WHEN UPPER(gender) = 'OTHER' THEN 'Other'
                        ELSE gender
                    END
                ")
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this migration as it's a data normalization
        // If you need to reverse, you would need to store the original values first
    }
};
