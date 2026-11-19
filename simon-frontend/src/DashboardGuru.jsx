import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Award,
  LogOut,
  Menu,
  X,
  Search,
  GraduationCap,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Save,
  Check
} from 'lucide-react';

export default function DashboardGuru({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [siswaList, setSiswaList] = useState([]);
  const [jurnalList, setJurnalList] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [nilaiList, setNilaiList] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Detail Rekap Siswa & Preview Foto (Modal)
  const [selectedSiswaDetail, setSelectedSiswaDetail] = useState(null);
  const [selectedFoto, setSelectedFoto] = useState(null);

  // URL Backend Cloudflare Tunnel Aktif
  const API_BASE_URL = 'https://observer-aurora-powerseller-concerns.trycloudflare.com';

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSiswa, resJurnal, resPresensi, resJadwal] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/siswa`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/jurnal`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/presensi`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/jadwal-monitoring`).catch(() => ({ data: [] }))
      ]);

      // Simpan data dari API ke state masing-masing
      setSiswaList(Array.isArray(resSiswa.data) ? resSiswa.data : (resSiswa.data?.data || []));
      setJurnalList(Array.isArray(resJurnal.data) ? resJurnal.data : (resJurnal.data?.data || []));
      setPresensiList(Array.isArray(resPresensi.data) ? resPresensi.data : (resPresensi.data?.data || []));
      setJadwalList(Array.isArray(resJadwal.data) ? resJadwal.data : (resJadwal.data?.data || []));
    } catch (error) {
      console.error('Gagal memuat data dashboard:', error);
    }
  };

  const jurnalValid = jurnalList;

  // Statistik Ringkasan
  const totalSiswa = siswaList.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const jurnalHariIni = jurnalValid.filter(j => (j.tanggal || '').includes(todayStr)).length;
  const presensiHadirHariIni = presensiList.filter(p => (p.tanggal || '').includes(todayStr) && (p.status || '').toLowerCase() === 'hadir').length;
  const belumIsiJurnal = totalSiswa - jurnalHariIni > 0 ? totalSiswa - jurnalHariIni : 0;

  // Handler Kirim Nilai Akhir ke Backend Laravel
  const handleSimpanNilai = async (s) => {
    try {
      const dataSiswa = nilaiList[s.nisn] || {
        nilai_laporan: s.nilai_laporan || '',
        nilai_seminar: s.nilai_seminar || '',
        catatan_guru: s.catatan_guru || ''
      };

      const response = await axios.post(`${API_BASE_URL}/api/guru/penilaian`, {
        nisn: s.nisn,
        siswa_id: s.id,
        nilai_laporan: dataSiswa.nilai_laporan,
        nilai_seminar: dataSiswa.nilai_seminar,
        catatan_guru: dataSiswa.catatan_guru
      });

      if (response.data.success) {
        alert(`Nilai akhir untuk siswa ${s.name || s.nama} berhasil disimpan ke database!`);
        fetchData(); // Refresh data agar sinkron
      }
    } catch (error) {
      console.error('Gagal menyimpan nilai:', error);
      const errMsg = error.response?.data?.message || error.message;
      alert('Gagal menyimpan nilai: ' + errMsg);
    }
  };

  // Fungsi Cetak PDF / Print Rekap
  const handleCetakPDF = () => {
    window.print();
  };

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden relative">

      {/* CSS KHUSUS CETAK / PRINT FORMAL */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>

      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-[#0b0f17] border-r border-slate-800/60 flex-col justify-between p-4 hidden md:flex print:hidden">
        <div>
          <div className="flex items-center space-x-3 px-3 py-4 mb-4 border-b border-slate-800/60">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-600/30">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white">GURU PEMBIMBING</h1>
              <p className="text-[11px] text-blue-400 font-medium">SIMON PKL</p>
            </div>
          </div>

          <nav className="space-y-1.5 mt-2">
            <button
              onClick={() => setActiveTab('ringkasan')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'ringkasan' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={16} /><span>Ringkasan Monitoring</span>
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'siswa' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Users size={16} /><span>Siswa Bimbingan</span>
            </button>
            <button
              onClick={() => setActiveTab('jurnal')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'jurnal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <BookOpen size={16} /><span>Jurnal & Absensi</span>
            </button>
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'jadwal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Calendar size={16} /><span>Jadwal Monitoring DUDI</span>
            </button>
            <button
              onClick={() => setActiveTab('penilaian')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'penilaian' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Award size={16} /><span>Penilaian Akhir</span>
            </button>
          </nav>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800/60">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={16} /><span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-6 md:hidden">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white"><GraduationCap size={18} /></div>
                <div>
                  <h1 className="text-sm font-bold text-white">GURU PEMBIMBING</h1>
                  <p className="text-[10px] text-slate-400">SIMON PKL</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800 text-slate-300 rounded-xl"><X size={20} /></button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { setActiveTab('ringkasan'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'ringkasan' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <LayoutDashboard size={18} /><span>Ringkasan Monitoring</span>
              </button>
              <button onClick={() => { setActiveTab('siswa'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'siswa' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <Users size={18} /><span>Siswa Bimbingan</span>
              </button>
              <button onClick={() => { setActiveTab('jurnal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'jurnal' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <BookOpen size={18} /><span>Jurnal & Absensi</span>
              </button>
              <button onClick={() => { setActiveTab('jadwal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'jadwal' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <Calendar size={18} /><span>Jadwal Monitoring DUDI</span>
              </button>
              <button onClick={() => { setActiveTab('penilaian'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'penilaian' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <Award size={18} /><span>Penilaian Akhir</span>
              </button>
            </nav>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20">
            <LogOut size={16} /><span>Keluar (Logout)</span>
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#07090e] pb-20 md:pb-0 print:overflow-visible print:bg-white print:p-0">

        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-5 border-b border-slate-800/60 bg-[#0b0f17]/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 bg-[#111827] border border-slate-800 text-slate-200 rounded-xl relative z-40 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base md:text-xl font-extrabold text-white tracking-wide">
                {activeTab === 'ringkasan' && 'Dashboard Pembimbing Sekolah'}
                {activeTab === 'siswa' && 'Daftar Siswa Bimbingan PKL'}
                {activeTab === 'jurnal' && 'Rekap Jurnal & Absensi Siswa'}
                {activeTab === 'jadwal' && 'Jadwal Kunjungan Monitoring DUDI'}
                {activeTab === 'penilaian' && 'Penilaian Akhir PKL Siswa'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'ringkasan' && 'Monitoring perkembangan dan kehadiran siswa PKL secara kualitatif.'}
                {activeTab === 'siswa' && 'Kelola dan pantau seluruh siswa bimbingan Anda.'}
                {activeTab === 'jurnal' && 'Daftar rekapitulasi kehadiran dan catatan aktivitas harian seluruh siswa.'}
                {activeTab === 'jadwal' && 'Agenda jadwal kunjungan guru pembimbing ke perusahaan mitra.'}
                {activeTab === 'penilaian' && 'Formulir pengisian evaluasi, nilai akhir, dan predikat kompetensi PKL siswa.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#111827] border border-slate-800 px-4 py-2 rounded-xl shadow-inner">
            <span className="text-xs font-semibold text-white">{user?.nama || 'Hj Eli'}</span>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">GURU</span>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-6 print:p-0">

          {/* TAB 1: RINGKASAN MONITORING */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6 max-w-7xl mx-auto print:hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-lg border-l-4 border-l-blue-500">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL SISWA BIMBINGAN</p>
                  <h3 className="text-2xl font-black text-white mt-2">{totalSiswa} Siswa</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-lg border-l-4 border-l-cyan-500">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">JURNAL MASUK HARI INI</p>
                  <h3 className="text-2xl font-black text-cyan-400 mt-2">{jurnalHariIni} / {totalSiswa}</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-lg border-l-4 border-l-emerald-500">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SISWA PRESENSI HADIR</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-2">{presensiHadirHariIni} / {totalSiswa}</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-lg border-l-4 border-l-amber-500">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">BELUM MENGISI JURNAL</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-2">{belumIsiJurnal} Siswa</h3>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Status Monitoring Harian Siswa Bimbingan</h3>
                  <div className="relative w-60">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">NAMA SISWA</th>
                        <th className="px-4 py-3.5">NIS / EMAIL</th>
                        <th className="px-4 py-3.5">TEMPAT PKL (DUDI)</th>
                        <th className="px-4 py-3.5">PRESENSI HARI INI</th>
                        <th className="px-4 py-3.5">JURNAL HARIAN</th>
                        <th className="px-4 py-3.5 text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {siswaList.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-slate-500 italic">Belum ada data siswa bimbingan di database.</td></tr>
                      ) : (
                        siswaList.filter(s => (s.name || s.nama_siswa || s.nama || '').toLowerCase().includes(searchTerm.toLowerCase())).map((s, idx) => {
                          const sNisn = String(s.nisn || '').trim();
                          const sId = String(s.id || '').trim();
                          const sName = (s.name || s.nama_siswa || s.nama || '').toLowerCase();

                          const presensiSiswa = presensiList.find(p => {
                            const pNisn = String(p.nisn || p.student_nisn || '').trim();
                            const pId = String(p.user_id || p.student_id || p.siswa_id || '').trim();
                            const pName = (p.nama_siswa || p.name || '').toLowerCase();
                            return (
                              (sNisn && pNisn === sNisn) ||
                              (sId && pId === sId) ||
                              (sName && pName === sName)
                            ) && (p.tanggal || '').includes(todayStr);
                          });

                          const jurnalSiswa = jurnalValid.find(j => {
                            const jNisn = String(j.nisn || j.student_nisn || '').trim();
                            const jId = String(j.user_id || j.student_id || j.siswa_id || '').trim();
                            const jName = (j.nama_siswa || j.name || '').toLowerCase();
                            return (
                              (sNisn && jNisn === sNisn) ||
                              (sId && jId === sId) ||
                              (sName && jName === sName)
                            ) && (j.tanggal || '').includes(todayStr);
                          });

                          return (
                            <tr key={s.id || idx} className="hover:bg-slate-800/30">
                              <td className="px-4 py-3.5 font-bold text-white">{s.name || s.nama_siswa || s.nama}</td>
                              <td className="px-4 py-3.5 text-slate-300">{s.nisn || s.email}</td>
                              <td className="px-4 py-3.5 text-indigo-400 font-medium">{s.tempat_pkl || 'PT. Solusi Tunas Pratama Tbk'}</td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${presensiSiswa ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                  {presensiSiswa ? (presensiSiswa.status || 'Hadir').toUpperCase() : 'BELUM ABSEN'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${jurnalSiswa ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-700/30 text-slate-400 border border-slate-700'}`}>
                                  {jurnalSiswa ? (jurnalSiswa.status || 'TERCATAT') : 'PENDING'}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button onClick={() => setSelectedSiswaDetail(s)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                                  Detail Rekap
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SISWA BIMBINGAN */}
          {activeTab === 'siswa' && (
            <div className="space-y-6 max-w-7xl mx-auto print:hidden">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Daftar Siswa Bimbingan PKL</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">NIS / EMAIL</th>
                        <th className="px-4 py-3.5">NAMA SISWA</th>
                        <th className="px-4 py-3.5">PERUSAHAAN (DUDI)</th>
                        <th className="px-4 py-3.5">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {siswaList.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-500 italic">Belum ada data siswa bimbingan.</td></tr>
                      ) : (
                        siswaList.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3.5 font-medium text-white">{s.nisn || s.email}</td>
                            <td className="px-4 py-3.5 font-bold text-white">{s.name || s.nama_siswa || s.nama}</td>
                            <td className="px-4 py-3.5 text-indigo-400">{s.tempat_pkl || 'PT. Solusi Tunas Pratama Tbk'}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AKTIF PKL</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JURNAL & ABSENSI */}
          {activeTab === 'jurnal' && (
            <div className="space-y-6 max-w-7xl mx-auto print:hidden">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white">Rekapitulasi Jurnal & Absensi Seluruh Hari</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Unduh rekapitulasi lengkap aktivitas harian, kehadiran, dan foto bukti siswa dalam format PDF.</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">NAMA SISWA</th>
                        <th className="px-4 py-3.5">PERUSAHAAN (DUDI)</th>
                        <th className="px-4 py-3.5">TOTAL HADIR</th>
                        <th className="px-4 py-3.5">TOTAL JURNAL</th>
                        <th className="px-4 py-3.5 text-center">AKSI REKAP & FOTO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {siswaList.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-8 text-slate-500 italic">Belum ada data rekap jurnal & absensi.</td></tr>
                      ) : (
                        siswaList.map((s, idx) => {
                          const sNisn = String(s.nisn || '').trim();
                          const sId = String(s.id || '').trim();
                          const sName = (s.name || s.nama_siswa || s.nama || '').toLowerCase();

                          const totalHadirSiswa = presensiList.filter(p => {
                            const pNisn = String(p.nisn || p.student_nisn || '').trim();
                            const pId = String(p.user_id || p.student_id || p.siswa_id || '').trim();
                            const pName = (p.nama_siswa || p.name || '').toLowerCase();
                            return (
                              (sNisn && pNisn === sNisn) ||
                              (sId && pId === sId) ||
                              (sName && pName === sName)
                            ) && (p.status || '').toLowerCase() === 'hadir';
                          }).length;

                          const totalJurnalSiswa = jurnalValid.filter(j => {
                            const jNisn = String(j.nisn || j.student_nisn || '').trim();
                            const jId = String(j.user_id || j.student_id || j.siswa_id || '').trim();
                            const jName = (j.nama_siswa || j.name || '').toLowerCase();
                            return (
                              (sNisn && jNisn === sNisn) ||
                              (sId && jId === sId) ||
                              (sName && jName === sName)
                            );
                          }).length;

                          const studentName = s.name || s.nama_siswa || s.nama;
                          return (
                            <tr key={s.id || idx} className="hover:bg-slate-800/30">
                              <td className="px-4 py-3.5 font-bold text-white">{studentName}</td>
                              <td className="px-4 py-3.5 text-indigo-400">{s.tempat_pkl || 'PT. Solusi Tunas Pratama Tbk'}</td>
                              <td className="px-4 py-3.5 font-semibold text-emerald-400">{totalHadirSiswa} Hari</td>
                              <td className="px-4 py-3.5 font-semibold text-cyan-400">{totalJurnalSiswa} Entri</td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => setSelectedSiswaDetail(s)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 mx-auto shadow-md transition"
                                >
                                  <FileText size={14} />
                                  <span>Lihat Detail & Foto</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JADWAL MONITORING */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-4">Jadwal Kunjungan Monitoring DUDI</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#0f1523] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3.5">GURU PEMBIMBING</th>
                        <th className="px-4 py-3.5">PERUSAHAAN (DUDI)</th>
                        <th className="px-4 py-3.5">ALAMAT / LOKASI</th>
                        <th className="px-4 py-3.5">SISWA BIMBINGAN</th>
                        <th className="px-4 py-3.5">JADWAL KUNJUNGAN</th>
                        <th className="px-4 py-3.5">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {jadwalList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                            Belum ada jadwal kunjungan DUDI dari admin.
                          </td>
                        </tr>
                      ) : (
                        jadwalList.map((j, idx) => (
                          <tr key={j.id || idx} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3.5 font-bold text-blue-400">{j.guru_pembimbing}</td>
                            <td className="px-4 py-3.5 font-bold text-white">{j.perusahaan}</td>
                            <td className="px-4 py-3.5 text-slate-400">{j.alamat}</td>
                            <td className="px-4 py-3.5 text-slate-200">{j.siswa}</td>
                            <td className="px-4 py-3.5 text-amber-400 font-semibold">{j.jadwal}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {j.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PENILAIAN AKHIR */}
          {activeTab === 'penilaian' && (
            <div className="space-y-6 max-w-7xl mx-auto print:hidden">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white">Formulir Penilaian Akhir PKL Siswa (Oleh Guru Pembimbing)</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">NAMA SISWA</th>
                        <th className="px-4 py-3.5">NIS / EMAIL</th>
                        <th className="px-4 py-3.5">NILAI LAPORAN (0-100)</th>
                        <th className="px-4 py-3.5">NILAI SEMINAR (0-100)</th>
                        <th className="px-4 py-3.5">CATATAN GURU</th>
                        <th className="px-4 py-3.5 text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {siswaList.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-8 text-slate-500 italic">Belum ada siswa bimbingan untuk diberi nilai.</td></tr>
                      ) : (
                        siswaList.map((s, idx) => {
                          const currentVal = nilaiList[s.nisn] || {
                            nilai_laporan: s.nilai_laporan || '',
                            nilai_seminar: s.nilai_seminar || '',
                            catatan_guru: s.catatan_guru || ''
                          };

                          return (
                            <tr key={s.id || idx} className="hover:bg-slate-800/30">
                              <td className="px-4 py-3.5 font-bold text-white">{s.name || s.nama_siswa || s.nama}</td>
                              <td className="px-4 py-3.5 text-slate-300">{s.nisn || s.email}</td>

                              {/* Input Nilai Laporan */}
                              <td className="px-4 py-3.5">
                                <input
                                  type="number"
                                  defaultValue={currentVal.nilai_laporan}
                                  placeholder="0-100"
                                  className="w-24 bg-[#07090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNilaiList({
                                      ...nilaiList,
                                      [s.nisn]: { ...currentVal, nilai_laporan: val }
                                    });
                                  }}
                                />
                              </td>

                              {/* Input Nilai Seminar */}
                              <td className="px-4 py-3.5">
                                <input
                                  type="number"
                                  defaultValue={currentVal.nilai_seminar}
                                  placeholder="0-100"
                                  className="w-24 bg-[#07090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNilaiList({
                                      ...nilaiList,
                                      [s.nisn]: { ...currentVal, nilai_seminar: val }
                                    });
                                  }}
                                />
                              </td>

                              {/* Input Catatan Guru */}
                              <td className="px-4 py-3.5">
                                <input
                                  type="text"
                                  defaultValue={currentVal.catatan_guru}
                                  placeholder="Catatan untuk siswa..."
                                  className="w-48 bg-[#07090e] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNilaiList({
                                      ...nilaiList,
                                      [s.nisn]: { ...currentVal, catatan_guru: val }
                                    });
                                  }}
                                />
                              </td>

                              {/* Tombol Simpan */}
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  onClick={() => handleSimpanNilai(s)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 mx-auto transition shadow-md"
                                >
                                  <Save size={13} />
                                  <span>Simpan</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL DETAIL REKAP HARIAN & FORMAT CETAK FORMAL ARSIP */}
      {selectedSiswaDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:fixed print:inset-0 print:bg-white print:p-0 print:block">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 max-w-4xl w-full space-y-6 shadow-2xl my-8 print:bg-white print:text-black print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none">

            {/* TAMPILAN NORMAL (DI WEB) */}
            <div className="print:hidden space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Detail Rekap Harian & Foto Presensi Siswa</h3>
                  <p className="text-xs text-slate-400">Menampilkan seluruh aktivitas jurnal dan bukti foto kehadiran yang dapat dicetak.</p>
                </div>
                <button
                  onClick={() => setSelectedSiswaDetail(null)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-800 p-2 rounded-xl"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Info Siswa */}
              <div className="bg-[#07090e] p-4 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Nama Siswa:</span>
                  <span className="font-bold text-white text-sm">{selectedSiswaDetail.name || selectedSiswaDetail.nama_siswa || selectedSiswaDetail.nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">NISN / Email:</span>
                  <span className="font-medium text-slate-200">{selectedSiswaDetail.nisn || selectedSiswaDetail.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tempat PKL (DUDI):</span>
                  <span className="font-medium text-indigo-400">{selectedSiswaDetail.tempat_pkl || 'PT. Solusi Tunas Pratama Tbk'}</span>
                </div>
              </div>

              {/* Tabel Jurnal Harian */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Catatan Aktivitas Jurnal Harian</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-3.5 py-3">TANGGAL</th>
                        <th className="px-3.5 py-3">AKTIVITAS / KEGIATAN</th>
                        <th className="px-3.5 py-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {jurnalValid.filter(j => {
                        const jNisn = String(j.nisn || j.student_nisn || '').trim();
                        const jId = String(j.user_id || j.student_id || j.siswa_id || '').trim();
                        const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                        const sId = String(selectedSiswaDetail.id || '').trim();
                        return (sNisn && jNisn === sNisn) || (sId && jId === sId);
                      }).length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center py-6 text-slate-500 italic">
                            Belum ada data jurnal harian untuk siswa ini.
                          </td>
                        </tr>
                      ) : (
                        jurnalValid
                          .filter(j => {
                            const jNisn = String(j.nisn || j.student_nisn || '').trim();
                            const jId = String(j.user_id || j.student_id || j.siswa_id || '').trim();
                            const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                            const sId = String(selectedSiswaDetail.id || '').trim();
                            return (sNisn && jNisn === sNisn) || (sId && jId === sId);
                          })
                          .map((j, i) => (
                            <tr key={i} className="hover:bg-slate-800/30">
                              <td className="px-3.5 py-3 font-medium text-white">{j.tanggal || j.date}</td>
                              <td className="px-3.5 py-3">{j.kegiatan || j.activity}</td>
                              <td className="px-3.5 py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {j.status || 'Disetujui'}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Presensi */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Rekapitulasi Kehadiran & Foto Bukti Presensi</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="px-3.5 py-3">TANGGAL</th>
                        <th className="px-3.5 py-3">JAM MASUK</th>
                        <th className="px-3.5 py-3">STATUS</th>
                        <th className="px-3.5 py-3 text-center">FOTO BUKTI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {presensiList.filter(p => {
                        const pNisn = String(p.nisn || p.student_nisn || p.student?.nisn || p.siswa?.nisn || '').trim();
                        const pId = String(p.user_id || p.student_id || p.siswa_id || p.student?.id || p.siswa?.id || '').trim();
                        const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                        const sId = String(selectedSiswaDetail.id || '').trim();
                        return (sNisn && pNisn === sNisn) || (sId && pId === sId);
                      }).length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-slate-500 italic">
                            Belum ada data presensi kehadiran untuk siswa ini.
                          </td>
                        </tr>
                      ) : (
                        presensiList
                          .filter(p => {
                            const pNisn = String(p.nisn || p.student_nisn || p.student?.nisn || p.siswa?.nisn || '').trim();
                            const pId = String(p.user_id || p.student_id || p.siswa_id || p.student?.id || p.siswa?.id || '').trim();
                            const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                            const sId = String(selectedSiswaDetail.id || '').trim();
                            return (sNisn && pNisn === sNisn) || (sId && pId === sId);
                          })
                          .map((p, i) => (
                            <tr key={i} className="hover:bg-slate-800/30">
                              <td className="px-3.5 py-3 font-medium text-white">{p.tanggal}</td>
                              <td className="px-3.5 py-3">{p.jam_masuk || p.jam || '-'}</td>
                              <td className="px-3.5 py-3">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {p.status || 'Hadir'}
                                </span>
                              </td>
                              <td className="px-3.5 py-3 text-center">
                                {p.foto || p.photo_url ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <img
                                      src={p.foto || p.photo_url}
                                      alt="Bukti Presensi"
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 transition"
                                      onClick={() => setSelectedFoto(p.foto || p.photo_url)}
                                    />
                                    <button
                                      onClick={() => setSelectedFoto(p.foto || p.photo_url)}
                                      className="text-blue-400 hover:underline text-[11px]"
                                    >
                                      Perbesar
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 italic text-[11px]">Tidak ada foto</span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setSelectedSiswaDetail(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Tutup
                </button>
                <button
                  onClick={handleCetakPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition"
                >
                  <Printer size={15} />
                  <span>Cetak PDF Arsip Resmi</span>
                </button>
              </div>
            </div>

            {/* TAMPILAN KHUSUS CETAK RESMI (HANYA MUNCUL SAAT DI-PRINT) */}
            <div className="hidden print:block text-black bg-white p-2 space-y-4 font-sans text-xs">

              {/* Kop Surat Resmi */}
              <div className="text-center border-b-2 border-black pb-3 mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wide">LAPORAN KEMAJUAN & MONITORING PRAKTIK KERJA LAPANGAN (PKL)</h3>
                <h1 className="text-base font-black uppercase tracking-wider mt-1">SISTEM MONITORING PKL (SIMON PKL)</h1>
                <p className="text-[10px] text-gray-700 mt-0.5">Dokumen Resmi Arsip Buku Bimbingan Sekolah & Dunia Industri</p>
              </div>

              {/* Biodata Siswa */}
              <div className="mb-4 border border-black p-3">
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="font-bold py-1 w-32">Nama Siswa</td>
                      <td>: {selectedSiswaDetail.name || selectedSiswaDetail.nama_siswa || selectedSiswaDetail.nama}</td>
                      <td className="font-bold py-1 w-36">Tempat PKL (DUDI)</td>
                      <td>: {selectedSiswaDetail.tempat_pkl || 'PT. Solusi Tunas Pratama Tbk'}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-1">NISN / Email</td>
                      <td>: {selectedSiswaDetail.nisn || selectedSiswaDetail.email}</td>
                      <td className="font-bold py-1">Guru Pembimbing</td>
                      <td>: {user?.nama || 'Hj Eli'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabel Jurnal Harian */}
              <div className="space-y-2 mb-4">
                <h4 className="font-bold uppercase text-xs border-b border-black pb-1">I. Catatan Aktivitas Jurnal Harian Siswa</h4>
                <table className="w-full text-left border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="border border-black p-1.5 text-center w-10">No</th>
                      <th className="border border-black p-1.5 w-28">Tanggal</th>
                      <th className="border border-black p-1.5">Aktivitas / Kegiatan Harian</th>
                      <th className="border border-black p-1.5 w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jurnalValid.filter(j => {
                      const jNisn = String(j.nisn || j.student_nisn || '').trim();
                      const jId = String(j.user_id || j.student_id || j.siswa_id || '').trim();
                      const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                      const sId = String(selectedSiswaDetail.id || '').trim();
                      return (sNisn && jNisn === sNisn) || (sId && jId === sId);
                    }).map((j, i) => (
                      <tr key={i} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center">{i + 1}</td>
                        <td className="border border-black p-1.5">{j.tanggal || j.date}</td>
                        <td className="border border-black p-1.5">{j.kegiatan || j.activity}</td>
                        <td className="border border-black p-1.5 text-center font-bold">{j.status || 'Disetujui'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabel Presensi Kehadiran & Foto Bukti */}
              <div className="space-y-2 mb-4">
                <h4 className="font-bold uppercase text-xs border-b border-black pb-1">II. Rekapitulasi Kehadiran & Foto Bukti Presensi</h4>
                <table className="w-full text-left border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="border border-black p-1.5 text-center w-10">No</th>
                      <th className="border border-black p-1.5 w-24">Tanggal</th>
                      <th className="border border-black p-1.5 w-20 text-center">Jam</th>
                      <th className="border border-black p-1.5 w-20 text-center">Status</th>
                      <th className="border border-black p-1.5 text-center w-28">Foto Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presensiList.filter(p => {
                      const pNisn = String(p.nisn || p.student_nisn || '').trim();
                      const pId = String(p.user_id || p.student_id || p.siswa_id || '').trim();
                      const sNisn = String(selectedSiswaDetail.nisn || '').trim();
                      const sId = String(selectedSiswaDetail.id || '').trim();
                      return (sNisn && pNisn === sNisn) || (sId && pId === sId);
                    }).map((p, i) => (
                      <tr key={i} className="border-b border-black">
                        <td className="border border-black p-1.5 text-center">{i + 1}</td>
                        <td className="border border-black p-1.5">{p.tanggal}</td>
                        <td className="border border-black p-1.5 text-center">{p.jam_masuk || '-'}</td>
                        <td className="border border-black p-1.5 text-center font-bold uppercase">{p.status || 'Hadir'}</td>
                        <td className="border border-black p-1.5 text-center">
                          {p.foto ? (
                            <img
                              src={p.foto}
                              alt="Bukti"
                              className="w-12 h-12 object-cover mx-auto border border-black rounded"
                            />
                          ) : (
                            <span className="text-[10px] italic text-gray-500">Tanpa Foto</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* III. TABEL REKAPITULASI NILAI AKHIR (DUDI & GURU) */}
              <div className="space-y-2 mb-6 page-break-inside-avoid">
                <h4 className="font-bold uppercase text-xs border-b border-black pb-1">III. Rekapitulasi Nilai Akhir & Evaluasi PKL</h4>
                <table className="w-full text-left border-collapse border border-black text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="border border-black p-1.5 font-bold">Komponen Penilaian</th>
                      <th className="border border-black p-1.5 text-center w-24 font-bold">Nilai (0-100)</th>
                      <th className="border border-black p-1.5 font-bold">Catatan / Evaluasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">1. Kedisiplinan (DUDI)</td>
                      <td className="border border-black p-1.5 text-center font-bold">{selectedSiswaDetail.discipline || '-'}</td>
                      <td className="border border-black p-1.5" rowSpan="3">{selectedSiswaDetail.notes || selectedSiswaDetail.catatan_dudi || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">2. Keterampilan Teknis (DUDI)</td>
                      <td className="border border-black p-1.5 text-center font-bold">{selectedSiswaDetail.skills || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">3. Sikap / Kerjasama (DUDI)</td>
                      <td className="border border-black p-1.5 text-center font-bold">{selectedSiswaDetail.attitude || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">4. Nilai Laporan (Guru Pembimbing)</td>
                      <td className="border border-black p-1.5 text-center font-bold">{selectedSiswaDetail.nilai_laporan || '-'}</td>
                      <td className="border border-black p-1.5" rowSpan="2">{selectedSiswaDetail.catatan_guru || '-'}</td>
                    </tr>
                    <tr className="border-b border-black">
                      <td className="border border-black p-1.5">5. Nilai Seminar / Presentasi (Guru Pembimbing)</td>
                      <td className="border border-black p-1.5 text-center font-bold">{selectedSiswaDetail.nilai_seminar || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Pengesahan Arsip */}
              <div className="flex justify-between items-start pt-6 text-xs mt-8 page-break-inside-avoid">
                <div className="text-center w-48">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Pembimbing DUDI</p>
                  <br /><br /><br />
                  <p className="font-bold underline">( ........................................ )</p>
                </div>
                <div className="text-center w-48">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Guru Pembimbing Sekolah</p>
                  <br /><br /><br />
                  <p className="font-bold underline">({user?.nama || 'Hj Eli'})</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL POPUP PREVIEW FOTO BESAR */}
      {selectedFoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Bukti Foto Kehadiran</h4>
              <button
                onClick={() => setSelectedFoto(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Tutup
              </button>
            </div>
            <div className="text-center">
              <img
                src={selectedFoto}
                alt="Bukti Presensi Siswa"
                className="w-full h-64 object-cover rounded-xl border border-slate-700 shadow-md"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}