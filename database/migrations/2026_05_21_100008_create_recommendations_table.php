<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_result_id')->constrained('analysis_results')->cascadeOnDelete();
            $table->foreignId('nrc_id')->constrained('nrcs')->cascadeOnDelete();
            $table->string('pattern');
            $table->decimal('support_percentage', 5, 2);
            $table->string('category')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
