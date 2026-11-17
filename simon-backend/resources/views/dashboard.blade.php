<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard SIMON-PKL</title>
    <!-- Tailwind CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <!-- FontAwesome untuk Icon -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-100 text-gray-800 font-sans">

    <div class="container mx-auto p-6">
        <!-- HEADER -->
        <header class="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">SIMON-PKL Dashboard</h1>
                <p class="text-gray-500 text-sm">Sistem Monitoring Praktik Kerja Lapangan</p>
            </div>
            <div>
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Administrator / Pembimbing</span>
            </div>
        </header>

        <!-- KARTU STATISTIK (Hasil Agregat COUNT Umum) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Card Total Siswa -->
            <div class="bg-blue-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm uppercase font-semibold tracking-wider">Total Siswa</p>
                    <h2 class="text-3xl font-bold mt-1">{{ $statistik_pengguna['total_siswa'] ?? 120 }}</h2>
                </div>
                <i class="fas fa-users text-4xl opacity-80"></i>
            </div>

            <!-- Card Total DUDI -->
            <div class="bg-green-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm uppercase font-semibold tracking-wider">Total DUDI</p>
                    <h2 class="text-3xl font-bold mt-1">{{ $statistik_pengguna['total_dudi'] ?? 25 }}</h2>
                </div>
                <i class="fas fa-building text-4xl opacity-80"></i>
            </div>

            <!-- Card Total Guru -->
            <div class="bg-purple-600 text-white p-6 rounded-lg shadow-md flex items-center justify-between">
                <div>
                    <p class="text-sm uppercase font-semibold tracking-wider">Total Guru</p>
                    <h2 class="text-3xl font-bold mt-1">{{ $statistik_pengguna['total_guru'] ?? 15 }}</h2>
                </div>
                <i class="fas fa-chalkboard-teacher text-4xl opacity-80"></i>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- KOLOM KIRI: FORM INPUT DENGAN ALERT PERINGATAN RAMAH -->
            <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-1">
                <h2 class="text-xl font-bold mb-4 text-gray-700">Tambah Data Baru</h2>

                <!-- ALERT ERROR RAMAH JIKA TERJADI DUPLIKAT -->
                @if(session('error'))
                    <div class="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 mb-4 rounded shadow-sm" role="alert">
                        <strong>Peringatan Validasi:</strong>
                        <p class="text-sm mt-1">{{ session('error') }}</p>
                    </div>
                @endif

                @if ($errors->any())
                    <div class="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 mb-4 rounded shadow-sm" role="alert">
                        <strong>Peringatan Validasi:</strong>
                        <p class="text-sm mt-1">Data atau kombinasi data tersebut sudah terdaftar di sistem. Mohon masukkan data yang berbeda.</p>
                    </div>
                @endif

                <!-- FORM INPUT -->
                <form action="#" method="POST">
                    @csrf
                    <div class="mb-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm">Nama / Kunci Utama</label>
                        <input type="text" name="name" value="{{ old('name') }}" class="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masukkan nama..." required>
                    </div>

                    <div class="mb-4">
                        <label class="block text-gray-700 font-semibold mb-2 text-sm">Role / Kategori</label>
                        <select name="role" class="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            <option value="">-- Pilih Role --</option>
                            <option value="siswa">Siswa</option>
                            <option value="guru">Guru</option>
                            <option value="dudi">DUDI</option>
                        </select>
                    </div>

                    <button type="submit" class="w-full bg-blue-600 text-white font-semibold p-2.5 rounded-md hover:bg-blue-700 transition">
                        Simpan Data
                    </button>
                </form>
            </div>

            <!-- KOLOM KANAN: TABEL RINGKASAN AGREGAT DINAMIS (COUNT & SUM) -->
            <div class="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                <h2 class="text-xl font-bold mb-4 text-gray-700">Tabel Ringkasan Rekap Kegiatan</h2>
                
                <div class="overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-200 text-left text-sm">
                        <thead>
                            <tr class="bg-gray-100 text-gray-700">
                                <th class="border border-gray-300 p-3">Kategori / Status</th>
                                <th class="border border-gray-300 p-3">Total Kegiatan (Count)</th>
                                <th class="border border-gray-300 p-3">Total Jam Pelajaran (Sum)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Contoh data statis jika belum dihubungkan ke Controller, atau gunakan looping @foreach($rekap_agregat as $rekap) -->
                            <tr class="hover:bg-gray-50">
                                <td class="border border-gray-300 p-3 font-medium uppercase">Pending</td>
                                <td class="border border-gray-300 p-3">12</td>
                                <td class="border border-gray-300 p-3">48 Jam</td>
                            </tr>
                            <tr class="hover:bg-gray-50">
                                <td class="border border-gray-300 p-3 font-medium uppercase">Disetujui</td>
                                <td class="border border-gray-300 p-3">85</td>
                                <td class="border border-gray-300 p-3">340 Jam</td>
                            </tr>
                            <tr class="hover:bg-gray-50">
                                <td class="border border-gray-300 p-3 font-medium uppercase">Revisi</td>
                                <td class="border border-gray-300 p-3">5</td>
                                <td class="border border-gray-300 p-3">20 Jam</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</body>
</html>