# 📊 SIMON PKL — Sistem Informasi Monitoring Praktik Kerja Lapangan

> Proyek Uji Kompetensi Keahlian (UKK) Rekayasa Perangkat Lunak / PPLG — Tahun Ajaran 2026/2027  
> **Tema:** Educational & Industrial Monitoring Solution &bull; **Mitra:** Sekolah Menengah Kejuruan & DU/DI Mitra

---

## 📌 1. Latar Belakang Masalah & Solusi
Pengelolaan jurnal harian, absensi, dan penilaian Praktik Kerja Lapangan (PKL) siswa sebelumnya masih menggunakan buku catatan fisik dan rekapitulasi manual via pesan WhatsApp. Hal ini memicu risiko tinggi keterlambatan pemantauan, hilangnya catatan aktivitas harian, serta kesulitan bagi guru pembimbing dan pihak industri dalam melakukan verifikasi secara transparan.

**SIMON PKL** hadir sebagai solusi digital terintegrasi yang menyediakan:
1. **Digital Logbook & Absensi:** Memungkinkan siswa mencatat jurnal harian dan kehadiran secara real-time dengan validasi pembimbing.
2. **Monitoring Dashboard:** Panel pemantauan bagi Guru Pembimbing dan Pembimbing Lapangan (DUDI) untuk memantau progres kegiatan siswa secara berkala.
3. **Transparent Assessment & Reporting:** Rekapitulasi nilai akhir dan cetak laporan/sertifikat digital yang akurat dan transparan.

---

## 🛠️ 2. Tech Stack & Architecture
* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons.
* **Backend:** PHP 8.2 (Laravel 11 RESTful API / MVC Engine).
* **Database:** MySQL / MariaDB (InnoDB Engine, 3rd Normal Form - 3NF).
* **Security:** Laravel Sanctum Authentication, Bcrypt Hashing, Parameterized Prepared Statements, CSRF Shield, Role Middleware.

---

## 🚀 3. Panduan Instalasi Lokal (Quick Local Setup)

Ikuti langkah berikut untuk menjalankan aplikasi di lingkungan pengembang lokal:

### Prasyarat Sistem:
* PHP $\ge$ 8.2 & Composer
* Node.js & NPM
* MySQL Server (Laragon / XAMPP)
* Git CLI

### Langkah Instalasi:
```bash
# 1. Klon repositori ini
git clone [https://github.com/Erlynurandini/sistem-monitoring.git](https://github.com/Erlynurandini/sistem-monitoring.git)
cd sistem-monitoring

# 2. Setup Backend (Laravel)
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan storage:link

# 3. Setup Frontend (React)
cd ../frontend
npm install
npm run dev
