import React, { useState } from 'react';

export default function Register({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'siswa' // default role
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // URL Backend Cloudflare Tunnel Anda
  const API_BASE_URL = 'https://fly-incidence-cure-cnet.trycloudflare.com';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Registrasi berhasil! Silakan login dengan akun baru Anda.');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setIsSuccess(false);
        const errorMsg = result.errors ? Object.values(result.errors)[0][0] : result.message;
        setMessage(errorMsg || 'Terjadi kesalahan saat registrasi.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Gagal terhubung ke server backend Cloudflare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100%;
          background-color: #0b132b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }
        .login-card {
          background-color: #ffffff;
          width: 100%;
          max-width: 450px;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
        }
        .login-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .main-logo-img {
          height: 54px;
          width: auto;
          margin-bottom: 12px;
          object-fit: contain;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 6px;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background-color: #f9fafb;
          font-size: 13.5px;
          color: #111827;
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus, .form-select:focus {
          border-color: #0070f3;
          background-color: #ffffff;
        }
        .btn-submit {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background-color: #0070f3;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn-submit:hover { background-color: #005bb5; }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .alert.success { background-color: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .alert.error { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .back-link {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
        }
        .back-link button {
          background: none;
          border: none;
          color: #0070f3;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
        .back-link button:hover { text-decoration: underline; }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="Logo SIMON PKL" className="main-logo-img" />
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>Daftar Akun Baru</h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Lengkapi data untuk mendaftar ke SIMON PKL</p>
        </div>

        {message && (
          <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Nama Lengkap Anda"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role / Hak Akses</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="admin">Admin (Pengelola)</option>
              <option value="siswa">Siswa PKL</option>
              <option value="guru">Guru Pembimbing</option>
              <option value="dudi">Pihak DUDI / Industri</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <div className="back-link">
          <button type="button" onClick={onBackToLogin}>
            ← Sudah punya akun? Login di sini
          </button>
        </div>
      </div>
    </div>
  );
}