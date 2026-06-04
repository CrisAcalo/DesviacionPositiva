<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Eliminar tabla preexistente con esquema anterior (columnas: pattern, support_percentage, etc.)
        Schema::dropIfExists('recommendations');

        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nrc_id')->constrained()->cascadeOnDelete();
            $table->foreignId('analysis_result_id')->constrained()->cascadeOnDelete();
            // 'practice' = recurso/estrategia validada del grupo alto
            // 'barrier'  = dificultad predominante del grupo en riesgo
            $table->enum('type', ['practice', 'barrier']);
            // Texto de la pregunta (snapshot para evitar dependencia futura)
            $table->string('question_snapshot');
            // Respuesta ganadora (snapshot)
            $table->string('answer_snapshot');
            $table->decimal('percentage', 5, 2);
            $table->unsignedInteger('frequency');
            $table->unsignedInteger('total');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
