<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Guru;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Exception;

class GuruController extends Controller
{
    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => Guru::all()
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Method untuk mengambil daftar siswa bimbingan secara murni dari database tabel users
    public function getSiswaBimbingan(Request $request)
    {
        try {
            $namaGuru = $request->query('guru') ?? $request->query('nama_guru');

            $query = User::where('role', 'siswa');

            if ($namaGuru) {
                $query->where('guru_pembimbing', 'LIKE', '%' . $namaGuru . '%');
            }

            $siswa = $query->get();

            return response()->json([
                'success' => true,
                'data' => $siswa
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // -------------------------------------------------------------
    // TAMBAHAN: Method untuk menyimpan penilaian akhir dari Guru Pembimbing
    // -------------------------------------------------------------
    public function saveEvaluation(Request $request)
    {
        try {
            // Tangkap ID atau NISN siswa secara fleksibel dari berbagai key frontend
            $studentId = $request->input('siswa_id') 
                      ?? $request->input('student_id') 
                      ?? $request->input('id') 
                      ?? $request->input('nisn');

            if (!$studentId) {
                return response()->json([
                    'success' => false, 
                    'message' => 'ID atau NISN siswa tidak ditemukan dalam request.'
                ], 422);
            }

            // Cari siswa di tabel users berdasarkan id atau nisn
            $student = User::where('role', 'siswa')
                ->where(function($q) use ($studentId) {
                    $q->where('id', $studentId)
                      ->orWhere('nisn', $studentId);
                })
                ->first();

            if (!$student) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Siswa tidak ditemukan di database.'
                ], 404);
            }

            // Update nilai laporan, seminar, dan catatan guru secara fleksibel
            $student->update([
                'nilai_laporan' => $request->input('nilai_laporan') ?? $request->input('nilai'),
                'nilai_seminar' => $request->input('nilai_seminar') ?? $request->input('seminar'),
                'catatan_guru'  => $request->input('catatan_guru') ?? $request->input('catatan'),
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Nilai akhir guru berhasil disimpan!'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request)
    {
        try {
            $rows = $request->input('data');

            if (!$rows || !is_array($rows)) {
                return response()->json(['success' => false, 'message' => 'Format data kosong atau tidak valid.'], 400);
            }

            foreach ($rows as $row) {
                // Normalisasi kunci (menghapus spasi dan mengubah ke huruf kecil)
                $cleanRow = [];
                foreach ($row as $key => $val) {
                    $cleanRow[trim(strtolower($key))] = $val;
                }

                $nama = $cleanRow['nama guru'] ?? $cleanRow['nama'] ?? $cleanRow['nama_guru'] ?? '-';
                $email = $cleanRow['email'] ?? null;
                $perusahaan = $cleanRow['perusahaan / dudi'] ?? $cleanRow['perusahaan_dudi'] ?? '-';
                $status = $cleanRow['status'] ?? 'Aktif';
                $passwordPlain = $cleanRow['password'] ?? 'guru12345';

                if (!$email) continue;

                // 1. Simpan ke tabel gurus
                Guru::updateOrCreate(
                    ['email' => $email],
                    [
                        'nama_guru' => $nama,
                        'password' => $passwordPlain,
                        'perusahaan_dudi' => $perusahaan,
                        'status' => $status
                    ]
                );

                // 2. Sinkronkan ke tabel users AGAR BISA LOGIN
                User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $nama,
                        'email' => $email,
                        'password' => Hash::make($passwordPlain), // Password di-hash otomatis
                        'role' => 'guru'
                    ]
                );
            }

            return response()->json(['success' => true, 'message' => 'Data Guru & Akun Login berhasil disinkronkan!']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $guru = Guru::find($id);
            if ($guru) {
                // Hapus user terkait di tabel users jika emailnya sama
                User::where('email', $guru->email)->delete();
                $guru->delete();
                return response()->json(['success' => true, 'message' => 'Data Guru berhasil dihapus']);
            }
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}