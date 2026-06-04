<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nrcs', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('subject_name');
            $table->string('career');
            $table->string('department')->nullable();
            $table->string('academic_period');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->enum('status', ['pending', 'segmented', 'surveying', 'analyzed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nrcs');
    }
};
