<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SiswaImportController extends Controller
{
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:csv,txt,xlsx,xls|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Format file tidak valid. Harap unggah file CSV atau Excel.'
            ], 422);
        }

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        // Membaca file CSV/Excel baris per baris
        $data = array_map('str_getcsv', file($path));
        $header = array_shift($data); // Ambil header kolom

        $importedCount = 0;

        foreach ($data as $row) {
            // Asumsi urutan kolom CSV: Nama, Email, Password, DUDI / Penempatan
            if (count($row) >= 3) {
                $name = $row[0];
                $email = $row[1];
                $password = $row[2];

                // Cek apakah email sudah terdaftar
                if (!User::where('email', $email)->exists()) {
                    User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make($password),
                        'role' => 'siswa',
                    ]);
                    $importedCount++;
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengimpor $importedCount data siswa!",
        ]);
    }
}