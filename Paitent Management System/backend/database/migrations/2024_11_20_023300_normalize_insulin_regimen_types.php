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
        // Normalize insulin_regimen_type values to standard types (BB, PTDS, PBD)
        // Map common variations to standard values
        DB::table('patients')
            ->whereNotNull('insulin_regimen_type')
            ->update([
                'insulin_regimen_type' => DB::raw("
                    CASE 
                        WHEN UPPER(insulin_regimen_type) IN ('BB', 'BASAL-BOLUS', 'BASAL BOLUS') THEN 'BB'
                        WHEN UPPER(insulin_regimen_type) IN ('PTDS', 'PREMIX TWICE DAILY + SGLT2I') THEN 'PTDS'
                        WHEN UPPER(insulin_regimen_type) IN ('PBD', 'PREMIX BASAL DAILY') THEN 'PBD'
                        WHEN UPPER(insulin_regimen_type) = 'BASAL' THEN 'BB'
                        WHEN UPPER(insulin_regimen_type) = 'BOLUS' THEN 'BB'
                        WHEN UPPER(insulin_regimen_type) IN ('NONE', 'N/A', '') THEN NULL
                        ELSE insulin_regimen_type
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
    }
};
