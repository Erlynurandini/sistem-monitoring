<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Presensi;
use Exception;

class PresensiController extends Controller
{
    // Method index untuk mengambil seluruh data presensi (dibutuhkan oleh Dashboard Guru)
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

    public function store(Request $request)
    {
        try { // Perbaikan: Menambahkan kurung kurawal buka di sini
            $tanggal = $request->tanggal ?? date('Y-m-d');
            $nisn = $request->nisn;

            // 1. Cek apakah siswa sudah melakukan presensi pada tanggal hari ini
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
            // 2. Jika ada file surat sakit/izin yang diunggah (dokumen/PDF/foto dokumen)
            if ($request->hasFile('file_bukti')) {
                $file = $request->file('file_bukti');
                $filename = time() . '_' . $file->getClientOriginalName();
                $file->move(public_path('uploads/presensi'), $filename);
                $path = 'uploads/presensi/' . $filename;
            }

            // 3. Simpan data presensi baru dengan jam masuk aktual & foto kamera
            $presensi = Presensi::create([
                'nisn' => $nisn,
                'tanggal' => $tanggal,
                'jam_masuk' => date('H:i'), // Mengambil jam & menit aktual saat presensi dikirim
                'status' => $request->status,
                'lokasi_gps' => $request->lokasi_gps,
                'foto' => $request->input('foto'), // Menerima base64 string dari kamera siswa
                'file_bukti' => $path,
                'keterangan' => $request->keterangan
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Presensi berhasil disimpan ke database!',
                'data' => $presensi
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}