<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dudi;
use App\Models\User;
use App\Models\Jurnal;
use App\Models\Presensi;
use Illuminate\Support\Facades\Hash;
use Exception;

class DudiController extends Controller
{
    public function index()
    {
        return response()->json(Dudi::all());
    }

    // Helper untuk mendeteksi nama perusahaan atau nama DUDI yang sedang login
    private function getCompany(Request $request)
    {
        $user = $request->user();
        if ($user && $user->role === 'dudi') {
            if (!empty($user->company) && $user->company !== 'Belum Ada') {
                return $user->company;
            }
            $dudi = Dudi::where('email', $user->email)->first();
            if ($dudi && !empty($dudi->nama_dudi)) {
                return $dudi->nama_dudi;
            }
            if ($dudi && !empty($dudi->nama_pembimbing)) {
                return $dudi->nama_pembimbing;
            }
            return $user->name; // Fallback ke nama user DUDI (misal: Budi)
        }
        return $request->query('company');
    }

    // Helper terpusat untuk mengambil query siswa bimbingan secara fleksibel
    private function getSiswaQuery(Request $request)
    {
        $user = $request->user();
        $company = $this->getCompany($request);
        $userName = $user ? $user->name : null;

        return User::where('role', 'siswa')
            ->where(function($q) use ($company, $userName) {
                if (!empty($company) && $company !== 'Belum Ada') {
                    $q->where('company', 'LIKE', "%{$company}%")
                      ->orWhere('tempat_pkl', 'LIKE', "%{$company}%")
                      ->orWhere('pembimbing_dudi', 'LIKE', "%{$company}%");
                }
                if (!empty($userName) && $userName !== 'Belum Ada') {
                    $q->orWhere('pembimbing_dudi', 'LIKE', "%{$userName}%")
                      ->orWhere('company', 'LIKE', "%{$userName}%");
                }
                if (empty($company) && empty($userName)) {
                    $q->whereNotNull('nisn');
                }
            });
    }

