<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Demographics
            $table->string('ethnicity', 50)->nullable()->after('gender');
            
            // Vitals
            $table->float('sbp')->nullable()->after('physical_activity')->comment('Systolic blood pressure');
            $table->float('dbp')->nullable()->after('sbp')->comment('Diastolic blood pressure');
            
            // Weight per visit
            $table->float('weight1')->nullable()->after('weight_kg')->comment('Weight at visit 1');
            $table->float('weight2')->nullable()->after('weight1')->comment('Weight at visit 2');
            $table->float('weight3')->nullable()->after('weight2')->comment('Weight at visit 3');
            
            // BMI per visit (stored, not computed)
            $table->float('bmi1')->nullable()->after('weight3')->comment('BMI at visit 1');
            $table->float('bmi3')->nullable()->after('bmi1')->comment('BMI at visit 3');
            
            // eGFR per visit
            $table->float('egfr1')->nullable()->after('egfr')->comment('eGFR at visit 1');
            $table->float('egfr3')->nullable()->after('egfr1')->comment('eGFR at visit 3');
            
            // UACR per visit
            $table->float('uacr1')->nullable()->after('egfr3')->comment('UACR at visit 1');
            $table->float('uacr3')->nullable()->after('uacr1')->comment('UACR at visit 3');
            
            // Visit gaps
            $table->float('gap_1_2_days')->nullable()->after('gap_from_first_clinical_visit')->comment('Days between visit 1 and 2');
            $table->float('gap_2_3_days')->nullable()->after('gap_1_2_days')->comment('Days between visit 2 and 3');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'ethnicity',
                'sbp', 'dbp',
                'weight1', 'weight2', 'weight3',
                'bmi1', 'bmi3',
                'egfr1', 'egfr3',
                'uacr1', 'uacr3',
                'gap_1_2_days', 'gap_2_3_days',
            ]);
        });
    }
};
