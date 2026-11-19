import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Star,
  LogOut,
  Building2,
  CheckCircle2,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

export default function DashboardDudi({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State Data
  const [siswaList, setSiswaList] = useState([]);
  const [jurnalList, setJurnalList] = useState([]);
  const [presensiList, setPresensiList] = useState([]);
  
  // State Modal Foto (Digunakan untuk Presensi & Jurnal)
  const [selectedFoto, setSelectedFoto] = useState(null);
  
  // Form Penilaian
  const [nilaiForm, setNilaiForm] = useState({
    siswa_id: '',
    kedisiplinan: '',
    keterampilan: '',
    sikap: '',
    catatan: ''
  });

  // URL Backend Cloudflare Tunnel Anda
  const API_BASE_URL = 'https://observer-aurora-powerseller-concerns.trycloudflare.com';

  useEffect(() => {
    fetchSiswaBinaan();
    fetchJurnalDudi();
    fetchPresensiDudi();
  }, []);

  // Helper untuk mengambil token auth
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchSiswaBinaan = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dudi/siswa`, {
        params: { company: user?.company || user?.name },
        ...getAuthHeader()
      });
      if (response.data.success) {
        setSiswaList(response.data.data);
      } else if (Array.isArray(response.data)) {
        setSiswaList(response.data);
      }
    } catch (error) {
      console.error('Gagal memuat siswa binaan:', error);
    }
  };

  const fetchJurnalDudi = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dudi/jurnal`, getAuthHeader());
      if (response.data.success) {
        setJurnalList(response.data.data);
      }
    } catch (error) {
      console.error('Gagal memuat jurnal:', error);
    }
  };

  const fetchPresensiDudi = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dudi/presensi`, getAuthHeader());
      if (response.data.success) {
        setPresensiList(response.data.data);
      }
    } catch (error) {
      console.error('Gagal memuat presensi:', error);
    }
  };

  const handleApproveJurnal = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/api/dudi/journals/${id}/approve`, {}, getAuthHeader());
      alert('Jurnal berhasil disetujui (Approved)!');
      fetchJurnalDudi();
    } catch (error) {
      alert('Gagal menyetujui jurnal.');
    }
  };

  const handleRevisiJurnal = async (id) => {
    const catatanRevisi = prompt('Masukkan catatan atau instruksi revisi untuk siswa:');
    if (!catatanRevisi) return;
    try {
      await axios.post(`${API_BASE_URL}/api/dudi/journals/${id}/revise`, { catatan: catatanRevisi }, getAuthHeader());
      alert('Permintaan revisi berhasil dikirim ke siswa!');
      fetchJurnalDudi();
    } catch (error) {
      alert('Gagal mengirim revisi.');
    }
  };

  const handleSimpanNilai = async (e) => {
    e.preventDefault();
    if (!nilaiForm.siswa_id) {
      alert('Mohon masukkan ID atau pilih siswa.');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/dudi/penilaian`, nilaiForm, getAuthHeader());
      if (response.data.success) {
        alert('Penilaian Akhir Siswa berhasil disimpan & dikirim!');
        setNilaiForm({ siswa_id: '', kedisiplinan: '', keterampilan: '', sikap: '', catatan: '' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert('Gagal menyimpan penilaian: ' + errorMsg);
    }
  };

  // Helper terpusat untuk format URL foto agar aman
  const getPhotoUrl = (fotoPath) => {
    if (!fotoPath) return null;
    const path = String(fotoPath).trim();
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const menuItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'jurnal', label: 'Persetujuan Jurnal', icon: FileText },
    { id: 'presensi', label: 'Presensi Siswa', icon: CalendarCheck },
    { id: 'penilaian', label: 'Penilaian PKL', icon: Star },
  ];

  const pendingJurnalCount = jurnalList.filter(j => {
    const s = (j.status || '').toLowerCase();
    return s === 'pending' || s === 'menunggu';
  }).length;

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden relative">
      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR RESPONSIVE DRAWER */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0b0f17] border-r border-slate-800/60 flex flex-col justify-between p-4
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="flex items-center justify-between px-3 py-4 mb-6 border-b border-slate-800/60">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-[10px] font-bold tracking-wider text-slate-400">PEMBIMBING DUDI</h1>
                <p className="text-sm font-extrabold text-white">SIMON PKL</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
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
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0b0f17]/50 w-full">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-800/60 bg-[#0b0f17]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden bg-slate-800/80 p-2 rounded-xl text-slate-300 hover:text-white border border-slate-700"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base md:text-xl font-bold text-white tracking-wide">
                {activeTab === 'ringkasan' && 'Panel Pembimbing Lapangan (DUDI)'}
                {activeTab === 'jurnal' && 'Persetujuan Jurnal Harian'}
                {activeTab === 'presensi' && 'Presensi & Kehadiran Siswa'}
                {activeTab === 'penilaian' && 'Penilaian Akhir Siswa PKL'}
              </h2>
              <p className="text-[11px] md:text-xs text-slate-400 mt-0.5 truncate max-w-52 sm:max-w-md">
                {activeTab === 'ringkasan' && (user?.company || 'PT. Solusi Tunas Pratama Tbk')}
                {activeTab === 'jurnal' && 'Validasi aktivitas harian siswa bimbingan'}
                {activeTab === 'presensi' && 'Monitoring absensi harian siswa PKL'}
                {activeTab === 'penilaian' && 'Evaluasi kompetensi dan kedisiplinan siswa'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-[#131b2e] px-3 md:px-4 py-2 rounded-full border border-slate-800">
            <span className="text-xs md:text-sm font-medium text-slate-200">{user?.name || 'Budi'}</span>
            <span className="bg-blue-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">DUDI</span>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* TAB: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#111827] border border-blue-500/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">SISWA BIMBINGAN</p>
                  <h3 className="text-3xl font-extrabold text-white">{siswaList.length} Siswa</h3>
                </div>
                <div className="bg-[#111827] border border-amber-500/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">JURNAL BUTUH PERSETUJUAN</p>
                  <h3 className="text-3xl font-extrabold text-amber-400">{pendingJurnalCount} Jurnal</h3>
                </div>
                <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">HADIR HARI INI</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400">{presensiList.length} Siswa</h3>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">Selamat Datang, {user?.name || 'Budi'}!</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Silakan pilih menu di sebelah kiri untuk mengelola persetujuan jurnal harian, memantau absensi siswa, atau memberikan penilaian PKL untuk siswa di {user?.company || 'PT. Solusi Tunas Pratama Tbk'}.
                </p>
              </div>
            </div>
          )}

          {/* TAB: PERSETUJUAN JURNAL */}
          {activeTab === 'jurnal' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Validasi Jurnal Harian Siswa</h3>
              <p className="text-xs text-slate-400 mb-6">Periksa dan setujui atau minta revisi laporan aktivitas harian siswa PKL.</p>
              
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 min-w-full">
                  <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">NAMA SISWA</th>
                      <th className="px-4 py-3.5">TANGGAL</th>
                      <th className="px-4 py-3.5">KEGIATAN / AKTIVITAS</th>
                      <th className="px-4 py-3.5">FOTO BUKTI</th>
                      <th className="px-4 py-3.5">STATUS</th>
                      <th className="px-4 py-3.5 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {jurnalList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                          Belum ada data jurnal yang perlu divalidasi.
                        </td>
                      </tr>
                    ) : (
                      jurnalList.map((jurnal) => {
                        const statusLower = (jurnal.status || 'Pending').toLowerCase();
                        const isPending = statusLower === 'pending' || statusLower === 'menunggu';
                        const isDirevisi = statusLower === 'direvisi';

                        return (
                          <tr key={jurnal.id} className="hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium text-white">{jurnal.nama_siswa || 'Siswa PKL'}</td>
                            <td className="px-4 py-3">{jurnal.tanggal}</td>
                            <td className="px-4 py-3 max-w-xs truncate">{jurnal.kegiatan}</td>
                            
                            <td className="px-4 py-3">
                              {jurnal.foto ? (
                                <button
                                  onClick={() => setSelectedFoto(getPhotoUrl(jurnal.foto))}
                                  className="text-blue-400 hover:underline font-semibold text-xs cursor-pointer"
                                >
                                  Lihat Foto
                                </button>
                              ) : (
                                <span className="text-slate-500 italic text-xs">Tidak ada</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                                jurnal.status === 'Disetujui' || jurnal.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                isDirevisi ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {jurnal.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isPending ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <button 
                                    onClick={() => handleApproveJurnal(jurnal.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1 shadow-md shadow-emerald-600/20"
                                  >
                                    <CheckCircle2 size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button 
                                    onClick={() => handleRevisiJurnal(jurnal.id)}
                                    className="bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-rose-500/30 inline-flex items-center space-x-1"
                                  >
                                    <AlertCircle size={14} />
                                    <span>Revisi</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs italic font-medium">Sudah Diproses</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PRESENSI SISWA */}
          {activeTab === 'presensi' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-1">Presensi & Kehadiran Siswa</h3>
              <p className="text-xs text-slate-400 mb-6">Monitoring daftar kehadiran harian siswa PKL di perusahaan.</p>
              
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300 min-w-full">
                  <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">NAMA SISWA</th>
                      <th className="px-4 py-3.5">TANGGAL</th>
                      <th className="px-4 py-3.5">JAM MASUK</th>
                      <th className="px-4 py-3.5">STATUS KEHADIRAN</th>
                      <th className="px-4 py-3.5">FOTO BUKTI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {presensiList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-500 italic">
                          Belum ada data presensi siswa hari ini.
                        </td>
                      </tr>
                    ) : (
                      presensiList.map((presensi) => (
                        <tr key={presensi.id} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-medium text-white">{presensi.nama_siswa || presensi.nisn}</td>
                          <td className="px-4 py-3">{presensi.tanggal}</td>
                          <td className="px-4 py-3">{presensi.jam_masuk || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                              {presensi.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {presensi.foto ? (
                              <button
                                onClick={() => setSelectedFoto(getPhotoUrl(presensi.foto))}
                                className="text-blue-400 hover:underline font-semibold text-xs cursor-pointer"
                              >
                                Lihat Foto
                              </button>
                            ) : (
                              <span className="text-slate-500 italic text-xs">Tidak ada foto</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PENILAIAN PKL */}
          {activeTab === 'penilaian' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 shadow-xl max-w-3xl">
              <h3 className="text-lg font-bold text-white mb-1">Penilaian Akhir Siswa PKL</h3>
              <p className="text-xs text-slate-400 mb-6">Form pengisian evaluasi kinerja, keterampilan, dan kedisiplinan siswa.</p>
              
              <form onSubmit={handleSimpanNilai} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Pilih / Masukkan Siswa Bimbingan</label>
                  <select
                    value={nilaiForm.siswa_id}
                    onChange={(e) => setNilaiForm({ ...nilaiForm, siswa_id: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Siswa Bimbingan --</option>
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.nisn || 'NISN: -'}) - {s.kelas || '-'}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Kedisiplinan (1-100)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      placeholder="85"
                      value={nilaiForm.kedisiplinan}
                      onChange={(e) => setNilaiForm({ ...nilaiForm, kedisiplinan: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Keterampilan Teknis (1-100)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      placeholder="90"
                      value={nilaiForm.keterampilan}
                      onChange={(e) => setNilaiForm({ ...nilaiForm, keterampilan: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Sikap / Kerja Sama (1-100)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      placeholder="88"
                      value={nilaiForm.sikap}
                      onChange={(e) => setNilaiForm({ ...nilaiForm, sikap: e.target.value })}
                      className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Catatan & Evaluasi Pembimbing</label>
                  <textarea
                    rows="3"
                    placeholder="Kinerja sangat baik dan cepat memahami instruksi teknis."
                    value={nilaiForm.catatan}
                    onChange={(e) => setNilaiForm({ ...nilaiForm, catatan: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2">
                  <Star size={16} />
                  <span>Simpan & Kirim Nilai</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* MODAL POPUP PREVIEW FOTO */}
      {selectedFoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-2.5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Bukti Foto Kegiatan / Kehadiran</h4>
              <button 
                onClick={() => setSelectedFoto(null)} 
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Tutup
              </button>
            </div>
            <div className="text-center pt-2">
              <img 
                src={selectedFoto} 
                alt="Bukti Foto" 
                className="w-full h-64 object-cover rounded-xl border border-slate-700 shadow-md" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}