    // 0. Ringkasan Dashboard DUDI (/api/dudi/dashboard)
    public function dashboard(Request $request)
    {
        try {
            $company = $this->getCompany($request);
            $siswaNisns = $this->getSiswaQuery($request)->pluck('nisn')->filter();

            $journals = class_exists(Jurnal::class) 
                ? Jurnal::whereIn('nisn', $siswaNisns)->orderBy('created_at', 'desc')->get() 
                : collect();

            $attendances = class_exists(Presensi::class) 
                ? Presensi::whereIn('nisn', $siswaNisns)->orderBy('created_at', 'desc')->get() 
                : collect();

            return response()->json([
                'success' => true,
                'company' => $company ?: 'PT. Solusi Tunas Pratama Tbk',
                'journals' => $journals,
                'attendances' => $attendances
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 1. Ambil Siswa Binaan Berdasarkan Perusahaan DUDI (/api/dudi/siswa)
    public function getSiswaBinaan(Request $request)
    {
        try {
            $siswa = $this->getSiswaQuery($request)->get();

            return response()->json([
                'success' => true,
                'data' => $siswa
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 2. Ambil Jurnal dari Siswa Binaan Perusahaan Ini (/api/dudi/jurnal)
    public function getJurnal(Request $request)
    {
        try {
            $siswaNisns = $this->getSiswaQuery($request)->pluck('nisn')->filter();

            $jurnals = class_exists(Jurnal::class) 
                ? Jurnal::whereIn('nisn', $siswaNisns)->orderBy('created_at', 'desc')->get() 
                : collect();

            $formattedJurnals = $jurnals->map(function ($item) {
                $nisn = is_object($item) ? ($item->nisn ?? null) : ($item['nisn'] ?? null);
                $siswa = User::where('nisn', $nisn)->first();
                
                $data = is_object($item) 
                    ? (method_exists($item, 'toArray') ? $item->toArray() : (array) $item) 
                    : (array) $item;
                    
                $data['nama_siswa'] = $siswa ? $siswa->name : 'Siswa PKL';
                return $data;
            });

            return response()->json([
                'success' => true,
                'data' => $formattedJurnals
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 3. Ambil Presensi dari Siswa Binaan Perusahaan Ini (/api/dudi/presensi)
    public function getPresensi(Request $request)
    {
        try {
            $siswaNisns = $this->getSiswaQuery($request)->pluck('nisn')->filter();

            $presensis = class_exists(Presensi::class) 
                ? Presensi::whereIn('nisn', $siswaNisns)->orderBy('created_at', 'desc')->get() 
                : collect();

            $formattedPresensi = $presensis->map(function ($item) {
                $nisn = is_object($item) ? ($item->nisn ?? null) : ($item['nisn'] ?? null);
                $siswa = User::where('nisn', $nisn)->first();
                
                $data = is_object($item) 
                    ? (method_exists($item, 'toArray') ? $item->toArray() : (array) $item) 
                    : (array) $item;
                    
                $data['nama_siswa'] = $siswa ? $siswa->name : 'Siswa PKL';
                $data['jam_masuk'] = $data['jam_masuk'] ?? '08:00';
                return $data;
            });

            return response()->json([
                'success' => true,
                'data' => $formattedPresensi
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Aksi Approve Jurnal
    public function approveJurnal(int $id)
    {
        try {
            if (class_exists(Jurnal::class)) {
                $jurnal = Jurnal::findOrFail($id);
                $jurnal->update(['status' => 'Disetujui']);
            }

            return response()->json(['success' => true, 'message' => 'Jurnal berhasil disetujui']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Aksi Revisi Jurnal
    public function revisiJurnal(Request $request, int $id)
    {
        try {
            $catatan = $request->input('catatan');
            
            if (class_exists(Jurnal::class)) {
                $jurnal = Jurnal::findOrFail($id);
                $jurnal->update([
                    'status' => 'Direvisi', 
                    'catatan_dudi' => $catatan
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Permintaan revisi terkirim']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 6. Simpan Penilaian Akhir PKL Siswa (/api/dudi/penilaian)
    public function saveEvaluation(Request $request)
    {
        try {
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

            $student->update([
                'discipline' => $request->input('kedisiplinan') ?? $request->input('discipline'),
                'skills'     => $request->input('keterampilan') ?? $request->input('skills'),
                'attitude'   => $request->input('sikap') ?? $request->input('attitude'),
                'notes'      => $request->input('catatan') ?? $request->input('notes'),
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Penilaian berhasil disimpan!'
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

            $count = 0;
            foreach ($rows as $row) {
                $cleanRow = [];
                foreach ($row as $key => $val) {
                    $cleanRow[trim(strtolower($key))] = $val;
                }

                $values = array_values($cleanRow);

                $namaDudi = $cleanRow['nama perusahaan / dudi'] ?? $cleanRow['nama_dudi'] ?? $cleanRow['nama'] ?? ($values[0] ?? '-');
                $bidangUsaha = $cleanRow['bidang usaha'] ?? $cleanRow['bidang_usaha'] ?? ($values[1] ?? '-');
                $alamat = $cleanRow['alamat'] ?? ($values[2] ?? '-');
                $namaPembimbing = $cleanRow['nama pembimbing'] ?? $cleanRow['nama_pembimbing'] ?? '-';
                $email = $cleanRow['email'] ?? null;
                $passwordPlain = $cleanRow['password'] ?? 'dudi123';

                if (!$email) {
                    continue;
                }

                Dudi::updateOrCreate(
                    ['email' => $email],
                    [
                        'nama_dudi' => $namaDudi,
                        'bidang_usaha' => $bidangUsaha,
                        'alamat' => $alamat,
                        'nama_pembimbing' => $namaPembimbing,
                        'password' => $passwordPlain
                    ]
                );

                User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $namaPembimbing !== '-' ? $namaPembimbing : $namaDudi,
                        'email' => $email,
                        'company' => $namaDudi,
                        'password' => Hash::make($passwordPlain),
                        'role' => 'dudi'
                    ]
                );

                $count++;
            }

            return response()->json([
                'success' => true, 
                'message' => "Mantap! Berhasil menyimpan $count data DUDI & Akun Login."
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        $dudi = Dudi::find($id);
        if ($dudi) {
            $dudi->delete();
            return response()->json(['success' => true, 'message' => 'Data DUDI berhasil dihapus']);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }
}