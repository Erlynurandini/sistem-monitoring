<?php 

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AdminController extends Controller
{
    public function getStats()
    {
        try {
            $totalSiswa = DB::table('users')->where('role', 'siswa')->count();
            $totalDudi = DB::table('companies')->count();
            $totalGuru = DB::table('users')->where('role', 'guru')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_siswa' => $totalSiswa,
                    'total_dudi' => $totalDudi,
                    'total_guru' => $totalGuru,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getUsers()
    {
        try {
            $users = DB::table('users')->where('role', 'siswa')->orderBy('id', 'desc')->get();

            $usersFormatted = $users->map(function ($u) {
                $companyName = 'Belum Ada';
                
                if (!empty($u->company_id)) {
                    $comp = DB::table('companies')->where('id', $u->company_id)->first();
                    if ($comp) {
                        $companyName = $comp->company_name ?? 'Perusahaan Mitra';
                    }
                } elseif (!empty($u->company)) {
                    $companyName = $u->company;
                }

                $teacherName = '-';
                if (!empty($u->pembimbing_id)) {
                    $teacher = DB::table('users')->where('id', $u->pembimbing_id)->first();
                    if ($teacher) {
                        $teacherName = $teacher->name;
                    }
                }

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'nisn' => $u->nisn ?? '-',
                    'email' => $u->email,
                    'kelas' => $u->kelas ?? '-',
                    'role' => $u->role,
                    'pembimbing_id' => $u->pembimbing_id ?? null,
                    'teacher_name' => $teacherName,
                    'company_id' => $u->company_id ?? null,
                    'company' => $companyName,
                    'pembimbing_dudi' => $u->pembimbing_dudi ?? '-',
                ];
            });

            return response()->json(['success' => true, 'data' => $usersFormatted], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getTeachers()
    {
        try {
            $teachers = DB::table('users')->where('role', 'guru')->orderBy('id', 'desc')->get();

            $teachersFormatted = $teachers->map(function ($t) {
                $companyName = '-';
                
                if (!empty($t->company_id)) {
                    $comp = DB::table('companies')->where('id', $t->company_id)->first();
                    if ($comp) {
                        $companyName = $comp->company_name ?? 'Perusahaan Mitra';
                    }
                } 
                
                if (($companyName === '-' || $companyName === 'Belum Ada') && !empty($t->company)) {
                    $companyName = $t->company;
                }

                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'email' => $t->email,
                    'role' => $t->role,
                    'company' => $companyName,
                ];
            });

            return response()->json(['success' => true, 'data' => $teachersFormatted], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getStudents(Request $request)
    {
        try {
            $user = $request->user();
            $query = DB::table('users')->where('role', 'siswa');

            if ($user && $user->role === 'guru') {
                $query->where('pembimbing_id', $user->id);
            }

            $students = $query->orderBy('id', 'desc')->get();

            $studentsFormatted = $students->map(function ($s) {
                $companyName = 'Belum Ditempatkan';
                if (!empty($s->company_id)) {
                    $comp = DB::table('companies')->where('id', $s->company_id)->first();
                    if ($comp) {
                        $companyName = $comp->company_name ?? 'Perusahaan Mitra';
                    }
                } elseif (!empty($s->company)) {
                    $companyName = $s->company;
                }

                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'email' => $s->email,
                    'nis' => $s->nisn ?? $s->email,
                    'kelas' => $s->kelas ?? '-',
                    'company' => $companyName,
                    'status_presensi' => 'Hadir',
                    'status_jurnal' => 'Sudah Mengisi',
                ];
            });

            return response()->json(['success' => true, 'data' => $studentsFormatted], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required'
        ]);

        try {
            $userId = DB::table('users')->insertGetId([
                'name' => $request->name,
                'nisn' => $request->nisn ?? null,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => strtolower($request->role),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'User berhasil ditambahkan!', 'user_id' => $userId], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function destroyUser(int $id)
    {
        try {
            DB::table('users')->where('id', $id)->delete();
            return response()->json(['success' => true, 'message' => 'User berhasil dihapus!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getCompanies()
    {
        try {
            $companies = DB::table('companies')
                ->leftJoin('users', function($join) {
                    $join->on('companies.id', '=', 'users.company_id')
                         ->where('users.role', '=', 'dudi');
                })
                ->select(
                    'companies.*',
                    'users.name as pembimbing_name',
                    'users.email as email'
                )
                ->get();

            return response()->json(['success' => true, 'data' => $companies], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function storeCompany(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'address' => 'nullable|string'
        ]);

        try {
            $companyId = DB::table('companies')->insertGetId([
                'company_name' => $request->name,
                'address' => $request->address ?? '-',
                'latitude' => 0,
                'longitude' => 0,
                'radius_meters' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Data Perusahaan berhasil disimpan!', 'company_id' => $companyId], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function assignPlacement(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'teacher_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
        ]);

        try {
            $company = DB::table('companies')->where('id', $request->company_id)->first();
            $companyName = $company ? ($company->company_name ?? 'Perusahaan Mitra') : 'Perusahaan Mitra';

            DB::table('users')
                ->where('id', $request->student_id)
                ->update([
                    'pembimbing_id' => $request->teacher_id,
                    'company_id' => $request->company_id,
                    'company' => $companyName,
                    'updated_at' => now(),
                ]);

            return response()->json(['success' => true, 'message' => 'Penempatan siswa berhasil disimpan!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    public function updatePlacement(Request $request, int $id)
    {
        $request->validate([
            'name' => 'required|string',
            'nisn' => 'nullable|string',
            'teacher_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
        ]);

        try {
            $company = DB::table('companies')->where('id', $request->company_id)->first();
            $companyName = $company ? ($company->company_name ?? 'Perusahaan Mitra') : 'Perusahaan Mitra';

            DB::table('users')
                ->where('id', $id)
                ->update([
                    'name' => $request->name,
                    'nisn' => $request->nisn ?? null,
                    'pembimbing_id' => $request->teacher_id,
                    'company_id' => $request->company_id,
                    'company' => $companyName,
                    'updated_at' => now(),
                ]);

            return response()->json(['success' => true, 'message' => 'Data penempatan siswa berhasil diperbarui!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memperbarui: ' . $e->getMessage()], 500);
        }
    }

    public function getPlotingData()
    {
        try {
            $students = DB::table('users')->where('role', 'siswa')->get(['id', 'name', 'email', 'nisn', 'kelas']);
            $teachers = DB::table('users')->where('role', 'guru')->get(['id', 'name', 'email']);
            
            $companies = DB::table('companies')->get();
            $companiesFormatted = $companies->map(function ($c) {
                return [
                    'id' => $c->id,
                    'company_name' => $c->company_name ?? 'Perusahaan ' . $c->id
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'students' => $students,
                    'teachers' => $teachers,
                    'companies' => $companiesFormatted
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function getPlacements()
    {
        return $this->getUsers();
    }

    public function getStudentDetailLog(int $studentId)
    {
        try {
            $student = DB::table('users')->where('id', $studentId)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan'], 404);
            }

            $jurnalTable = null;
            foreach (['jurnals', 'jurnal', 'jurnal_harians'] as $tbl) {
                if (Schema::hasTable($tbl)) {
                    $jurnalTable = $tbl;
                    break;
                }
            }

            $jurnals = collect();
            if ($jurnalTable) {
                $column = Schema::hasColumn($jurnalTable, 'user_id') ? 'user_id' : 'siswa_id';
                $jurnals = DB::table($jurnalTable)->where($column, $studentId)->orderBy('id', 'desc')->get();
            }

            $presensiTable = null;
            foreach (['presensis', 'presensi', 'absensis'] as $tbl) {
                if (Schema::hasTable($tbl)) {
                    $presensiTable = $tbl;
                    break;
                }
            }

            $presensis = collect();
            if ($presensiTable) {
                $column = Schema::hasColumn($presensiTable, 'user_id') ? 'user_id' : 'siswa_id';
                $presensis = DB::table($presensiTable)->where($column, $studentId)->orderBy('id', 'desc')->get();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'student' => [
                        'name' => $student->name,
                        'nis' => $student->nisn ?? '-',
                        'kelas' => $student->kelas ?? '-',
                        'company' => $student->company ?? 'Belum Ditempatkan'
                    ],
                    'jurnals' => $jurnals,
                    'presensis' => $presensis
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function importBatch(Request $request)
    {
        try {
            $students = $request->input('students', []);
            if (empty($students)) {
                return response()->json(['success' => false, 'message' => 'Data siswa kosong.'], 400);
            }

            $count = 0;
            foreach ($students as $data) {
                $normalizedData = [];
                foreach ($data as $key => $value) {
                    $cleanKey = strtolower(trim(str_replace(' ', '_', $key)));
                    $normalizedData[$cleanKey] = $value;
                }

                $name = $normalizedData['name'] ?? $normalizedData['nama'] ?? $normalizedData['nama_siswa'] ?? null;
                $email = $normalizedData['email'] ?? null;
                
                if (!$name) continue;

                $nisn = $normalizedData['nisn'] ?? $normalizedData['nis'] ?? null;
                $passwordPlain = $nisn ? (string)$nisn : 'siswa123';
                $emailFinal = $email ? trim($email) : (strtolower(str_replace(' ', '', $name)) . '@budibakti.com');
                $kelas = $normalizedData['kelas'] ?? '-';
                $pembimbingDudi = $normalizedData['pembimbing_dudi'] ?? '-';
                $guruName = $normalizedData['guru_pembimbing'] ?? null;

                $companyId = null;
                $companyName = $normalizedData['company'] ?? $normalizedData['perusahaan'] ?? null;
                
                if ($companyName) {
                    $comp = DB::table('companies')->where('company_name', 'LIKE', '%' . trim($companyName) . '%')->first();
                    if ($comp) {
                        $companyId = $comp->id;
                        $companyName = $comp->company_name;
                    }
                } else {
                    $companyName = 'Belum Ditempatkan';
                }

                $teacherId = null;
                if ($guruName) {
                    $teacher = DB::table('users')->where('role', 'guru')->where('name', 'LIKE', '%' . trim($guruName) . '%')->first();
                    if ($teacher) {
                        $teacherId = $teacher->id;
                    }
                }

                DB::table('users')->updateOrInsert(
                    ['email' => strtolower($emailFinal)],
                    [
                        'name' => trim($name),
                        'nisn' => $nisn ? (string)$nisn : null,
                        'kelas' => trim($kelas),
                        'password' => Hash::make($passwordPlain),
                        'role' => 'siswa',
                        'company_id' => $companyId,
                        'company' => $companyName,
                        'pembimbing_dudi' => trim($pembimbingDudi),
                        'pembimbing_id' => $teacherId,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
                $count++;
            }

            return response()->json(['success' => true, 'message' => "Berhasil memproses {$count} data siswa!"], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function importCompaniesAndTeachers(Request $request)
    {
        try {
            $dataList = $request->input('data', []);
            foreach ($dataList as $item) {
                $companyName = $item['nama_perusahaan'] ?? null;
                $address = $item['alamat'] ?? '-';
                $teacherName = $item['nama_pembimbing'] ?? null;
                $email = $item['email'] ?? null;
                $password = $item['password'] ?? 'dudi12345';

                if (!$companyName) continue;

                $company = DB::table('companies')->where('company_name', $companyName)->first();
                if ($company) {
                    $companyId = $company->id;
                    DB::table('companies')->where('id', $companyId)->update(['address' => $address, 'updated_at' => now()]);
                } else {
                    $companyId = DB::table('companies')->insertGetId([
                        'company_name' => $companyName,
                        'address' => $address,
                        'latitude' => 0,
                        'longitude' => 0,
                        'radius_meters' => 50,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                if ($email && $teacherName) {
                    DB::table('users')->updateOrInsert(
                        ['email' => $email],
                        [
                            'name' => $teacherName,
                            'password' => Hash::make($password),
                            'role' => 'dudi',
                            'kelas' => '-',
                            'company_id' => $companyId,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
                }
            }

            return response()->json(['success' => true, 'message' => 'Data DUDI & Pembimbing berhasil diimpor!'], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function importTeacherBatch(Request $request)
    {
        try {
            $teachers = $request->input('teachers', []);
            $count = 0;

            if (empty($teachers)) {
                return response()->json(['success' => false, 'message' => 'Data guru kosong.'], 400);
            }

            foreach ($teachers as $data) {
                $normalizedData = [];
                foreach ($data as $key => $value) {
                    $cleanKey = strtolower(trim(str_replace([' ', '/'], '_', $key)));
                    $normalizedData[$cleanKey] = $value;
                }

                $name = $normalizedData['name'] ?? $normalizedData['nama'] ?? $normalizedData['nama_guru'] ?? null;
                $email = $normalizedData['email'] ?? null;
                $password = $normalizedData['password'] ?? 'guru12345';
                $companyName = $normalizedData['perusahaan'] ?? $normalizedData['company'] ?? $normalizedData['perusahaan_dudi'] ?? null;

                if (!$name) continue;

                if (!$email) {
                    $email = strtolower(str_replace(' ', '', $name)) . '@budibakti.com';
                }

                $companyId = null;
                $finalCompanyName = '-';

                if ($companyName && trim($companyName) !== '') {
                    $cleanCompName = trim($companyName);
                    
                    $comp = DB::table('companies')
                        ->whereRaw('LOWER(company_name) = ?', [strtolower($cleanCompName)])
                        ->first();
                    
                    if (!$comp) {
                        $comp = DB::table('companies')
                            ->where('company_name', 'LIKE', '%' . $cleanCompName . '%')
                            ->first();
                    }

                    if ($comp) {
                        $companyId = $comp->id;
                        $finalCompanyName = $comp->company_name;
                    } else {
                        $companyId = DB::table('companies')->insertGetId([
                            'company_name' => $cleanCompName,
                            'address' => '-',
                            'latitude' => 0,
                            'longitude' => 0,
                            'radius_meters' => 50,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        $finalCompanyName = $cleanCompName;
                    }
                }

                DB::table('users')->updateOrInsert(
                    ['email' => strtolower(trim($email))],
                    [
                        'name' => trim($name),
                        'password' => Hash::make($password),
                        'role' => 'guru',
                        'kelas' => '-',
                        'company_id' => $companyId,
                        'company' => $finalCompanyName,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
                $count++;
            }

            return response()->json(['success' => true, 'message' => "Berhasil memproses {$count} data Guru Pembimbing!"], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'password' => 'sometimes|required',
            'current_password' => 'sometimes|required',
            'new_password' => 'sometimes|required|min:6',
        ]);

        try {
            $user = $request->user();
            $oldPassword = $request->current_password ?? $request->password;
            $newPassword = $request->new_password ?? $request->password;

            if ($oldPassword && !Hash::check($oldPassword, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Password lama salah!'], 400);
            }

            DB::table('users')->where('id', $user->id)->update([
                'password' => Hash::make($newPassword),
                'updated_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Password berhasil diubah!', 'user' => $user], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}