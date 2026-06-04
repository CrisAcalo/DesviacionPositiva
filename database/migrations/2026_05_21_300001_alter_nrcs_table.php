<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('nrcs', function (Blueprint $table) {
            $table->dropColumn(['subject_name', 'career', 'department', 'academic_period']);

            $table->foreignId('subject_id')->after('code')->constrained('subjects');
            $table->foreignId('career_id')->after('subject_id')->constrained('careers');
            $table->foreignId('academic_period_id')->after('career_id')->constrained('academic_periods');
        });
    }

    public function down(): void
    {
        Schema::table('nrcs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subject_id');
            $table->dropConstrainedForeignId('career_id');
            $table->dropConstrainedForeignId('academic_period_id');

            $table->string('subject_name');
            $table->string('career');
            $table->string('department')->nullable();
            $table->string('academic_period');
        });
    }
};
