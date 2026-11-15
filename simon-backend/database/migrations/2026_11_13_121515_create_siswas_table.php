<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_siswa');
            $table->string('nisn')->unique();
            $table->string('email')->nullable();
            $table->string('kelas')->nullable();
            $table->string('tempat_pkl')->nullable();
            $table->string('pembimbing_dudi')->nullable();
            $table->string('guru_pembimbing')->nullable();
            $table->string('status')->default('Aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};