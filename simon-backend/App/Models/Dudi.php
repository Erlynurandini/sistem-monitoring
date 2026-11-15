<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dudi extends Model
{
    use HasFactory;
    protected $table = 'dudis';
    protected $fillable = [
        'nama_dudi',
        'bidang_usaha',
        'alamat',
        'nama_pembimbing',
        'email',
        'password'
    ];
}