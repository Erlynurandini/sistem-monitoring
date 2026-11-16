<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Presensi;
use Carbon\Carbon;
use Exception;

class PresensiController extends Controller
{
    // Method index untuk mengambil seluruh data presensi
    public function index()
    {
        try {
            $presensi = Presensi::all();
            return response()->json([
                'success' => true,
                'data' => $presensi
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Method store untuk menyimpan presensi harian siswa
    public function store(Request $request)
    {
        try {
            $tanggal = $request->tanggal ?? Carbon::today()->toDateString();
            
            // Ambil nisn langsung dari request yang dikirim frontend
            $nisn = $request->nisn;

            if (!$nisn) {
                return response()->json([
                    'success' => false,
                    'message' => 'NISN siswa tidak boleh kosong dari form!'
                ], 400);
            }

            // 1. Cek apakah NISN ini sudah melakukan presensi pada tanggal hari ini
            $existingPresensi = Presensi::where('nisn', $nisn)
                                         ->where('tanggal', $tanggal)
                                         ->first();

            if ($existingPresensi) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melakukan presensi hari ini!'
                ], 422);
            }

            $path = null;
            // 2. Jika ada file bukti surat sakit/izin yang diunggah
            if ($request->hasFile('file_bukti')) {
                $file = $request->file('file_bukti');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/presensi'), $filename);
                $path = 'uploads/presensi/' . $filename;
            }

            // 3. Simpan data presensi baru ke database sesuai kolom phpMyAdmin
            $presensi = Presensi::create([
                'nisn' => $nisn,
                'tanggal' => $tanggal,
                'jam_masuk' => date('H:i'),
                'status' => $request->status,
                'lokasi_gps' => $request->lokasi_gps,
                'foto' => $request->input('foto'),
                'file_bukti' => $path,
                'keterangan' => $request->keterangan
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Presensi berhasil disimpan ke database!',
                'data' => $presensi
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}