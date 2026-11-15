<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User; 
use App\Models\Jurnal; 
use Illuminate\Support\Facades\Hash;
use Exception;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $siswa = User::where('role', 'siswa')->get();

            foreach ($siswa as $s) {
                if (empty($s->guru_pembimbing) || $s->guru_pembimbing === '-') {
                    if (!empty($s->company) && $s->company !== '-') {
                        $cleanCompany = trim($s->company);
                        
                        $guru = User::where('role', 'guru')
                            ->where(function($q) use ($cleanCompany) {
                                $q->where('company', 'LIKE', '%' . $cleanCompany . '%')
                                  ->orWhere('perusahaan_dudi', 'LIKE', '%' . $cleanCompany . '%');
                            })
                            ->first();
                        
                        if ($guru) {
                            $s->guru_pembimbing = $guru->name ?? $guru->nama_guru;
                            $s->save(); 
                        }
                    }
                }
            }

            return response()->json([
                'success' => true,
                'data' => $siswa
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $email = $request->input('email');
            $password = $request->input('password');

            if (!$email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email wajib diisi!'
                ], 400);
            }

            $siswa = User::where('role', 'siswa')
                        ->where('email', $email)
                        ->first();

            $isPasswordValid = $siswa && (
                $siswa->password === $password || 
                (is_string($siswa->password) && Hash::check($password, $siswa->password))
            );

            if ($isPasswordValid) {
                if (empty($siswa->guru_pembimbing) || $siswa->guru_pembimbing === '-') {
                    if (!empty($siswa->company) && $siswa->company !== '-') {
                        $cleanCompany = trim($siswa->company);

                        $guru = User::where('role', 'guru')
                            ->where(function($q) use ($cleanCompany) {
                                $q->where('company', 'LIKE', '%' . $cleanCompany . '%')
                                  ->orWhere('perusahaan_dudi', 'LIKE', '%' . $cleanCompany . '%');
                            })
                            ->first();

                        if ($guru) {
                            $siswa->guru_pembimbing = $guru->name ?? $guru->nama_guru;
                            $siswa->save(); 
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Login berhasil',
                    'data' => $siswa
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah!'
            ], 401);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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

                $namaSiswa      = $cleanRow['nama siswa'] ?? $cleanRow['nama'] ?? '-';
                $nisn           = $cleanRow['nisn'] ?? '-';
                $email          = $cleanRow['email'] ?? null;
                $kelas          = $cleanRow['kelas'] ?? '-';
                $company        = $cleanRow['company'] ?? $cleanRow['perusahaan'] ?? '-';
                $pembimbingDudi = $cleanRow['pembimbing dudi'] ?? '-';
                $passwordPlain  = $cleanRow['password'] ?? 'siswa123';

                if (!$email) {
                    continue; 
                }

                $guruPembimbing = $cleanRow['guru pembimbing'] ?? null;
                if (!$guruPembimbing || $guruPembimbing === '-' || trim($guruPembimbing) === '') {
                    if (!empty($company) && $company !== '-') {
                        $cleanCompany = trim($company);

                        $guru = User::where('role', 'guru')
                            ->where(function($q) use ($cleanCompany) {
                                $q->where('company', 'LIKE', '%' . $cleanCompany . '%')
                                  ->orWhere('perusahaan_dudi', 'LIKE', '%' . $cleanCompany . '%');
                            })
                            ->first();

                        $guruPembimbing = $guru ? ($guru->name ?? $guru->nama_guru) : '-';
                    } else {
                        $guruPembimbing = '-';
                    }
                }

                User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name'            => $namaSiswa,
                        'nisn'            => $nisn,
                        'email'           => $email,
                        'role'            => 'siswa',
                        'kelas'           => $kelas,
                        'company'         => $company,
                        'guru_pembimbing' => $guruPembimbing,
                        'pembimbing_dudi' => $pembimbingDudi,
                        'password'        => Hash::make($passwordPlain),
                    ]
                );

                $count++;
            }

            return response()->json([
                'success' => true,
                'message' => "Mantap! Berhasil menyimpan $count data siswa dengan pencocokan guru pembimbing otomatis."
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $siswa = User::where('role', 'siswa')->find($id);
            if ($siswa) {
                if ($siswa->nisn) {
                    Jurnal::where('nisn', $siswa->nisn)->delete();
                }

                $siswa->delete();

                return response()->json([
                    'success' => true, 
                    'message' => 'Data siswa beserta data terkait berhasil dihapus'
                ]);
            }
            return response()->json([
                'success' => false, 
                'message' => 'Data tidak ditemukan'
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Gagal menghapus: ' . $e->getMessage()
            ], 500);
        }
    }
}