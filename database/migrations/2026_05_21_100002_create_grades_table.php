<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('nrc_id')->constrained('nrcs')->cascadeOnDelete();
            $table->decimal('partial_1', 4, 2)->nullable();
            $table->decimal('partial_2', 4, 2)->nullable();
            $table->decimal('final_exam', 4, 2)->nullable();
            $table->decimal('final_grade', 4, 2);
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'nrc_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
