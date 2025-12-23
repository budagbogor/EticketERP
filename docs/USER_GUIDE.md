# Panduan Pengguna MBTracker

Panduan lengkap penggunaan aplikasi MBTracker untuk semua role pengguna.

## Daftar Isi

- [Login & Registrasi](#login--registrasi)
- [Dashboard](#dashboard)
- [Manajemen Tiket](#manajemen-tiket)
- [Laporan Teknik](#laporan-teknik)
- [Buku Pintar](#buku-pintar)
- [Tire Data Management](#tire-data-management)
- [Tire Upgrade Calculator](#tire-upgrade-calculator)
- [Wiper Fit Finder](#wiper-fit-finder)
- [Laporan & Export](#laporan--export)
- [Manajemen Pengguna](#manajemen-pengguna-admin)
- [Pengaturan](#pengaturan-admin)

## Login & Registrasi

### Registrasi Akun Baru

1. Buka aplikasi di browser
2. Klik tombol **"Daftar"** atau **"Register"**
3. Isi form registrasi:
   - **Nama Lengkap**: Nama lengkap Anda
   - **Email**: Email aktif (akan digunakan untuk login)
   - **Password**: Minimal 6 karakter
   - **NIK**: Opsional (Nomor Induk Kependudukan)
   - **Role**: Pilih role yang sesuai
     - **Admin**: Akses penuh ke semua fitur
     - **Mekanik**: Akses ke tiket dan laporan teknik
     - **Customer Service**: Akses ke menu utama saja (tanpa akses admin)
4. Klik **"Daftar"**
5. Anda akan diarahkan ke halaman login

### Login

1. Masukkan **Email** dan **Password**
2. Klik **"Masuk"**
3. Anda akan diarahkan ke Dashboard

### Lupa Password

1. Di halaman login, klik **"Lupa Password?"**
2. Masukkan email Anda
3. Klik **"Kirim Link Reset"**
4. Cek email Anda dan klik link reset password
5. Masukkan password baru
6. Login dengan password baru

### Ganti Password

1. Setelah login, klik nama Anda di pojok kanan atas
2. Pilih **"Ganti Password"**
3. Masukkan:
   - Password lama
   - Password baru
   - Konfirmasi password baru
4. Klik **"Simpan"**

## Dashboard

Dashboard menampilkan ringkasan informasi penting:

### Statistik Tiket
- **Total Tiket**: Jumlah semua tiket
- **Open**: Tiket yang belum ditangani
- **In Progress**: Tiket yang sedang dikerjakan
- **Resolved**: Tiket yang sudah selesai

### Grafik
- **Tiket per Status**: Pie chart distribusi status tiket
- **Tiket per Kategori**: Bar chart tiket berdasarkan kategori
- **Trend Bulanan**: Line chart trend tiket per bulan

### Quick Actions
- **Buat Tiket Baru**: Langsung ke form pembuatan tiket
- **Lihat Semua Tiket**: Ke halaman daftar tiket
- **Buku Pintar**: Akses database kendaraan

### Recent Tickets
Daftar 5 tiket terbaru dengan informasi:
- Nomor tiket
- Customer
- Kendaraan
- Status
- Prioritas

## Manajemen Tiket

### Membuat Tiket Baru

1. Klik **"Tiket"** di sidebar → **"Buat Tiket Baru"**
2. Isi **Informasi Customer**:
   - Nama customer
   - Nomor telepon
   - Email (opsional)
3. Isi **Informasi Kendaraan**:
   - Nomor polisi
   - Merek (Toyota, Honda, dll)
   - Model (Avanza, Civic, dll)
   - Tahun
   - Nomor rangka (VIN)
   - Kilometer saat ini
4. Isi **Detail Komplain**:
   - Kategori (Engine, Transmission, Electrical, dll)
   - Prioritas (Low, Medium, High, Critical)
   - Deskripsi masalah (detail)
5. **Upload Foto** (opsional):
   - Klik area upload atau drag & drop
   - Maksimal 5 foto
   - Format: JPG, PNG, WEBP
6. Klik **"Simpan Tiket"**

### Melihat Daftar Tiket

1. Klik **"Tiket"** di sidebar → **"Daftar Tiket"**
2. Gunakan **Filter**:
   - Status (All, Open, In Progress, Resolved, Closed)
   - Kategori
   - Prioritas
   - Tanggal
3. Gunakan **Search** untuk cari berdasarkan:
   - Nomor tiket
   - Nama customer
   - Nomor polisi
4. Klik **baris tiket** untuk melihat detail

### Melihat Detail Tiket

Di halaman detail tiket, Anda dapat:

- **Lihat Informasi Lengkap**:
  - Data customer
  - Data kendaraan
  - Detail komplain
  - Foto-foto
  - Timeline aktivitas

- **Update Status**:
  - Klik dropdown status
  - Pilih status baru (Open → In Progress → Resolved → Closed)

- **Tambah Komentar**:
  - Scroll ke bagian "Timeline"
  - Tulis komentar di text area
  - Klik "Tambah Komentar"

- **Buat Laporan Teknik**:
  - Klik tombol "Buat Laporan Teknik"
  - Isi form laporan (lihat section Laporan Teknik)

- **Edit Tiket**:
  - Klik tombol "Edit Tiket"
  - Update informasi yang diperlukan
  - Klik "Simpan Perubahan"

### Edit Tiket

1. Di halaman detail tiket, klik **"Edit Tiket"**
2. Update informasi yang diperlukan
3. Klik **"Simpan Perubahan"**

> **Note**: Hanya tiket dengan status "Open" atau "In Progress" yang bisa diedit.

## Laporan Teknik

### Membuat Laporan Teknik

1. Buka detail tiket
2. Klik **"Buat Laporan Teknik"**
3. Isi **Diagnosis**:
   - Hasil pemeriksaan
   - Masalah yang ditemukan
   - Rekomendasi perbaikan
4. Isi **Pekerjaan yang Dilakukan**:
   - Detail pekerjaan
   - Langkah-langkah yang dilakukan
5. Tambah **Suku Cadang**:
   - Klik "Tambah Part"
   - Nama part
   - Part number
   - Jumlah
   - Harga satuan
   - Total otomatis terhitung
6. Isi **Biaya**:
   - Biaya jasa/labor
   - Total biaya part (otomatis)
   - Total keseluruhan (otomatis)
7. **Upload Foto** (opsional):
   - Foto kondisi sebelum
   - Foto proses perbaikan
   - Foto kondisi sesudah
8. Klik **"Simpan Laporan"**

### Melihat Laporan Teknik

1. Buka detail tiket
2. Scroll ke bagian "Laporan Teknik"
3. Klik **"Lihat Detail"**

### Edit Laporan Teknik

1. Di halaman detail tiket, klik **"Edit Laporan"**
2. Update informasi yang diperlukan
3. Klik **"Simpan Perubahan"**

### Export Laporan ke PDF

1. Buka detail laporan teknik
2. Klik tombol **"Export PDF"**
3. PDF akan otomatis terdownload
4. PDF berisi:
   - Header dengan logo perusahaan
   - Informasi tiket
   - Informasi kendaraan
   - Diagnosis
   - Pekerjaan yang dilakukan
   - Daftar suku cadang
   - Total biaya
   - Foto-foto

## Buku Pintar

Buku Pintar adalah database spesifikasi kendaraan.

### Mencari Spesifikasi Kendaraan

1. Klik **"Buku Pintar"** di sidebar
2. Pilih **Merek** (Toyota, Honda, dll)
3. Pilih **Model** (Avanza, Civic, dll)
4. Pilih **Varian** (1.5 G CVT, 1.8 RS, dll)
   - Atau pilih "Semua" untuk melihat semua varian
5. Spesifikasi akan ditampilkan

### Informasi yang Tersedia

#### Oli Mesin
- Viskositas (0W-20, 5W-30, dll)
- Kapasitas (liter)
- Standar kualitas (API SP, ILSAC GF-6A, dll)
- Merek rekomendasi

#### Oli Transmisi
- Tipe (CVT Fluid, ATF WS, dll)
- Kapasitas (liter)
- Merek rekomendasi

#### Oli Gardan (Differential)
- Tipe oli differential
- Kapasitas (liter)

#### Oli Power Steering
- Tipe oli power steering
- Merek rekomendasi

#### Minyak Rem
- Tipe (DOT 3/4)
- Merek rekomendasi

#### Coolant (Radiator)
- Tipe coolant
- Merek rekomendasi

#### Freon AC
- Tipe freon
- Merek rekomendasi

#### Suku Cadang
- Filter oli (part number + merek rekomendasi)
- Filter udara (part number + merek rekomendasi)
- Filter kabin (part number + merek rekomendasi)
- Busi (part number + merek rekomendasi)

#### Aki (Battery)
- Tipe (Kering/Basah)
- Model code (NS40ZL, dll)
- Ampere (Ah)
- Voltage (V)
- Dimensi (P x L x T cm)

#### Rem (Brakes)
- Tipe rem depan
- Tipe rem belakang
- Part number kampas rem depan
- Part number kampas rem belakang
- Merek rekomendasi kampas rem

#### Kaki-kaki (Suspension)
- Shock absorber depan (part number + merek rekomendasi)
- Shock absorber belakang (part number + merek rekomendasi)
- Rack end (part number + merek rekomendasi)
- Tie rod end (part number + merek rekomendasi)
- Link stabilizer (part number + merek rekomendasi)
- Lower arm (part number + merek rekomendasi)
- Upper arm (part number + merek rekomendasi)
- Upper support (part number + merek rekomendasi)

#### Ban (Tires)
- Ukuran ban
- Load index (indeks beban)
- Speed index (indeks kecepatan)
- Merek rekomendasi
- Tekanan angin

### Menambah Data Buku Pintar

1. Klik tombol **"Tambah Database"**
2. Pilih atau buat **Merek** baru
3. Pilih atau buat **Model** baru
4. Isi **Nama Varian**
5. Isi **Kode Mesin**
6. Pilih **Transmisi**
7. Isi **Tahun Mulai** dan **Tahun Selesai**
8. Isi spesifikasi di tab:
   - **Oli**: Oli mesin dan transmisi
   - **Part**: Filter dan busi
   - **Aki**: Spesifikasi aki
   - **Rem**: Sistem rem
   - **Kaki-kaki**: Komponen suspensi
9. Klik **"Simpan Data"**

### Edit Data Buku Pintar

1. Pilih merek, model, dan varian
2. Klik tombol **"Edit Data"**
3. Update informasi yang diperlukan
4. Klik **"Simpan Perubahan"**

### Menggunakan AI Chatbot

1. Di halaman Buku Pintar, klik icon **Chat**
2. Jika belum ada API key:
   - Klik "Setup API Key"
   - Masukkan Google Gemini API key
   - Dapatkan gratis di [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Tanyakan tentang spesifikasi kendaraan:
   - "Berapa kapasitas oli Avanza 2019?"
   - "Part number filter oli untuk Honda Civic 2020?"
   - "Ukuran ban untuk Toyota Fortuner?"
4. AI akan menjawab berdasarkan data di Buku Pintar

## Tire Data Management

Fitur untuk mengelola database ban (tire brands dan tire products).

### Melihat Data Ban

1. Klik **"Tire Data"** di sidebar
2. Pilih tab **"Brands"** untuk melihat merek ban
3. Pilih tab **"Products"** untuk melihat produk ban
4. Gunakan **Search** untuk mencari berdasarkan nama
5. Gunakan **Filter** untuk menyaring data

### Menambah Merek Ban

1. Di tab **"Brands"**, klik **"Add Brand"**
2. Isi form:
   - **Brand Name**: Nama merek (contoh: Bridgestone, Michelin)
   - **Logo URL**: URL logo merek (opsional)
   - **Description**: Deskripsi merek (opsional)
3. Klik **"Save"**

### Menambah Produk Ban

1. Di tab **"Products"**, klik **"Add Product"**
2. Isi form:
   - **Brand**: Pilih merek ban
   - **Product Name**: Nama produk (contoh: Turanza T005)
   - **Size**: Ukuran ban (contoh: 195/65R15)
   - **Type**: Tipe ban (Radial, Bias, Run-flat)
   - **Load Index**: Indeks beban (contoh: 91)
   - **Speed Index**: Indeks kecepatan (contoh: V)
   - **Price**: Harga (Rp)
   - **Rating**: Rating produk (1-5)
   - **Warranty**: Garansi (bulan)
   - **Features**: Fitur produk (comma-separated)
3. Klik **"Save"**

### Import Data Ban dari Excel

1. Klik tombol **"Import Excel"**
2. Download template Excel jika belum punya
3. Isi data ban di Excel sesuai format template
4. Klik **"Choose File"** dan pilih file Excel
5. Klik **"Import"**
6. Sistem akan memproses dan menampilkan hasil import

### Export Data Ban

1. Klik tombol **"Export CSV"**
2. File CSV akan terdownload otomatis
3. File berisi semua data ban (brands dan products)

### Edit/Hapus Data Ban

1. Di daftar brands/products, klik icon **Edit** (pensil)
2. Update informasi yang diperlukan
3. Klik **"Save Changes"**
4. Untuk hapus, klik icon **Delete** (trash) dan konfirmasi

## Tire Upgrade Calculator

Fitur untuk menghitung rekomendasi upgrade ukuran ban.

### Mencari Rekomendasi Ban

1. Klik **"Tire Upgrade"** di sidebar
2. Isi **Current Tire Size**:
   - **Width**: Lebar ban (mm) - contoh: 195
   - **Aspect Ratio**: Rasio tinggi (%) - contoh: 65
   - **Rim Diameter**: Diameter velg (inch) - contoh: 15
3. Klik **"Calculate Upgrades"**

### Melihat Hasil Rekomendasi

Sistem akan menampilkan:
- **Upgrade Options**: Daftar ukuran ban yang direkomendasikan
- **Same Rim Diameter**: Hanya ukuran dengan diameter velg yang sama
- **Diameter Difference**: Perbedaan diameter total (maksimal ±3%)
- **Visual Comparison**: Perbandingan ukuran secara visual

### Melihat Brand Recommendations

1. Klik salah satu ukuran rekomendasi
2. Sistem akan menampilkan produk ban dari berbagai merek
3. Informasi yang ditampilkan:
   - Brand dan nama produk
   - Harga
   - Rating
   - Warranty
   - Features
   - Load index dan speed index

### Tips Penggunaan

- Pilih ukuran dengan diameter difference ≤ 3%
- Perhatikan load index harus sama atau lebih tinggi
- Sesuaikan dengan kecepatan maksimal kendaraan (speed index)

## Wiper Fit Finder

Fitur untuk mencari ukuran wiper yang sesuai dengan kendaraan.

### Mencari Ukuran Wiper

1. Klik **"Wiper Finder"** di sidebar
2. Pilih **Make** (Merek kendaraan)
3. Pilih **Model** (Model kendaraan)
4. Pilih **Year** (Tahun)
5. Klik **"Search"**

### Melihat Hasil Pencarian

Sistem akan menampilkan:
- **Driver Side**: Ukuran wiper sisi pengemudi (inch)
- **Passenger Side**: Ukuran wiper sisi penumpang (inch)
- **Rear**: Ukuran wiper belakang (inch) - jika ada

### Menambah Data Wiper

1. Klik tombol **"Add Wiper Data"**
2. Isi form:
   - **Make**: Merek kendaraan
   - **Model**: Model kendaraan
   - **Year**: Tahun
   - **Driver Size**: Ukuran wiper pengemudi (inch)
   - **Passenger Size**: Ukuran wiper penumpang (inch)
   - **Rear Size**: Ukuran wiper belakang (inch) - opsional
3. Klik **"Save"**

### Import Data Wiper dari Excel

1. Klik tombol **"Import Excel"**
2. Download template Excel
3. Isi data wiper sesuai format
4. Upload file Excel
5. Klik **"Import"**

### Export Data Wiper

1. Klik tombol **"Export CSV"**
2. File CSV akan terdownload
3. Gunakan untuk backup atau analisis

### Edit/Hapus Data Wiper

1. Di hasil pencarian, klik icon **Edit**
2. Update ukuran wiper
3. Klik **"Save Changes"**
4. Untuk hapus, klik icon **Delete** dan konfirmasi

## Laporan & Export

### Melihat Laporan

1. Klik **"Laporan"** di sidebar
2. Pilih **Periode**:
   - Hari ini
   - 7 hari terakhir
   - 30 hari terakhir
   - Custom (pilih tanggal mulai dan selesai)
3. Pilih **Filter**:
   - Status
   - Kategori
   - Prioritas
4. Klik **"Tampilkan Laporan"**

### Export ke Excel

1. Di halaman Laporan, klik **"Export Excel"**
2. File Excel akan terdownload
3. Isi file:
   - Sheet 1: Daftar tiket
   - Sheet 2: Summary statistik

### Export ke PDF

1. Di halaman Laporan, klik **"Export PDF"**
2. File PDF akan terdownload
3. Isi file:
   - Header dengan logo
   - Periode laporan
   - Statistik
   - Tabel tiket
   - Grafik

## Manajemen Pengguna (Admin)

> **Note**: Fitur ini hanya tersedia untuk role Admin.

### Melihat Daftar Pengguna

1. Klik **"Pengguna"** di sidebar
2. Daftar semua pengguna akan ditampilkan
3. Informasi yang ditampilkan:
   - Nama
   - Email
   - NIK
   - Role
   - Status (Active/Inactive)

### Menambah Pengguna Baru

1. Klik tombol **"Tambah Pengguna"**
2. Isi form:
   - Nama lengkap
   - Email
   - Password
   - NIK (opsional)
   - Role (Admin/Mekanik/Customer Service)
3. Klik **"Simpan"**
4. Email notifikasi akan dikirim ke pengguna baru

### Edit Pengguna

1. Di daftar pengguna, klik icon **Edit** (pensil)
2. Update informasi yang diperlukan
3. Klik **"Simpan Perubahan"**

### Reset Password Pengguna

1. Di dialog Edit Pengguna, klik **"Reset Password"**
2. Konfirmasi reset
3. Email reset password akan dikirim ke pengguna

### Hapus Pengguna

1. Di daftar pengguna, klik icon **Hapus** (trash)
2. Konfirmasi penghapusan
3. Pengguna akan dihapus dari sistem

> **Warning**: Penghapusan pengguna tidak dapat dibatalkan!

### Search & Filter Pengguna

- **Search**: Cari berdasarkan nama, email, atau NIK
- **Filter Role**: Tampilkan hanya role tertentu
### Filter Status: Tampilkan hanya active/inactive

## Complain Compass

Fitur untuk mendata dan memonitoring komplain pelanggan dari media sosial (Instagram, TikTok, Google Maps, dll).

### Membuat Complain Baru

1. Navigasi ke **Complain Compass** di sidebar
2. Isi form input:
   - **Channel**: Sumber komplain (Instagram, TikTok, dll)
   - **Username**: Nama akun pelapor
   - **Link Post**: URL postingan/komentar (opsional)
   - **Tanggal**: Waktu kejadian
   - **Kategori**: Jenis keluhan (Produk, Service, dll)
   - **Cabang**: Lokasi bengkel terkait
3. **Analisis Risiko**:
   - Tentukan **Status Pelanggan**: Dapat dihubungi / Tidak
   - Tentukan **Viral Risk**: Normal / Potensi Viral
4. Isi ringkasan dan detail masalah
5. Klik **"Simpan Complain"**

### Monitoring Dashboard

Dashboard Complain Compass menampilkan:
- **Total Complain**: Jumlah keseluruhan
- **Open**: Komplain baru yang belum ditangani
- **Monitoring**: Komplain dalam pemantauan khusus
- **Potensi Viral**: Komplain yang perlu perhatian segera
- **Status Warna**:
  - Merah: Open (Perlu respon)
  - Kuning: Monitoring (Sedang dipantau)
  - Hijau: Closed (Selesai)

### Update Status & Hapus

1. Di daftar complain, klik dropdown status
2. Ubah status (Open → Monitoring → Closed)
3. Untuk melihat detail, klik icon **Mata**
4. Untuk menghapus, klik icon **Sampah**

### Export Data

1. Klik tombol **"Export Complain Compass to CSV"** di pojok kanan atas
2. File CSV berisi semua data detail akan terdownload otomatis
3. Data mencakup: ID, Channel, Username, Kategori, Risiko, Status, dll.

## Pengaturan (Admin)

> **Note**: Fitur ini hanya tersedia untuk role Admin.

### Profil Perusahaan

1. Klik **"Pengaturan"** di sidebar
2. Tab **"Profil Perusahaan"**
3. Isi/update:
   - Nama perusahaan
   - Alamat
   - Telepon
   - Email
   - Website
4. Upload **Logo**:
   - Klik area upload
   - Pilih file logo (PNG/JPG)
   - Maksimal 2MB
5. Klik **"Simpan"**

### Master Data

#### Kategori Tiket

1. Tab **"Master Data"** → **"Kategori"**
2. Klik **"Tambah Kategori"**
3. Masukkan nama kategori (contoh: "Engine Problem")
4. Klik **"Simpan"**
5. Untuk edit/hapus, klik icon di samping kategori

#### Prioritas

1. Tab **"Master Data"** → **"Prioritas"**
2. Klik **"Tambah Prioritas"**
3. Masukkan nama (Low, Medium, High, Critical)
4. Pilih warna (untuk visual indicator)
5. Klik **"Simpan"**

#### Status

1. Tab **"Master Data"** → **"Status"**
2. Klik **"Tambah Status"**
3. Masukkan nama (Open, In Progress, Resolved, Closed)
4. Pilih warna
5. Klik **"Simpan"**

### Data Kendaraan

#### Merek Kendaraan

1. Tab **"Data Kendaraan"** → **"Merek"**
2. Klik **"Tambah Merek"**
3. Masukkan nama merek (Toyota, Honda, dll)
4. Upload logo merek (opsional)
5. Klik **"Simpan"**

#### Model Kendaraan

1. Pilih merek
2. Klik **"Tambah Model"**
3. Masukkan nama model (Avanza, Civic, dll)
4. Klik **"Simpan"**

#### Tipe/Varian

1. Pilih merek dan model
2. Klik **"Tambah Tipe"**
3. Masukkan nama tipe (1.5 G CVT, 1.8 RS, dll)
4. Klik **"Simpan"**

## Tips & Trik

### Keyboard Shortcuts

- `Ctrl + K`: Quick search
- `Ctrl + N`: Buat tiket baru (di halaman tiket)
- `Esc`: Tutup dialog/modal

### Best Practices

1. **Selalu isi deskripsi lengkap** saat membuat tiket
2. **Upload foto** untuk dokumentasi yang lebih baik
3. **Update status tiket** secara berkala
4. **Buat laporan teknik** segera setelah perbaikan selesai
5. **Backup data** secara rutin (export Excel/PDF)

### Troubleshooting

#### Tidak bisa upload foto
- Cek ukuran file (maksimal 5MB per foto)
- Cek format file (harus JPG, PNG, atau WEBP)
- Cek koneksi internet

#### Laporan tidak muncul
- Cek filter tanggal
- Cek filter status/kategori
- Refresh halaman (F5)

#### Lupa password
- Gunakan fitur "Lupa Password" di halaman login
- Cek email untuk link reset
- Jika tidak menerima email, hubungi admin

## Dukungan

Jika mengalami masalah atau butuh bantuan:

- 📧 Email: support@mbtracker.com
- 💬 WhatsApp: +62 xxx xxxx xxxx
- 📚 Documentation: [https://github.com/budagbogor/complain-medsos](https://github.com/budagbogor/complain-medsos)
