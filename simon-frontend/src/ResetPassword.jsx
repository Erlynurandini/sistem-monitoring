import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios'; // Pastikan axios sudah terinstall, atau gunakan fetch

export default function ResetPassword({ token, email, onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak cocok.');
      setLoading(false);
      return;
    }

    try {
      // Sesuaikan URL backend Laravel kamu jika port-nya berbeda (misal 8000)
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password', {
        token: token,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
      });

      if (response.data.success) {
        setIsSuccess(true);
        setMessage('Password berhasil diubah! Silakan login kembali.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan pada server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-600/10 text-blue-400 rounded-2xl mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Reset Password Baru</h2>
          <p className="text-xs text-slate-400 mt-1">Masukkan password baru untuk akun <span className="text-blue-400">{email}</span></p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-400 font-semibold">{message}</p>
            <button
              onClick={onBackToLogin}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30"
            >
              Masuk ke Halaman Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password Baru</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 bg-[#07090e] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 bg-[#07090e] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Memproses...' : 'Simpan Password Baru'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Login</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}