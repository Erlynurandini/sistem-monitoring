<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        
        $rekapData = DB::table('jurnals') 
            ->select(
                'status', // Kategori pengelompokan secara dinamis
                DB::raw('count(*) as total_kegiatan'), 
                DB::raw('sum(jam_pelajaran) as total_jam') 
            )
            ->groupBy('status') // Mengelompokkan data secara dinamis
            ->get();

        // Statistik Umum Pendukung Dashboard
        $totalSiswa = DB::table('users')->where('role', 'siswa')->count();
        $totalDudi = DB::table('users')->where('role', 'dudi')->count();
        $totalGuru = DB::table('users')->where('role', 'guru')->count();

        // Mengembalikan hasil dalam format JSON khas API SIMON-PKL
        return response()->json([
            'success' => true,
            'message' => 'Data rekap agregat dashboard berhasil dimuat',
            'statistik_pengguna' => [
                'total_siswa' => $totalSiswa,
                'total_dudi' => $totalDudi,
                'total_guru' => $totalGuru,
            ],
            'rekap_agregat' => $rekapData
        ], 200);
    }
}