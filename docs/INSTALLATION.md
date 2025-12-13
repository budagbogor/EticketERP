# Panduan Instalasi MBTracker

Panduan lengkap untuk menginstall dan menjalankan aplikasi MBTracker di environment lokal.

## Prasyarat

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** versi 18 atau lebih baru ([Download](https://nodejs.org/))
- **npm** (terinstall otomatis dengan Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Akun Supabase** (gratis) - [Daftar di sini](https://supabase.com)

## Langkah 1: Clone Repository

```bash
# Clone repository dari GitHub
git clone https://github.com/budagbogor/psd.git

# Masuk ke folder project
cd psd
```

## Langkah 2: Install Dependencies

```bash
npm install
```

Proses ini akan menginstall semua dependencies yang diperlukan (~200MB).

## Langkah 3: Setup Supabase

### 3.1 Buat Project Baru

1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Isi:
   - **Name**: MBTracker (atau nama lain)
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih yang terdekat (Southeast Asia - Singapore)
4. Klik "Create new project"
5. Tunggu ~2 menit hingga project siap

### 3.2 Dapatkan API Credentials

1. Di Supabase Dashboard, buka project Anda
2. Klik **Settings** (icon gear) di sidebar
3. Pilih **API**
4. Copy:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon/public key** (key yang panjang)

### 3.3 Setup Database Schema

1. Di Supabase Dashboard, klik **SQL Editor**
2. Klik "New query"
3. Copy-paste isi file `supabase/migrations/*.sql` satu per satu
4. Klik "Run" untuk setiap query

Atau gunakan Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3.4 Setup Storage

1. Di Supabase Dashboard, klik **Storage**
2. Buat bucket baru:
   - **Name**: `ticket-attachments`
   - **Public**: Yes
3. Buat bucket lagi:
   - **Name**: `company-logos`
   - **Public**: Yes

### 3.5 Setup Authentication

1. Di Supabase Dashboard, klik **Authentication**
2. Klik **Providers**
3. Pastikan **Email** provider sudah enabled
4. Klik **Email Templates** untuk customize email reset password (opsional)

## Langkah 4: Konfigurasi Environment Variables

1. Buat file `.env` di root folder project:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

2. Edit file `.env` dan isi dengan credentials Supabase:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **⚠️ PENTING**: Jangan commit file `.env` ke Git! File ini sudah ada di `.gitignore`.

## Langkah 5: Jalankan Development Server

```bash
npm run dev
```

Jika berhasil, Anda akan melihat output seperti ini:
```
VITE v5.4.19  ready in 551 ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.x.x:8080/
```

## Langkah 6: Buka Aplikasi

1. Buka browser (Chrome, Firefox, Edge, dll)
2. Akses `http://localhost:8080`
3. Anda akan melihat halaman Login

## Langkah 7: Buat Akun Admin Pertama

1. Klik "Register" atau "Daftar"
2. Isi form registrasi:
   - **Nama Lengkap**: Nama Anda
   - **Email**: Email valid
   - **Password**: Minimal 6 karakter
   - **NIK**: Opsional
   - **Role**: Pilih "Admin"
3. Klik "Daftar"
4. Login dengan email dan password yang baru dibuat

## Langkah 8: Setup Data Awal (Opsional)

### Master Data
1. Login sebagai Admin
2. Buka **Pengaturan → Master Data**
3. Tambahkan:
   - Kategori tiket (Engine, Transmission, Electrical, dll)
   - Prioritas (Low, Medium, High, Critical)
   - Status (Open, In Progress, Resolved, Closed)

### Data Kendaraan
1. Buka **Pengaturan → Data Kendaraan**
2. Tambahkan merek kendaraan (Toyota, Honda, Mitsubishi, dll)
3. Tambahkan model untuk setiap merek
4. Tambahkan tipe/varian

### Buku Pintar
1. Buka **Buku Pintar**
2. Klik "Tambah Database"
3. Isi spesifikasi kendaraan

## Troubleshooting

### Error: "Cannot find module"
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules
npm install
```

### Error: "Supabase connection failed"
- Cek apakah `.env` sudah benar
- Cek apakah Supabase project sudah running
- Cek koneksi internet

### Error: "Port 8080 already in use"
```bash
# Ubah port di vite.config.ts atau kill process yang menggunakan port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Error: PowerShell execution policy (Windows)
```bash
# Gunakan cmd instead
cmd /c npm run dev
```

## Langkah Selanjutnya

- 📖 Baca [User Guide](./docs/USER_GUIDE.md) untuk panduan penggunaan
- 🚀 Lihat [Deployment Guide](./docs/DEPLOYMENT.md) untuk deploy ke production
- 🔧 Lihat [API Documentation](./docs/API.md) untuk integrasi

## Butuh Bantuan?

- 📧 Email: support@mbtracker.com
- 💬 GitHub Issues: [https://github.com/budagbogor/psd/issues](https://github.com/budagbogor/psd/issues)
- 📚 Documentation: [https://github.com/budagbogor/psd](https://github.com/budagbogor/psd)
