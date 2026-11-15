<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalMonitoring extends Model
{
    use HasFactory;

    protected $table = 'jadwal_monitorings';

    protected $fillable = [
        'guru_pembimbing',
        'perusahaan',
        'alamat',
        'siswa',
        'jadwal',
        'keterangan',
        'status'
    ];
}