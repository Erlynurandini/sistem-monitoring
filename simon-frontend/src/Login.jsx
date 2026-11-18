import React, { useState } from 'react';

export default function Login({ onLoginSuccess, onNavigateRegister, onNavigateForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('siswa');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan token akses dari Laravel
        if (result.access_token) {
          localStorage.setItem('token', result.access_token);
        }

        // Ambil data user dari result.data (sesuai struktur backend)
        const userObj = result.data || {};
        const userData = {
          id: userObj.id,
          name: userObj.name ?? 'Pengguna',
          nisn: userObj.nisn ?? '',
          email: userObj.email ?? '',
          role: userObj.role ?? '',
          kelas: userObj.kelas ?? '-',
          company_id: userObj.company_id ?? null,
          company: userObj.company ?? 'Belum Ada',
          pembimbing_id: userObj.pembimbing_id ?? null,
          pembimbing_dudi: userObj.pembimbing_dudi ?? '-',
          is_first_login: userObj.is_first_login ?? false
        };

        localStorage.setItem('user', JSON.stringify(userData));
        
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }

      } else {
        setErrorMsg(result.message || 'Email/NISN atau Password salah!');
      }

    } catch (error) {
      console.warn('Gagal terhubung ke API backend:', error);
      setErrorMsg('Tidak dapat terhubung ke server backend Laravel. Pastikan php artisan serve menyala.');
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
          max-width: 900px;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        }

        .login-banner {
          flex: 1;
          background: linear-gradient(135deg, #1f2937 0%, #0b132b 100%);
          padding: 48px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .banner-brand {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo-img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .login-form-container {
          flex: 1.1;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: #ffffff;
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }

        .main-logo-img {
          height: 64px;
          width: auto;
          object-fit: contain;
          display: block;
          margin: 0 auto 12px auto;
        }

        .login-title {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .login-subtitle {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
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
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-input:focus, .form-select:focus {
          border-color: #0070f3;
          background-color: #ffffff;
        }

        .forgot-password-container {
          text-align: right;
          margin-top: -6px;
          margin-bottom: 16px;
        }

        .forgot-link {
          color: #0070f3;
          font-size: 12px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .forgot-link:hover {
          text-decoration: underline;
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

        .btn-submit:hover {
          background-color: #005bb5;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-alert {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid #fecaca;
        }

        .login-footer-text {
          text-align: center;
          margin-top: 20px;
          font-size: 12.5px;
          color: #6b7280;
        }

        .register-link {
          color: #0070f3;
          font-weight: 700;
          cursor: pointer;
          border: none;
          background: none;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .login-banner { display: none; }
          .login-card { max-width: 400px; }
          .login-form-container { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-card">
        {/* Banner Kiri (Desktop) */}
        <div className="login-banner">
          <div className="banner-brand">
            <img src="/logo.png" alt="Logo SE DEV" className="brand-logo-img" />
            <span>SIMON PKL</span>
          </div>

          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.25', marginBottom: '12px' }}>
              Sistem Monitoring PKL
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '13.5px', lineHeight: '1.6' }}>
              Pantau kehadiran, jurnal harian, dan penilaian siswa PKL secara real-time.
            </p>
          </div>

          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            SE DEV &copy; 2026
          </div>
        </div>

        {/* Form Kanan (Putih) */}
        <div className="login-form-container">
          <div className="login-header">
            <img src="/logo.png" alt="Logo SIMON PKL" className="main-logo-img" />
            <h1 className="login-title">SIMON PKL</h1>
            <p className="login-subtitle">Silakan masuk ke akun Anda</p>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Masuk Sebagai (Role)</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="siswa"> Siswa PKL</option>
                <option value="guru"> Guru Pembimbing</option>
                <option value="dudi"> Pembimbing DUDI / Industri</option>
                <option value="admin"> Admin Sekolah</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-link"
                onClick={onNavigateForgotPassword}
              >
                Lupa Password?
              </button>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'MEMPROSES...' : 'MASUK'}
            </button>
          </form>

          <p className="login-footer-text">
            Belum punya akun?{' '}
            <button
              type="button"
              className="register-link"
              onClick={onNavigateRegister}
            >
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}