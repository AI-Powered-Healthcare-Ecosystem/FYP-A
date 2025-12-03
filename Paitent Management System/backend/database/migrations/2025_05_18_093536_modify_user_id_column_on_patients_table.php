<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class ModifyUserIdColumnOnPatientsTable extends Migration
{
    public function up()
    {
        // Skip entirely in testing environment (SQLite handles this differently)
        if (app()->environment('testing')) {
            return;
        }

        // Drop the existing unique index manually (MySQL)
        DB::statement('ALTER TABLE patients DROP INDEX patients_user_id_unique');

        // Then modify the user_id column to be nullable and unique
        Schema::table('patients', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->unique()->change();
        });
    }

    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });
    }
}
