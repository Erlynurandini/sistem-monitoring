<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => [
                'required',
                'string',
                'max:255',
                // Contoh Validasi Kombinasi Kolom Kunci:
                // Nama tidak boleh sama jika role-nya sama (sesuaikan kolom kuncinya jika perlu)
                Rule::unique('users')->where(function ($query) use ($request) {
                    return $query->where('name', $request->name)
                                 ->where('role', $request->role);
                }),
            ],
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,siswa,guru,dudi',
        ], [
            // Pesan error kustom jika kombinasi duplikat
            'name.unique' => 'Kombinasi nama dan role tersebut sudah terdaftar di sistem!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        } 

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi akun berhasil!',
            'data' => $user
        ], 201);
    }
}