<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->foreignId('nrc_id')->after('id')->constrained('nrcs')->cascadeOnDelete();
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft')->after('description');
            $table->timestamp('activated_at')->nullable()->after('status');
            $table->timestamp('closes_at')->nullable()->after('activated_at');
            $table->foreignId('activated_by')->nullable()->after('closes_at')->constrained('users')->nullOnDelete();
            $table->dropColumn('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropForeign(['nrc_id']);
            $table->dropColumn(['nrc_id', 'status', 'activated_at', 'closes_at']);
            $table->dropForeign(['activated_by']);
            $table->dropColumn('activated_by');
            $table->boolean('is_active')->default(true);
        });
    }
};
