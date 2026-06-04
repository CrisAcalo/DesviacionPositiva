<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // El hash global era incorrecto: el mismo estudiante puede aparecer
            // en varios NRCs (distintas materias). La unicidad real es (hash, nrc).
            $table->dropUnique('students_identifier_hash_unique');
            $table->unique(['identifier_hash', 'nrc_id'], 'students_identifier_hash_nrc_unique');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('students_identifier_hash_nrc_unique');
            $table->unique('identifier_hash', 'students_identifier_hash_unique');
        });
    }
};
