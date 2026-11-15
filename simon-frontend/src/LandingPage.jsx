import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  LogIn, 
  ArrowRight, 
  MapPin, 
  BookOpen, 
  Award, 
  Users, 
  Building2, 
  CheckCircle2, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function LandingPage({ onNavigateLogin }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/60 px-4 sm:px-6 lg:px-16 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black tracking-wider text-white block">SIMON PKL</span>
            <span className="text-[9px] sm:text-[10px] text-blue-400 font-semibold tracking-wide">Sistem Monitoring Magang Digital</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
          <a href="#fitur" className="hover:text-blue-400 transition">Fitur Utama</a>
          <a href="#peran" className="hover:text-blue-400 transition">Untuk Siapa?</a>
          <a href="#alur" className="hover:text-blue-400 transition">Alur Sistem</a>
        </nav>

        {/* Tombol Kanan Navbar */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onNavigateLogin}
            className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-800 cursor-pointer"
          >
            Masuk (Login)
          </button>

          <button 
            onClick={onNavigateLogin}
            className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mulai Sekarang</span>
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-center items-center space-y-6 text-sm font-semibold text-slate-200 md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white"
          >
            <X className="w-7 h-7" />
          </button>
          <a href="#fitur" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition">Fitur Utama</a>
          <a href="#peran" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition">Untuk Siapa?</a>
          <a href="#alur" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-400 transition">Alur Sistem</a>
          <div className="flex flex-col space-y-3 w-48 pt-4">
            <button 
              onClick={onNavigateLogin}
              className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-200 text-xs font-semibold"
            >
              Masuk (Login)
            </button>
            <button 
              onClick={onNavigateLogin}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white shadow-lg text-xs font-bold flex items-center justify-center space-x-1.5"
            >
              <span>Mulai Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-emerald-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-semibold mb-6 animate-pulse">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Resmi Pengelolaan & Penilaian PKL Terintegrasi</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Transformasi Pengelolaan PKL Menjadi Lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Transparan & Real-Time</span>
        </h1>

        <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Solusi digital modern untuk Siswa, Guru Pembimbing, dan pihak DUDI dalam mengelola presensi GPS, jurnal harian kegiatan magang, hingga rekapitulasi nilai akhir.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full">
          <button 
            onClick={onNavigateLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Akses Portal SIMON PKL</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* MOCKUP PREVIEW CARD */}
        <div className="mt-12 sm:mt-16 w-full bg-[#111827] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative text-left">
          <div className="absolute top-4 left-6 flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="mt-6 bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 sm:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Presensi Harian</span>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-1">Sudah Presensi (GPS)</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Jurnal Kegiatan</span>
              <p className="text-xs sm:text-sm font-extrabold text-blue-400 mt-1">Disetujui DUDI</p>
            </div>
            <div className="bg-[#111827] p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Akumulasi Nilai Akhir</span>
              <p className="text-xs sm:text-sm font-extrabold text-cyan-400 mt-1">Lengkap & Transparan</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS HIGHLIGHTS */}
      <section className="border-y border-slate-800/60 bg-[#0b0f17]/50 py-10 sm:py-12 px-4 sm:px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-white">100%</h3>
            <p className="text-xs text-slate-400 mt-1">Berbasis Digital</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-blue-400">Real-Time</h3>
            <p className="text-xs text-slate-400 mt-1">Monitoring Kehadiran</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-cyan-400">DUDI & Guru</h3>
            <p className="text-xs text-slate-400 mt-1">Penilaian Terpadu</p>
          </div>
          <div>
            <h3 className="text-xl sm:text-3xl font-black text-emerald-400">PDF Arsip</h3>
            <p className="text-xs text-slate-400 mt-1">Cetak Dokumen Resmi</p>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA */}
      <section id="fitur" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Fitur Unggulan SIMON PKL</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Dirancang khusus untuk mempermudah seluruh alur administrasi Praktik Kerja Lapangan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-blue-500/50 transition">
            <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-xl flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Presensi GPS & Foto Bukti</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Siswa melakukan absensi harian langsung dari lokasi magang dilengkapi validasi koordinat GPS dan foto selfie.</p>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-blue-500/50 transition">
            <div className="w-10 h-10 bg-cyan-600/10 text-cyan-400 rounded-xl flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Jurnal Kegiatan Harian</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Pencatatan aktivitas harian siswa magang yang terpantau langsung oleh pembimbing DUDI dan guru sekolah.</p>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-blue-500/50 transition">
            <div className="w-10 h-10 bg-emerald-600/10 text-emerald-400 rounded-xl flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Rekapitulasi Nilai & Arsip PDF</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Akumulasi nilai kedisiplinan DUDI dan laporan guru pembimbing yang siap dicetak dalam format dokumen resmi.</p>
          </div>
        </div>
      </section>

      {/* PERAN PENGGUNA */}
      <section id="peran" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 bg-[#0b0f17]/50 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Dirancang Untuk Semua Pengguna</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">Akses khusus yang disesuaikan dengan kebutuhan peran masing-masing.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Siswa */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl"><Users className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold text-white">Siswa Magang</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /><span>Kirim absen & koordinat GPS</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /><span>Isi jurnal kegiatan harian</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /><span>Pantau nilai akhir transparan</span></li>
              </ul>
            </div>

            {/* Guru */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-600 text-white rounded-xl"><GraduationCap className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold text-white">Guru Pembimbing</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Monitoring siswa bimbingan</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Input nilai laporan & seminar</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /><span>Cetak rekapitulasi PDF arsip</span></li>
              </ul>
            </div>

            {/* DUDI */}
            <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl"><Building2 className="w-5 h-5" /></div>
                <h3 className="text-sm font-bold text-white">Pembimbing DUDI</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Validasi jurnal harian siswa</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Penilaian kedisiplinan & skill</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>Evaluasi kinerja magang</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ALUR SISTEM */}
      <section id="alur" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Alur Sistem SIMON PKL</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Langkah mudah menggunakan sistem monitoring magang dari awal hingga kelulusan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-3">
            <span className="text-blue-500 font-black text-lg">01</span>
            <h3 className="text-sm font-bold text-white">Login & Akses Portal</h3>
            <p className="text-xs text-slate-400">Masuk menggunakan akun resmi siswa, guru, atau DUDI yang telah disinkronkan oleh sistem.</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-3">
            <span className="text-cyan-500 font-black text-lg">02</span>
            <h3 className="text-sm font-bold text-white">Aktivitas & Jurnal Harian</h3>
            <p className="text-xs text-slate-400">Siswa mengirim presensi GPS dan mengisi jurnal kegiatan setiap hari untuk divalidasi pembimbing.</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-6 rounded-2xl space-y-3">
            <span className="text-emerald-500 font-black text-lg">03</span>
            <h3 className="text-sm font-bold text-white">Penilaian & Cetak Arsip</h3>
            <p className="text-xs text-slate-400">Akumulasi nilai akhir DUDI dan guru pembimbing diproses dan siap dicetak ke dalam format PDF resmi.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-16 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} SIMON PKL. Sistem Informasi Monitoring Praktik Kerja Lapangan.</p>
      </footer>

    </div>
  );
}