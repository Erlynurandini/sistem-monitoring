import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  BookOpen,
  MapPin,
  User,
  LogOut,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Camera,
  Navigation,
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function StudentDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State untuk menyimpan data user terbaru dari database (mengatasi cache session lama)
  const [currentUser, setCurrentUser] = useState(user);

  // State Jurnal
  const [jurnalList, setJurnalList] = useState([]);
  const [formJurnal, setFormJurnal] = useState({ tanggal: '', kegiatan: '', foto: null });
  const [jurnalSubmitted, setJurnalSubmitted] = useState(false);
  const [pesanJurnal, setPesanJurnal] = useState('');

  // State Edit Jurnal (Revisi)
  const [editJurnalId, setEditJurnalId] = useState(null);
  const [formEdit, setFormEdit] = useState({ tanggal: '', kegiatan: '', foto: null });
  const [selectedFotoJurnal, setSelectedFotoJurnal] = useState(null);

  // State Presensi
  const [statusKehadiran, setStatusKehadiran] = useState('hadir');
  const [lokasiGPS, setLokasiGPS] = useState(null);
  const [keteranganIzin, setKeteranganIzin] = useState('');
  const [fileSuratSakit, setFileSuratSakit] = useState(null);
  const [sudahPresensi, setSudahPresensi] = useState(false);
  const [pesanPresensi, setPesanPresensi] = useState('');

  // State Kamera Presensi
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [fotoKehadiran, setFotoKehadiran] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // URL Backend Cloudflare Tunnel Aktif
  const API_BASE_URL = 'https://observer-aurora-powerseller-concerns.trycloudflare.com';

  // Tarik data terbaru dari database saat komponen dimuat
  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE_URL}/api/siswa`)
        .then(res => {
          if (res.data.success) {
            const latestUser = res.data.data.find(s => s.email === user.email);
            if (latestUser) {
              setCurrentUser(latestUser);
            }
          }
        })
        .catch(err => console.error('Gagal memperbarui data user:', err));
    }
  }, [user]);

  // Data dinamis murni dari database MySQL (currentUser)
  const namaSiswa = currentUser?.name || currentUser?.nama_siswa || 'Siswa';
  const nisnUser = currentUser?.nisn || '';
  const kelasSiswa = currentUser?.kelas || '-';
  const tempatPkl = currentUser?.company || currentUser?.tempat_pkl || 'Belum Ada Perusahaan';
  const emailSiswa = currentUser?.email || '-';
  const guruPembimbing = currentUser?.guru_pembimbing || '-';
  const pembimbingDudi = currentUser?.pembimbing_dudi || '-';

  useEffect(() => {
    if (nisnUser || currentUser?.id) {
      fetchJurnal();
      fetchPresensi(); // <-- Otomatis cek presensi hari ini saat load
    }
  }, [nisnUser, currentUser]);

  const fetchJurnal = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jurnal`, {
        params: { nisn: nisnUser }
      });
      if (response.data.success) {
        setJurnalList(response.data.data);

        const today = new Date().toISOString().split('T')[0];
        const alreadyToday = response.data.data.some(j => j.tanggal === today);
        if (alreadyToday) {
          setJurnalSubmitted(true);
          setPesanJurnal('Anda sudah mengisi jurnal hari ini! (Maksimal 1 kali sehari)');
        }
      }
    } catch (error) {
      console.error('Gagal memuat jurnal:', error);
    }
  };

  // --- FUNGSI CEK PRESENSI HARI INI ---
  const fetchPresensi = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/presensi`, {
        params: { nisn: nisnUser }
      });
      if (response.data.success) {
        const today = new Date().toISOString().split('T')[0];
        const alreadyToday = response.data.data.some(p => p.tanggal === today);
        if (alreadyToday) {
          setSudahPresensi(true);
          setPesanPresensi('Anda sudah melakukan presensi hari ini!');
        }
      }
    } catch (error) {
      console.error('Gagal memuat presensi:', error);
    }
  };

  // --- FUNGSI KAMERA PRESENSI ---
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Gagal mengaktifkan kamera. Pastikan izin kamera diizinkan (allow) di browser!');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setFotoKehadiran(imageDataUrl);

      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  const retakePhoto = () => {
    setFotoKehadiran(null);
    startCamera();
  };

  // --- HANDLE FILE FOTO JURNAL (Base64) ---
  const handleFileJurnal = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setFormEdit({ ...formEdit, foto: reader.result });
        } else {
          setFormJurnal({ ...formJurnal, foto: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- TAMBAH JURNAL ---
  const handleTambahJurnal = async (e) => {
    e.preventDefault();
    if (!formJurnal.tanggal || !formJurnal.kegiatan) {
      alert('Mohon isi tanggal dan uraian kegiatan!');
      return;
    }

    if (!formJurnal.foto) {
      alert('Wajib isi bukti pengerjaan');
      return;
    }

    try {
      const payload = {
        nisn: nisnUser,
        tanggal: formJurnal.tanggal,
        kegiatan: formJurnal.kegiatan,
        foto: formJurnal.foto
      };

      const response = await axios.post(`${API_BASE_URL}/api/jurnal`, payload);
      if (response.data.success) {
        alert('Jurnal harian berhasil dikirim!');
        setFormJurnal({ tanggal: '', kegiatan: '', foto: null });
        setJurnalSubmitted(true);
        setPesanJurnal('Anda sudah mengisi jurnal pada tanggal tersebut!');
        fetchJurnal();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const backendMessage = error.response.data.message || 'Anda sudah mengisi jurnal pada tanggal tersebut!';
        alert(backendMessage);
        setJurnalSubmitted(true);
        setPesanJurnal(backendMessage);
      } else {
        alert('Gagal menyimpan jurnal.');
      }
    }
  };

  const handleDeleteJurnal = async (id) => {
    if (confirm('Yakin ingin menghapus catatan jurnal ini?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/jurnal/${id}`);
        setJurnalSubmitted(false);
        fetchJurnal();
      } catch (error) {
        alert('Gagal menghapus jurnal.');
      }
    }
  };

  const handleMulaiEdit = (j) => {
    setEditJurnalId(j.id);
    setFormEdit({ tanggal: j.tanggal, kegiatan: j.kegiatan, foto: j.foto });
  };

  const handleSimpanEdit = async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/jurnal/${id}`, {
        tanggal: formEdit.tanggal,
        kegiatan: formEdit.kegiatan,
        foto: formEdit.foto,
        status: 'Pending'
      });
      if (response.data.success) {
        alert('Jurnal revisi berhasil diperbarui dan dikirim ulang!');
        setEditJurnalId(null);
        fetchJurnal();
      }
    } catch (error) {
      alert('Gagal memperbarui jurnal.');
    }
  };

  const handleDeteksiLokasi = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLokasiGPS(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          alert('Lokasi GPS berhasil terdeteksi!');
        },
        () => {
          alert('Gagal mendeteksi lokasi. Pastikan GPS aktif.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser Anda.');
    }
  };

  // --- KIRIM PRESENSI ---
  const handleKirimPresensi = async (e) => {
    e.preventDefault();
    if (statusKehadiran === 'hadir') {
      if (!lokasiGPS) {
        alert('Mohon deteksi lokasi GPS terlebih dahulu!');
        return;
      }
      if (!fotoKehadiran) {
        alert('Mohon ambil foto kehadiran via kamera terlebih dahulu!');
        return;
      }
    }
    if (statusKehadiran === 'sakit' && !fileSuratSakit) {
      alert('Mohon unggah surat keterangan sakit!');
      return;
    }
    if (statusKehadiran === 'izin' && !keteranganIzin.trim()) {
      alert('Mohon tuliskan alasan/keterangan izin!');
      return;
    }

    try {
      const payload = {
        nisn: nisnUser,
        tanggal: new Date().toISOString().split('T')[0],
        status: statusKehadiran,
        lokasi_gps: lokasiGPS || null,
        keterangan: keteranganIzin || null,
        foto: fotoKehadiran || null
      };

      const response = await axios.post(`${API_BASE_URL}/api/presensi`, payload);

      if (response.data.success) {
        setSudahPresensi(true);
        alert(`Presensi status "${statusKehadiran.toUpperCase()}" berhasil disimpan!`);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setSudahPresensi(true);
        setPesanPresensi(error.response.data.message || 'Anda sudah melakukan presensi hari ini!');
      } else {
        alert('Gagal mengirim presensi.');
        console.error(error);
      }
    }
  };

  const renderStatusBadge = (jurnal) => {
    const status = (jurnal.status || '').toLowerCase();
    if (status.includes('approved') || status.includes('disetujui')) {
      return (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center w-max space-x-1">
          <CheckCircle size={12} /><span>Disetujui (Approved)</span>
        </span>
      );
    } else if (status.includes('revisi') || status.includes('direvisi')) {
      return (
        <div className="space-y-1.5 py-1">
          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center w-max space-x-1">
            <AlertCircle size={12} /><span>Revisi</span>
          </span>

          {jurnal.catatan_dudi && (
            <p className="text-[11px] text-rose-300 italic bg-rose-500/5 border border-rose-500/20 p-2 rounded-lg max-w-xs">
              <strong className="font-bold">Catatan DUDI:</strong> &ldquo;{jurnal.catatan_dudi}&rdquo;
            </p>
          )}
        </div>
      );
    } else {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-semibold flex items-center w-max space-x-1">
          <Clock size={12} /><span>Pending (Menunggu Review)</span>
        </span>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden relative">
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-[#0b0f17] border-r border-slate-800/60 flex-col justify-between p-4 hidden md:flex">
        <div>
          <div className="flex items-center space-x-3 px-3 py-4 mb-4 border-b border-slate-800/60">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white">SIMON-PKL</h1>
              <p className="text-[11px] text-slate-400">Sistem Presensi & Jurnal</p>
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-3 mb-6 flex items-center space-x-3 shadow-md">
            <div className="w-10 h-10 bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center justify-center font-bold text-sm">
              {namaSiswa.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white truncate">{namaSiswa}</h4>
              <p className="text-[10px] text-slate-400 truncate">{kelasSiswa}</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('beranda')} className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'beranda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <LayoutDashboard size={16} /><span>Beranda (Home)</span>
            </button>
            <button onClick={() => setActiveTab('jurnal')} className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'jurnal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <BookOpen size={16} /><span>Jurnal Kegiatan</span>
            </button>
            <button onClick={() => setActiveTab('presensi')} className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'presensi' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <MapPin size={16} /><span>Presensi GPS & Foto</span>
            </button>
            <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all ${activeTab === 'profil' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
              <User size={16} /><span>Profil Saya</span>
            </button>
          </nav>
        </div>

        <div className="space-y-3">
          <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={16} /><span>Keluar (Logout)</span>
          </button>
          <div className="pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
            <p className="font-semibold text-slate-400">TEMPAT PKL:</p>
            <p className="truncate mt-0.5">{tempatPkl}</p>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-between p-6 md:hidden animate-fadeIn">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">SIMON-PKL</h1>
                  <p className="text-[10px] text-slate-400">Menu Navigasi</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-800 text-slate-300 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3 mb-6 flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-600/30 text-cyan-400 rounded-xl flex items-center justify-center font-bold text-sm">
                {namaSiswa.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{namaSiswa}</h4>
                <p className="text-[10px] text-slate-400">{kelasSiswa}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => { setActiveTab('beranda'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'beranda' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <LayoutDashboard size={18} /><span>Beranda (Home)</span>
              </button>
              <button onClick={() => { setActiveTab('jurnal'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'jurnal' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <BookOpen size={18} /><span>Jurnal Kegiatan</span>
              </button>
              <button onClick={() => { setActiveTab('presensi'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'presensi' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <MapPin size={18} /><span>Presensi GPS & Foto</span>
              </button>
              <button onClick={() => { setActiveTab('profil'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-medium ${activeTab === 'profil' ? 'bg-blue-600 text-white' : 'text-slate-300 bg-[#111827]'}`}>
                <User size={18} /><span>Profil Saya</span>
              </button>
            </nav>
          </div>

          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20">
            <LogOut size={16} /><span>Keluar (Logout)</span>
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0b0f17]/40 pb-20 md:pb-0">
        <header className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-slate-800/60 bg-[#0b0f17]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 bg-[#111827] border border-slate-800 text-slate-200 rounded-xl">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-cyan-500">SIMON-PKL PORTAL</p>
              <h2 className="text-sm md:text-lg font-extrabold text-white tracking-wide">
                {activeTab === 'beranda' && 'Beranda Utama'}
                {activeTab === 'jurnal' && 'Jurnal Kegiatan Harian'}
                {activeTab === 'presensi' && 'Presensi Kehadiran GPS'}
                {activeTab === 'profil' && 'Profil Siswa PKL'}
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-300">Jum, 13 Nov 2026</p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center justify-end space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Mode Online</span>
              </p>
            </div>
            <button onClick={onLogout} className="hidden md:flex bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-all items-center space-x-1.5">
              <LogOut size={14} /><span>Keluar</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6">
          {activeTab === 'beranda' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl flex items-center justify-center font-extrabold text-lg shrink-0">
                    {namaSiswa.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-white">Halo, {namaSiswa}</h3>
                    <p className="text-[11px] md:text-xs text-slate-400">NISN: {nisnUser} &bull; {tempatPkl}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400">Status PKL Hari Ini</h4>
                  <span className="text-[10px] text-slate-500">Pembaruan Realtime</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-slate-400">Status Kehadiran</p>
                      <p className={`text-xs font-bold mt-1 ${sudahPresensi ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {sudahPresensi ? 'Sudah Presensi' : 'Belum Presensi'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-[11px] text-slate-400">Status Jurnal Harian</p>
                      <p className="text-xs font-bold text-amber-400 mt-1">
                        {jurnalList.length > 0 ? jurnalList[0].status : 'Belum Diisi'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD AKSI CEPAT (POSISI DI ATAS) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Presensi Harian</h4>
                      <p className="text-[11px] text-slate-400">Kirim absensi & lokasi GPS</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('presensi')} className="w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2">
                    <span>Mulai Presensi</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Jurnal Kegiatan</h4>
                      <p className="text-[11px] text-slate-400">Catat aktivitas PKL harian</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('jurnal')} className="w-full bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2">
                    <span>Tulis Jurnal</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Informasi PKL</h4>
                      <p className="text-[11px] text-slate-400">Cek data & pembimbing</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('profil')} className="w-full bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-cyan-500/20 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2">
                    <span>Lihat Profil</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* KARTU NILAI & EVALUASI DUDI & GURU (POSISI DI BAWAH) */}
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-bold tracking-wider uppercase text-slate-400">Nilai & Evaluasi PKL</h4>
                  <span className="text-[10px] text-cyan-400 font-semibold">DUDI & Guru Pembimbing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Kedisiplinan (DUDI)</p>
                    <p className="text-lg font-extrabold text-emerald-400">
                      {currentUser?.discipline ?? '-'} <span className="text-[10px] text-slate-500">/100</span>
                    </p>
                  </div>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Keterampilan Teknis (DUDI)</p>
                    <p className="text-lg font-extrabold text-blue-400">
                      {currentUser?.skills ?? '-'} <span className="text-[10px] text-slate-500">/100</span>
                    </p>
                  </div>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Sikap / Kerja Sama (DUDI)</p>
                    <p className="text-lg font-extrabold text-cyan-400">
                      {currentUser?.attitude ?? '-'} <span className="text-[10px] text-slate-500">/100</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Nilai Laporan (Guru)</p>
                    <p className="text-lg font-extrabold text-amber-400">
                      {currentUser?.nilai_laporan ?? '-'} <span className="text-[10px] text-slate-500">/100</span>
                    </p>
                  </div>
                  <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-slate-400">Nilai Seminar / Presentasi (Guru)</p>
                    <p className="text-lg font-extrabold text-purple-400">
                      {currentUser?.nilai_seminar ?? '-'} <span className="text-[10px] text-slate-500">/100</span>
                    </p>
                  </div>
                </div>

                {currentUser?.notes && (
                  <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <p className="text-slate-400 font-semibold">Catatan Pembimbing DUDI:</p>
                    <p className="text-slate-200 italic">&ldquo;{currentUser.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'jurnal' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Isi Kegiatan / Jurnal Harian</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Catat aktivitas PKL harianmu (Maksimal 1 kali sehari). Status awal akan bernilai <span className="text-amber-400 font-semibold">Pending</span> hingga direview pembimbing.</p>
                </div>

                {jurnalSubmitted ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-xs space-y-1">
                    <p className="font-bold">Informasi Hari Ini</p>
                    <p>{pesanJurnal || 'Anda sudah mengisi jurnal hari ini. Silakan kembali esok hari!'}</p>
                  </div>
                ) : (
                  <form onSubmit={handleTambahJurnal} className="space-y-4">
                    <div className="w-full sm:w-1/3">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Tanggal Kegiatan</label>
                      <input type="date" value={formJurnal.tanggal} onChange={e => setFormJurnal({...formJurnal, tanggal: e.target.value})} className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Catatan Aktivitas PKL</label>
                      <textarea rows="3" placeholder="Tuliskan kegiatan PKL hari ini..." value={formJurnal.kegiatan} onChange={e => setFormJurnal({...formJurnal, kegiatan: e.target.value})} className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400">
                        Bukti Foto Pengerjaan <span className="text-rose-500">*Wajib Diisi</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileJurnal(e, false)}
                        className="w-full bg-[#0b0f17] border border-slate-800 rounded-xl p-3 text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2">
                      <Plus size={16} /><span>Kirim Jurnal Harian</span>
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">Riwayat Jurnal Tersimpan</h3>
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{jurnalList.length}</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0f1523] text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">Tanggal</th>
                        <th className="px-4 py-3.5">Uraian Kegiatan</th>
                        <th className="px-4 py-3.5">Foto Bukti</th>
                        <th className="px-4 py-3.5">Status Review</th>
                        <th className="px-4 py-3.5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {jurnalList.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-8 text-slate-500 italic">Belum ada riwayat jurnal tersimpan.</td></tr>
                      ) : (
                        jurnalList.map(j => {
                          const isRevisi = (j.status || '').toLowerCase().includes('revisi');
                          const isEditing = editJurnalId === j.id;

                          return (
                            <tr key={j.id} className="hover:bg-slate-800/30 align-top">
                              <td className="px-4 py-3 font-medium text-white">
                                {isEditing ? (
                                  <input type="date" value={formEdit.tanggal} onChange={e => setFormEdit({...formEdit, tanggal: e.target.value})} className="bg-[#0b0f17] border border-slate-700 rounded p-1 text-white text-xs" />
                                ) : j.tanggal}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <textarea rows="2" value={formEdit.kegiatan} onChange={e => setFormEdit({...formEdit, kegiatan: e.target.value})} className="w-full bg-[#0b0f17] border border-slate-700 rounded p-1 text-white text-xs" />
                                    <input type="file" accept="image/*" onChange={e => handleFileJurnal(e, true)} className="text-[10px] text-slate-400" />
                                  </div>
                                ) : j.kegiatan}
                              </td>
                              <td className="px-4 py-3">
                                {j.foto ? (
                                  <button onClick={() => setSelectedFotoJurnal(j.foto)} className="text-blue-400 hover:underline font-semibold text-xs">
                                    Lihat Foto
                                  </button>
                                ) : (
                                  <span className="text-slate-500 italic text-xs">Tidak ada</span>
                                )}
                              </td>
                              <td className="px-4 py-3">{renderStatusBadge(j)}</td>
                              <td className="px-4 py-3 space-x-1 whitespace-nowrap">
                                {isEditing ? (
                                  <div className="flex space-x-1">
                                    <button onClick={() => handleSimpanEdit(j.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium">Simpan</button>
                                    <button onClick={() => setEditJurnalId(null)} className="bg-slate-700 text-white px-2.5 py-1 rounded-lg text-[11px]">Batal</button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-1">
                                    {isRevisi && (
                                      <button onClick={() => handleMulaiEdit(j)} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium">Edit / Perbaiki</button>
                                    )}
                                    <button onClick={() => handleDeleteJurnal(j.id)} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium">Hapus</button>
                                  </div>
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
            </div>
          )}

          {activeTab === 'presensi' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-6 max-w-5xl">
              <div>
                <h3 className="text-sm font-bold text-white">Presensi Kehadiran PKL</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pilih status kehadiranmu hari ini (Hadir, Sakit, atau Izin).</p>
              </div>

              {sudahPresensi ? (
                <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 p-5 rounded-xl space-y-2">
                  <p className="font-bold text-sm">Informasi Presensi Hari Ini</p>
                  <p className="text-xs">{pesanPresensi || 'Anda sudah melakukan presensi hari ini. Silakan kembali esok hari!'}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setStatusKehadiran('hadir')} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${statusKehadiran === 'hadir' ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-[#0b0f17] border-slate-800 text-slate-400'}`}>Hadir</button>
                    <button type="button" onClick={() => setStatusKehadiran('sakit')} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${statusKehadiran === 'sakit' ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-[#0b0f17] border-slate-800 text-slate-400'}`}>Sakit</button>
                    <button type="button" onClick={() => setStatusKehadiran('izin')} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${statusKehadiran === 'izin' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#0b0f17] border-slate-800 text-slate-400'}`}>Izin</button>
                  </div>

                  <form onSubmit={handleKirimPresensi} className="space-y-6">
                    {statusKehadiran === 'hadir' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-4">
                          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                            <Navigation size={16} /><span>1. AMBIL TITIK KOORDINAT GPS</span>
                          </div>
                          {lokasiGPS && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs font-medium">Lokasi terdeteksi: {lokasiGPS}</div>}
                          <button type="button" onClick={handleDeteksiLokasi} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700">Deteksi Lokasi Saya</button>
                        </div>

                        <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-4">
                          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
                            <Camera size={16} /><span>2. FOTO KEHADIRAN (KAMERA)</span>
                          </div>

                          {!isCameraActive && !fotoKehadiran && (
                            <button type="button" onClick={startCamera} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700 flex items-center justify-center space-x-2">
                              <Camera size={16} /><span>Buka Kamera</span>
                            </button>
                          )}

                          {isCameraActive && (
                            <div className="space-y-3 text-center bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <video ref={videoRef} autoPlay playsInline className="w-full max-h-48 object-cover rounded-lg" />
                              <button type="button" onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold w-full">
                                Ambil Foto
                              </button>
                            </div>
                          )}

                          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

                          {fotoKehadiran && (
                            <div className="space-y-2 text-center">
                              <p className="text-xs text-emerald-400 font-semibold">&#10004; Foto berhasil diambil</p>
                              <img src={fotoKehadiran} alt="Preview" className="w-28 h-28 object-cover mx-auto rounded-xl border border-slate-700" />
                              <button type="button" onClick={retakePhoto} className="text-xs text-blue-400 hover:underline">Ambil Ulang Foto</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {statusKehadiran === 'sakit' && (
                      <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-3">
                        <label className="block text-xs font-semibold text-slate-400">Unggah Surat Keterangan Sakit (Foto/PDF)</label>
                        <input type="file" accept="image/*,.pdf" onChange={e => setFileSuratSakit(e.target.files[0])} className="w-full text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                      </div>
                    )}

                    {statusKehadiran === 'izin' && (
                      <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-5 space-y-3">
                        <label className="block text-xs font-semibold text-slate-400">Alasan Keterangan Izin</label>
                        <textarea rows="3" placeholder="Tuliskan alasan izin..." value={keteranganIzin} onChange={e => setKeteranganIzin(e.target.value)} className="w-full bg-[#111827] border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                      </div>
                    )}

                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/30">
                      Kirim Presensi Sekarang
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {activeTab === 'profil' && (
            <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-5 md:p-6 shadow-xl space-y-6 max-w-5xl">
              <div>
                <h3 className="text-sm font-bold text-white">Profil & Informasi Siswa PKL</h3>
                <p className="text-xs text-slate-400 mt-0.5">Detail akun dan pembimbing lapangan kamu.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">Nama Lengkap</p>
                  <p className="font-bold text-white text-sm">{namaSiswa}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">NISN</p>
                  <p className="font-bold text-white text-sm">{nisnUser}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">Email Akun</p>
                  <p className="font-bold text-white text-sm">{emailSiswa}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">Kelas</p>
                  <p className="font-bold text-white text-sm">{kelasSiswa}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">Tempat PKL (DUDI)</p>
                  <p className="font-bold text-white text-sm">{tempatPkl}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-slate-400">Guru Pembimbing</p>
                  <p className="font-bold text-white text-sm">{guruPembimbing}</p>
                </div>
                <div className="bg-[#0b0f17] border border-slate-800 rounded-xl p-4 space-y-1 md:col-span-2">
                  <p className="text-slate-400">Pembimbing DUDI</p>
                  <p className="font-bold text-white text-sm">{pembimbingDudi}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL PREVIEW FOTO JURNAL */}
      {selectedFotoJurnal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Bukti Foto Pengerjaan Jurnal</h4>
              <button onClick={() => setSelectedFotoJurnal(null)} className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2.5 py-1 rounded-lg">
                Tutup
              </button>
            </div>
            <div className="text-center">
              <img
                src={
                  selectedFotoJurnal.startsWith('data:') || selectedFotoJurnal.startsWith('http')
                    ? selectedFotoJurnal
                    : `${API_BASE_URL}/${selectedFotoJurnal}`
                }
                alt="Bukti Jurnal"
                className="w-full h-64 object-cover rounded-xl border border-slate-700 shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}