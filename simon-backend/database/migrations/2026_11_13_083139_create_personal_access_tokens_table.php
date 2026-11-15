<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('discipline')->nullable();
            $table->integer('skills')->nullable();
            $table->integer('attitude')->nullable();
            $table->text('notes')->nullable();
            
            $table->integer('nilai_laporan')->nullable();
            $table->integer('nilai_seminar')->nullable();
            $table->text('catatan_guru')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'discipline',
                'skills',
                'attitude',
                'notes',
                'nilai_laporan',
                'nilai_seminar',
                'catatan_guru'
            ]);
        });
    }
};