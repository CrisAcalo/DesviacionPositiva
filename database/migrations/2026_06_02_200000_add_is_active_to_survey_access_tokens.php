<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('survey_access_tokens', function (Blueprint $table) {
            // Permite deshabilitar el acceso de un estudiante individual
            // sin cerrar toda la encuesta del grupo.
            $table->boolean('is_active')->default(true)->after('token');
        });
    }

    public function down(): void
    {
        Schema::table('survey_access_tokens', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
