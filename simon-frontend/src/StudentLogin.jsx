import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, Lock, User } from 'lucide-react';

export default function StudentLogin({ onLoginSuccess }) {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nisn || !password) {
      alert('Mohon isi NISN dan Password!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/siswa/login', { nisn, password });
      if (response.data.success) {
        alert('Login berhasil!');
        onLoginSuccess(response.data.data); // Lempar data siswa ke komponen utama
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login gagal. Periksa kembali NISN dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#07090e] font-sans">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30 mb-2">
            <BookOpen size={28} />
          </div>
          <h2 className="text-xl font-bold text-white">Login Portal Siswa</h2>
          <p className="text-xs text-slate-400">Sistem Monitoring PKL (SIMON PKL)</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">NISN Siswa</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input 
                type="text" 
                placeholder="Masukkan NISN Anda"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input 
                type="password" 
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30"
          >
            {loading ? 'Memproses...' : 'Masuk ke Portal Siswa'}
          </button>
        </form>
      </div>
    </div>
  );
}