<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    use HasFactory;

    protected $table = 'presensis';

    protected $fillable = [
        'nisn', 
        'tanggal', 
        'jam_masuk', 
        'status', 
        'lokasi_gps', 
        'foto', 
        'file_bukti', 
        'keterangan'
    ];
}