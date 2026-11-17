<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\JurnalController;
use App\Http\Controllers\PresensiController;
use App\Http\Controllers\JadwalMonitoringController;
use App\Http\Controllers\GuruController;
use App\Http\Controllers\DudiController;
use App\Http\Controllers\Api\Auth\RegisterController;

/*
|--------------------------------------------------------------------------
| API Routes - SIMON PKL
|--------------------------------------------------------------------------
*/

// AUTH ROUTE (UNTUK LOGIN, LUPA PASSWORD, & RESET PASSWORD)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/register', [RegisterController::class, 'register']);

// 1. ROUTE SISWA
Route::get('/siswa', [SiswaController::class, 'index']);
Route::post('/siswa/import', [SiswaController::class, 'import']);
Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);

// 2. ROUTE JURNAL HARIAN SISWA (LENGKAP DENGAN UPDATE & DESTROY)
Route::get('/jurnal', [JurnalController::class, 'index']);
Route::post('/jurnal', [JurnalController::class, 'store']);
Route::post('/jurnal/{id}', [JurnalController::class, 'update']);
Route::delete('/jurnal/{id}', [JurnalController::class, 'destroy']);

// 3. ROUTE PRESENSI KEHADIRAN & FOTO
Route::get('/presensi', [PresensiController::class, 'index']);
Route::post('/presensi', [PresensiController::class, 'store']);

// 4. ROUTE JADWAL MONITORING
Route::get('/jadwal-monitoring', [JadwalMonitoringController::class, 'index']);
Route::post('/jadwal-monitoring', [JadwalMonitoringController::class, 'store']);
Route::delete('/jadwal-monitoring/{id}', [JadwalMonitoringController::class, 'destroy']);

// 5. ROUTE GURU
Route::get('/guru', [GuruController::class, 'index']);
Route::post('/guru/import', [GuruController::class, 'import']);
Route::delete('/guru/{id}', [GuruController::class, 'destroy']);
Route::get('/guru/siswa-bimbingan', [GuruController::class, 'siswaBimbingan']);
Route::post('/guru/penilaian', [GuruController::class, 'saveEvaluation']); // Rute simpan nilai guru

// 6. ROUTE DUDI
Route::get('/dudi', [DudiController::class, 'index']);
Route::post('/dudi/import', [DudiController::class, 'import']);
Route::delete('/dudi/{id}', [DudiController::class, 'destroy']);

// Route Panel DUDI
Route::get('/dudi/dashboard', [DudiController::class, 'dashboard']);
Route::get('/dudi/siswa', [DudiController::class, 'getSiswaBinaan']);
Route::get('/dudi/jurnal', [DudiController::class, 'getJurnal']);
Route::get('/dudi/presensi', [DudiController::class, 'getPresensi']);
Route::post('/dudi/journals/{id}/approve', [DudiController::class, 'approveJurnal']);
Route::post('/dudi/journals/{id}/revise', [DudiController::class, 'revisiJurnal']);
Route::post('/dudi/penilaian', [DudiController::class, 'saveEvaluation']);