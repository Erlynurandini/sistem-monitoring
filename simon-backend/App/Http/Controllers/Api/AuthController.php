<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email dan password wajib diisi.'
            ], 422);
        }

        $identifier = trim($request->email); // Email atau NISN yang diketik
        $password = $request->password;
        $role = $request->role; // Role yang dipilih di frontend ('siswa', 'guru', 'dudi', 'admin')

        // 1. Cek apakah user terdaftar berdasarkan email atau nisn (tanpa filter role dulu)
        $user = User::where('email', $identifier)
            ->orWhere('nisn', $identifier)
            ->first();

        // Jika user tidak ditemukan sama sekali
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau NISN tidak terdaftar.'
            ], 404);
        }

        // 2. Cek apakah password salah
        $isPasswordValid = (
            $user->password === $password || 
            (is_string($user->password) && Hash::check($password, $user->password))
        );

        if (!$isPasswordValid) {
            return response()->json([
                'success' => false,
                'message' => 'Password yang Anda masukkan salah.'
            ], 401);
        }

        // 3. Cek apakah role yang dipilih di dropdown sesuai dengan database
        if ($role && strtolower($user->role) !== strtolower($role)) {
            return response()->json([
                'success' => false,
                'message' => "Akun ini terdaftar sebagai " . ucfirst($user->role) . ", bukan sebagai " . ucfirst($role) . "."
            ], 401);
        }

        // Jika semuanya valid, buat token dan berikan data user
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'message' => 'Login berhasil!',
            'role' => $user->role,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => $user
        ]);
    }

    // FORGOT PASSWORD
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Format email tidak valid.'
            ], 422);
        }

        // Cek apakah email terdaftar di database
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak terdaftar di sistem.'
            ], 404);
        }

        try {
            // Mengirim link reset password bawaan Laravel (masuk ke Mailtrap)
            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'success' => true,
                    'message' => 'Tautan pemulihan password berhasil dikirim ke email Anda!'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim tautan reset password. Silakan coba lagi.'
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage()
            ], 500);
        }
    }

    // RESET PASSWORD BARU
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed', // Mencari input 'password_confirmation' secara otomatis
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        // Proses reset password menggunakan Laravel Password Broker
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->setRememberToken(Str::random(60));
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah! Silakan login kembali.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Token reset password tidak valid atau sudah kadaluarsa.'
        ], 400);
    }
}