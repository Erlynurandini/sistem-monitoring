import React, { useState } from 'react';
import logoImg from './assets/logo.png';

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Link reset password berhasil dikirim! Silakan cek inbox Mailtrap.io Anda.');
      } else {
        setIsSuccess(false);
        setMessage(result.message || 'Email tidak ditemukan di sistem.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Gagal terhubung ke server backend. Pastikan server Laravel aktif.');
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

        .login-title {
          font-size: 22px;
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

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background-color: #f9fafb;
          font-size: 13.5px;
          color: #111827;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .form-input:focus {
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

        .btn-submit:hover {
          background-color: #005bb5;
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .alert.success {
          background-color: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .alert.error {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

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

        .back-link button:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <img src={logoImg} alt="Logo SIMON PKL" className="main-logo-img" />
          <h2 className="login-title">Lupa Password</h2>
          <p className="login-subtitle">Masukkan email Anda untuk menerima tautan pemulihan</p>
        </div>

        {message && (
          <div className={`alert ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label className="form-label">Email Terdaftar</label>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'MENGIRIM...' : 'KIRIM LINK RESET'}
          </button>
        </form>

        <div className="back-link">
          <button type="button" onClick={onBackToLogin}>
            ← Kembali ke Halaman Login
          </button>
        </div>
      </div>
    </div>
  );
}