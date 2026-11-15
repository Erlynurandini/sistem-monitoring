<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jurnal extends Model
{
    use HasFactory;

    protected $table = 'jurnals';

    // Kolom yang diizinkan untuk mass assignment
    protected $fillable = [
        'nisn', 
        'tanggal', 
        'kegiatan', 
        'status', 
        'catatan_dudi',
        'foto' // <-- Tambahkan ini agar foto jurnal bisa disimpan ke database
    ];
}