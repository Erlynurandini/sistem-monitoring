import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import Register from './Register';
import ResetPassword from './ResetPassword';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import DashboardDudi from './DashboardDudi';
import GuruDashboard from './DashboardGuru';

export default function App() {
  // 1. Cek parameter URL terlebih dahulu (prioritas utama saat klik link email)
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  const urlEmail = params.get('email');

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    // Jika di URL ada token dan email, langsung arahkan ke view 'reset'
    if (urlToken && urlEmail) {
      return 'reset';
    }

    const token = localStorage.getItem('token');
    if (!token) return 'landing';

    const savedRole = localStorage.getItem('role');
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (savedRole === 'siswa' || savedUser?.nisn) return 'siswa';
    if (savedRole === 'dudi' || savedUser?.role === 'dudi') return 'dudi';
    if (savedRole === 'guru' || savedUser?.role === 'guru') return 'guru';
    
    return 'admin';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUserData(null);
    setCurrentView('landing');
  };

  // --- PRIORITAS TAMPILAN RESET PASSWORD ---
  if (currentView === 'reset' || (urlToken && urlEmail)) {
    return (
      <ResetPassword 
        token={urlToken} 
        email={urlEmail} 
        onBackToLogin={() => {
          // Bersihkan parameter token dari URL agar bersih kembali
          window.history.replaceState({}, document.title, window.location.pathname);
          setCurrentView('login');
        }} 
      />
    );
  }

  // Routing Tampilan Lainnya
  if (currentView === 'landing') {
    return <LandingPage onNavigateLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'forgot') {
    return <ForgotPassword onBackToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'register') {
    return <Register onBackToLogin={() => setCurrentView('login')} />;
  }

  if (currentView === 'siswa') {
    return <StudentDashboard user={userData} onLogout={handleLogout} />;
  }

  if (currentView === 'dudi') {
    return <DashboardDudi user={userData} onLogout={handleLogout} />;
  }

  if (currentView === 'guru') {
    return <GuruDashboard user={userData} onLogout={handleLogout} />;
  }

  if (currentView === 'admin') {
    return <AdminDashboard user={userData} onLogout={handleLogout} />;
  }

  return (
    <Login 
      onLoginSuccess={(user) => {
        setUserData(user);
        let role = user?.role;
        if (!role) {
          if (user?.nisn) role = 'siswa';
          else if (user?.email && user.email.includes('pembimbing.')) role = 'dudi';
          else role = 'admin';
        }
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentView(role);
      }}
      onNavigateForgotPassword={() => setCurrentView('forgot')}
      onNavigateRegister={() => setCurrentView('register')}
      onBackToLanding={() => setCurrentView('landing')}
    />
  );
}