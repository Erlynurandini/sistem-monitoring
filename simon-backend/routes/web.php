<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

// Tambahkan route ini untuk mengatasi error 'Route [password.reset] not defined'
Route::get('/reset-password/{token}', function (Request $request, $token) {
    return redirect("http://localhost:5173?token={$token}&email=" . $request->query('email'));
})->name('password.reset');