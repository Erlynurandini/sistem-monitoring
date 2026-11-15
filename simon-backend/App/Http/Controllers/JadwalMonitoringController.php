<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JadwalMonitoring;
use Exception;

class JadwalMonitoringController extends Controller
{
    public function index()
    {
        try {
            $jadwal = JadwalMonitoring::all();
            return response()->json([
                'success' => true,
                'data' => $jadwal
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Gabungkan tanggal dan jam menjadi format datetime (YYYY-MM-DD HH:mm:ss)
            $waktuJadwal = $request->tanggal . ' ' . ($request->jam ?? '08:00') . ':00';

            $jadwal = JadwalMonitoring::create([
                'guru_pembimbing' => $request->guru_pembimbing,
                'perusahaan' => $request->perusahaan,
                'alamat' => $request->alamat ?? 'Alamat Mitra DUDI',
                'siswa' => $request->siswa, // Input siswa manual dari admin
                'jadwal' => $waktuJadwal,
                'keterangan' => $request->keterangan ?? '-',
                'status' => 'Terjadwal'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal monitoring berhasil ditambahkan',
                'data' => $jadwal
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}