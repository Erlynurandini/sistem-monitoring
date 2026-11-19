import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  Settings,
  LogOut,
  Upload,
  UserPlus,
  Shield,
  Menu,
  X,
  CalendarDays,
  Plus
} from 'lucide-react';

const API_BASE_URL = 'https://observer-aurora-powerseller-concerns.trycloudflare.com';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State Data Utama
  const [siswaList, setSiswaList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [dudiList, setDudiList] = useState([]);

  // State Daftar Jadwal Monitoring
  const [jadwalList, setJadwalList] = useState([]);

  // State Form Input Jadwal Monitoring oleh Admin
  const [formDataJadwal, setFormDataJadwal] = useState({
    guru: '',
    dudi: '',
    siswa: '',
    tanggal: '',
    jam: '',
    keterangan: ''
  });

  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [statusPendaftaran, setStatusPendaftaran] = useState('Dibuka');

  // AMBIL SEMUA DATA DARI DATABASE MYSQL SAAT HALAMAN DIBUKA / DI-REFRESH
  useEffect(() => {
    fetchSiswa();
    fetchGuru();
    fetchDudi();
    fetchJadwal();
  }, []);

  const fetchSiswa = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/siswa`);
      if (response.data.success) {
        setSiswaList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setSiswaList(response.data);
      }
    } catch (error) {
      console.error('Gagal memuat data siswa:', error);
    }
  };

  const fetchGuru = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/guru`);
      if (response.data.success) {
        setGuruList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setGuruList(response.data);
      }
    } catch (error) {
      console.error('Gagal memuat data guru:', error);
    }
  };

  const fetchDudi = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dudi`);
      if (response.data.success) {
        setDudiList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setDudiList(response.data);
      }
    } catch (error) {
      console.error('Gagal memuat data DUDI:', error);
    }
  };

  const fetchJadwal = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jadwal-monitoring`);
      if (response.data.success) {
        const formattedData = response.data.data.map(item => ({
          id: item.id,
          guru: item.guru_pembimbing,
          dudi: item.perusahaan,
          siswa: item.siswa,
          tanggal: item.jadwal ? item.jadwal.split(' ')[0] : '',
          jam: item.jadwal ? item.jadwal.split(' ')[1] : '',
          keterangan: item.keterangan
        }));
        setJadwalList(formattedData);
      }
    } catch (error) {
      console.error('Gagal memuat jadwal monitoring:', error);
    }
  };

  // IMPORT & HAPUS SISWA
  const handleImportSiswa = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/siswa/import`, { data });
        if (response.data.success) {
          alert('Data Siswa berhasil disimpan ke Database MySQL!');
          fetchSiswa();
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        alert('Gagal mengimpor data siswa: ' + errMsg);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteSiswa = async (id) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/siswa/${id}`);
        if (response.data.success) {
          alert('Data siswa berhasil dihapus!');
          fetchSiswa();
        }
      } catch (error) {
        alert('Gagal menghapus data siswa.');
      }
    }
  };

  // IMPORT & HAPUS GURU
  const handleImportGuru = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/guru/import`, { data });
        if (response.data.success) {
          alert('Data Guru Pembimbing berhasil disimpan ke Database MySQL!');
          fetchGuru();
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        alert('Gagal mengimpor data guru: ' + errMsg);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteGuru = async (id) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/guru/${id}`);
        if (response.data.success) {
          alert('Data guru berhasil dihapus!');
          fetchGuru();
        }
      } catch (error) {
        alert('Gagal menghapus data guru.');
      }
    }
  };

  // IMPORT & HAPUS DUDI
  const handleImportDudi = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/dudi/import`, { data });
        if (response.data.success) {
          alert('Data Mitra DUDI berhasil disimpan ke Database MySQL!');
          fetchDudi();
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        alert('Gagal mengimpor data DUDI: ' + errMsg);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteDudi = async (id) => {
    if (confirm('Yakin ingin menghapus data DUDI ini?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/dudi/${id}`);
        if (response.data.success) {
          alert('Data DUDI berhasil dihapus!');
          fetchDudi();
        }
      } catch (error) {
        alert('Gagal menghapus data DUDI.');
      }
    }
  };

  // SIMPAN JADWAL MONITORING KE DATABASE
  const handleTambahJadwal = async (e) => {
    e.preventDefault();
    if (!formDataJadwal.guru || !formDataJadwal.dudi || !formDataJadwal.siswa || !formDataJadwal.tanggal) {
      alert('Mohon isi nama guru, DUDI, siswa, dan tanggal!');
      return;
    }

    try {
      const payload = {
        guru_pembimbing: formDataJadwal.guru,
        perusahaan: formDataJadwal.dudi,
        alamat: 'Jl. Mitra DUDI',
        siswa: formDataJadwal.siswa,
        tanggal: formDataJadwal.tanggal,
        jam: formDataJadwal.jam || '08:00',
        keterangan: formDataJadwal.keterangan
      };

      const response = await axios.post(`${API_BASE_URL}/api/jadwal-monitoring`, payload);
      if (response.data.success) {
        alert('Jadwal monitoring berhasil disimpan ke Database!');
        setFormDataJadwal({ guru: '', dudi: '', siswa: '', tanggal: '', jam: '', keterangan: '' });
        fetchJadwal();
      }
    } catch (error) {
      console.error('Gagal menyimpan jadwal:', error);
      alert('Gagal menyimpan jadwal ke database.');
    }
  };

  const handleHapusJadwal = async (id) => {
    if (confirm('Yakin ingin menghapus jadwal ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/jadwal-monitoring/${id}`);
        alert('Jadwal berhasil dihapus!');
        fetchJadwal();
      } catch (error) {
        setJadwalList(jadwalList.filter(item => item.id !== id));
      }
    }
  };

  const handleSimpanPengaturan = (e) => {
    e.preventDefault();
    alert('Pengaturan sistem berhasil disimpan!');
  };

  const menuItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'siswa', label: 'Data Siswa PKL', icon: Users },
    { id: 'guru', label: 'Guru Pembimbing', icon: GraduationCap },
    { id: 'dudi', label: 'Mitra DUDI', icon: Building2 },
    { id: 'jadwal', label: 'Jadwal Monitoring', icon: CalendarDays },
    { id: 'pengaturan', label: 'Data Master / Pengaturan', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0b0f17] border-r border-slate-800/60 flex flex-col justify-between p-4
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="flex items-center justify-between px-3 py-4 mb-6 border-b border-slate-800/60">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wider text-white">PANEL ADMIN</h1>
                <p className="text-xs text-slate-400">SIMON PKL</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800/60">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/15 transition-all">
            <LogOut size={18} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0b0f17]/50">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-800/60 bg-[#0b0f17]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden bg-slate-800/80 p-2 rounded-xl text-slate-300 hover:text-white">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base md:text-xl font-bold text-white tracking-wide">
                {activeTab === 'ringkasan' && 'Dashboard Administrasi'}
                {activeTab === 'siswa' && 'Manajemen Siswa PKL'}
                {activeTab === 'guru' && 'Data Guru Pembimbing'}
                {activeTab === 'dudi' && 'Mitra DUDI & Industri'}
                {activeTab === 'jadwal' && 'Jadwal Monitoring Guru'}
                {activeTab === 'pengaturan' && 'Data Master & Pengaturan'}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3 bg-[#131b2e] px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-800">
            <span className="text-xs md:text-sm font-medium text-slate-200 truncate max-w-25 sm:max-w-none">
              {user?.name || 'Administrator'}
            </span>
            <span className="bg-blue-600 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-md uppercase tracking-wider">
              {user?.role || 'ADM'}
            </span>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">TOTAL SISWA PKL</p>
                  <h3 className="text-3xl font-extrabold text-white">{siswaList.length}</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">MITRA DUDI AKTIF</p>
                  <h3 className="text-3xl font-extrabold text-white">{dudiList.length}</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">GURU PEMBIMBING</p>
                  <h3 className="text-3xl font-extrabold text-white">{guruList.length}</h3>
                </div>
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">JADWAL MONITORING</p>
                  <h3 className="text-3xl font-extrabold text-amber-400">{jadwalList.length} Agenda</h3>
                </div>
              </div>
            </div>
          )}

          {/* TAB SISWA PKL */}
          {activeTab === 'siswa' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Data Penempatan Siswa PKL (Database MySQL)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Kelola data siswa dan perusahaan tempat PKL.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 flex-1 sm:flex-none">
                    <Upload size={14} />
                    <span>Import Excel ke DB</span>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportSiswa} className="hidden" />
                  </label>
                  <button onClick={() => alert('Fitur Ploting Siswa')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 flex-1 sm:flex-none">
                    <UserPlus size={14} />
                    <span>Ploting Siswa</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 min-w-175">
                  <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">NAMA SISWA</th>
                      <th className="px-4 py-3.5">NISN</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Kelas</th>
                      <th className="px-4 py-3.5">TEMPAT PKL (DUDI)</th>
                      <th className="px-4 py-3.5">PEMBIMBING DUDI</th>
                      <th className="px-4 py-3.5">GURU PEMBIMBING</th>
                      <th className="px-4 py-3.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {siswaList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-500 italic">
                          Belum ada data di database. Silakan klik <span className="text-blue-400 font-medium">Import Excel ke DB</span> di atas.
                        </td>
                      </tr>
                    ) : (
                      siswaList.map((siswa) => (
                        <tr key={siswa.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium text-white">{siswa.name || siswa.nama_siswa || '-'}</td>
                          <td className="px-4 py-3">{siswa.nisn || '-'}</td>
                          <td className="px-4 py-3">{siswa.email || '-'}</td>
                          <td className="px-4 py-3">{siswa.kelas || '-'}</td>
                          <td className="px-4 py-3 font-medium text-indigo-400">{siswa.company || siswa.tempat_pkl || '-'}</td>
                          <td className="px-4 py-3">{siswa.pembimbing_dudi || '-'}</td>
                          <td className="px-4 py-3">{siswa.guru_pembimbing || '-'}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteSiswa(siswa.id)} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB GURU PEMBIMBING */}
          {activeTab === 'guru' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Data Guru Pembimbing & Penempatan PT</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Kelola daftar guru dan perusahaan tempat mereka membimbing.</p>
                </div>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30">
                  <Upload size={14} />
                  <span>Import Excel Guru</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportGuru} className="hidden" />
                </label>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 min-w-150">
                  <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">NAMA GURU</th>
                      <th className="px-4 py-3.5">EMAIL</th>
                      <th className="px-4 py-3.5">PERUSAHAAN / DUDI BIMBINGAN</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guruList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-500 italic">
                          Belum ada data guru di database. Silakan klik <span className="text-blue-400 font-medium">Import Excel Guru</span>.
                        </td>
                      </tr>
                    ) : (
                      guruList.map((guru) => (
                        <tr key={guru.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium text-white">{guru.name || guru.nama_guru || '-'}</td>
                          <td className="px-4 py-3">{guru.email || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                              {guru.company || guru.perusahaan_dudi || 'Belum Ditentukan'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                              {guru.status || 'Aktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex space-x-2">
                            <button className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">Edit</button>
                            <button onClick={() => handleDeleteGuru(guru.id)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB MITRA DUDI */}
          {activeTab === 'dudi' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Mitra DUDI & Perusahaan</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Kelola daftar perusahaan tempat siswa melaksanakan PKL.</p>
                </div>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30">
                  <Upload size={14} />
                  <span>Import Excel DUDI</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportDudi} className="hidden" />
                </label>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 min-w-125">
                  <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">NAMA PERUSAHAAN / DUDI</th>
                      <th className="px-4 py-3.5">BIDANG USAHA</th>
                      <th className="px-4 py-3.5">ALAMAT</th>
                      <th className="px-4 py-3.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dudiList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-slate-500 italic">
                          Belum ada data DUDI. Silakan klik <span className="text-blue-400 font-medium">Import Excel DUDI</span>.
                        </td>
                      </tr>
                    ) : (
                      dudiList.map((dudi) => (
                        <tr key={dudi.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium text-white">{dudi.company || dudi.name || dudi.nama_dudi || '-'}</td>
                          <td className="px-4 py-3">{dudi.bidang_usaha || '-'}</td>
                          <td className="px-4 py-3">{dudi.alamat || '-'}</td>
                          <td className="px-4 py-3 flex space-x-2">
                            <button className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">Edit</button>
                            <button onClick={() => handleDeleteDudi(dudi.id)} className="bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">Hapus</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB JADWAL MONITORING */}
          {activeTab === 'jadwal' && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Tambah Jadwal Monitoring Baru</h3>
                <form onSubmit={handleTambahJadwal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Guru Pembimbing</label>
                    <input
                      type="text"
                      placeholder="Contoh: Hj Eli"
                      value={formDataJadwal.guru}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, guru: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Perusahaan / DUDI</label>
                    <input
                      type="text"
                      placeholder="Contoh: PT. Solusi Tunas Pratama"
                      value={formDataJadwal.dudi}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, dudi: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Siswa</label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad Fauzi"
                      value={formDataJadwal.siswa}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, siswa: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tanggal</label>
                    <input
                      type="date"
                      value={formDataJadwal.tanggal}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, tanggal: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Jam</label>
                    <input
                      type="time"
                      value={formDataJadwal.jam}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, jam: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Keterangan / Agenda</label>
                    <input
                      type="text"
                      placeholder="Contoh: Monitoring Bulan Pertama"
                      value={formDataJadwal.keterangan}
                      onChange={(e) => setFormDataJadwal({ ...formDataJadwal, keterangan: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2">
                      <Plus size={16} />
                      <span>Simpan Jadwal</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Daftar Jadwal Monitoring</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300 min-w-175">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">GURU PEMBIMBING</th>
                        <th className="px-4 py-3.5">PERUSAHAAN / DUDI</th>
                        <th className="px-4 py-3.5">SISWA BIMBINGAN</th>
                        <th className="px-4 py-3.5">TANGGAL & WAKTU</th>
                        <th className="px-4 py-3.5">KETERANGAN</th>
                        <th className="px-4 py-3.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {jadwalList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                            Belum ada jadwal monitoring.
                          </td>
                        </tr>
                      ) : (
                        jadwalList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium text-white">{item.guru}</td>
                            <td className="px-4 py-3 text-indigo-400 font-medium">{item.dudi}</td>
                            <td className="px-4 py-3 text-slate-200">{item.siswa}</td>
                            <td className="px-4 py-3">{item.tanggal} {item.jam && `(${item.jam})`}</td>
                            <td className="px-4 py-3">{item.keterangan || '-'}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => handleHapusJadwal(item.id)} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all">
                                Hapus
                              </button>
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

          {/* TAB PENGATURAN */}
          {activeTab === 'pengaturan' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-4">Pengaturan Sistem SIMON PKL</h3>
              <form onSubmit={handleSimpanPengaturan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Tahun Ajaran Aktif</label>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status Pendaftaran PKL</label>
                  <select
                    value={statusPendaftaran}
                    onChange={(e) => setStatusPendaftaran(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Dibuka">Dibuka</option>
                    <option value="Ditutup">Ditutup</option>
                  </select>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30">
                  Simpan Pengaturan
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}