<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFreqSmbgToPatientsTable extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->integer('freq_smbg')->nullable()->after('fvg_delta_1_2')->comment('Frequency of Self-Monitoring Blood Glucose');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('freq_smbg');
        });
    }
}
