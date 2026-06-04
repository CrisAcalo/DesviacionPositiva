<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('survey_questions', function (Blueprint $table) {
            $table->foreignId('question_bank_id')->nullable()->after('survey_id')->constrained('question_bank')->nullOnDelete();
        });

        // Remove open_text from the type enum (MySQL only; SQLite doesn't support MODIFY COLUMN)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE survey_questions MODIFY COLUMN `type` ENUM('likert','single_choice','multiple_choice') NOT NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE survey_questions MODIFY COLUMN `type` ENUM('likert','single_choice','multiple_choice','open_text') NOT NULL");
        }

        Schema::table('survey_questions', function (Blueprint $table) {
            $table->dropForeign(['question_bank_id']);
            $table->dropColumn('question_bank_id');
        });
    }
};
