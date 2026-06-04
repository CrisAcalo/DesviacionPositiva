<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar dependiente primero (FK constraint), luego la tabla principal
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('analysis_results');

        Schema::create('analysis_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nrc_id')->constrained()->cascadeOnDelete();
            $table->foreignId('survey_question_id')->constrained()->cascadeOnDelete();
            $table->enum('group', ['high', 'medium', 'at_risk']);
            // Distribución completa de frecuencias: {"valor": conteo, ...}
            $table->json('frequencies');
            // Opción con mayor frecuencia
            $table->string('top_answer_value');
            $table->string('top_answer_label');
            $table->unsignedInteger('top_count');
            $table->unsignedInteger('total_responses');
            $table->decimal('top_percentage', 5, 2); // 0.00 – 100.00
            // true si top_percentage >= 60 (umbral de práctica validada)
            $table->boolean('is_validated')->default(false);
            $table->timestamps();

            $table->unique(['nrc_id', 'survey_question_id', 'group']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analysis_results');
    }
};
