<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('nrc_id')->constrained('nrcs')->cascadeOnDelete();
            $table->enum('group', ['high', 'medium', 'at_risk']);
            $table->timestamps();

            $table->unique(['student_id', 'nrc_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_groups');
    }
};
