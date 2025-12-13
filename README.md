# MBTracker - Mobeng E-Ticket System

![MBTracker](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)

**MBTracker** adalah sistem manajemen tiket dan komplain kendaraan berbasis web yang dirancang khusus untuk bengkel dan layanan teknik kendaraan. Aplikasi ini menyediakan solusi lengkap untuk mengelola tiket komplain, laporan teknik, database kendaraan, dan manajemen pengguna.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Penggunaan](#-penggunaan)
- [Struktur Proyek](#-struktur-proyek)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## ✨ Fitur Utama

### 🎫 Sistem Tiket (Ticket Management)
- **Buat Tiket Baru**: Catat komplain kendaraan dengan detail lengkap
- **Tracking Status**: Monitor status tiket dari Open → In Progress → Resolved → Closed
- **Prioritas**: Sistem prioritas Low, Medium, High, Critical
- **Kategori**: Klasifikasi tiket berdasarkan jenis masalah (Engine, Transmission, Electrical, dll)
- **Timeline**: Riwayat lengkap aktivitas tiket
- **Export**: Export data tiket ke Excel/PDF

### 📝 Laporan Teknik (Technical Report)
- **Diagnosis Lengkap**: Catat diagnosis masalah kendaraan
- **Pekerjaan yang Dilakukan**: Dokumentasi detail perbaikan
- **Suku Cadang**: Daftar part yang digunakan dengan harga
- **Biaya**: Perhitungan otomatis biaya total (part + labor)
- **Foto**: Upload foto kondisi kendaraan
- **Export**: Cetak laporan teknik dalam format PDF

### 📚 Buku Pintar (Vehicle Database)
- **Database Kendaraan**: Informasi lengkap spesifikasi kendaraan
- **Oli Mesin**: Viskositas, kapasitas, standar kualitas, merek rekomendasi
- **Oli Transmisi**: Tipe dan kapasitas oli transmisi
- **Suku Cadang**: Part number untuk filter oli, filter udara, filter kabin, busi
- **Aki**: Tipe, model, ampere, voltage, dimensi
- **Rem**: Tipe rem depan/belakang, part number kampas rem, minyak rem
- **Kaki-kaki**: Shock absorber, rack end, tie rod, link stabilizer, lower/upper arm
- **Ban**: Ukuran dan spesifikasi ban
- **AI Chatbot**: Tanya jawab tentang spesifikasi kendaraan dengan Google Gemini

### 👥 Manajemen Pengguna (User Management)
- **Role-Based Access**: Admin, Staff, Tech Support, PSD, Viewer
- **CRUD Users**: Tambah, edit, hapus pengguna
- **Generate Password**: Admin dapat generate password baru untuk user
- **Reset Password**: Kirim email reset password
- **NIK Optional**: NIK tidak wajib untuk fleksibilitas
- **Search & Filter**: Cari pengguna berdasarkan nama, email, NIK, role
- **Access Control**: Viewer role hanya dapat melihat, tidak dapat create/edit

### 📊 Dashboard & Laporan
- **Dashboard**: Statistik real-time tiket, grafik, quick actions
- **Laporan**: Filter berdasarkan tanggal, status, kategori, prioritas
- **Export CSV**: Export tiket dengan 21 kolom data lengkap (termasuk laporan teknik)
- **Visualisasi**: Grafik dan chart untuk analisis data

### ⚙️ Pengaturan (Settings)
- **Profil Perusahaan**: Nama, alamat, telepon, email, logo
- **Master Data**: Kelola kategori, prioritas, status tiket
- **Data Kendaraan**: Kelola merek, model, tipe kendaraan
- **Backup & Export**: Export/import data lengkap dalam format JSON
- **Backup Otomatis**: Dikelola oleh Supabase dengan retensi 7 hari

## 🛠 Teknologi

### Frontend
- **React 18.3.1** - Library UI
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool & dev server
- **React Router 6.30.1** - Routing
- **TanStack Query 5.83.0** - Data fetching & caching

### UI Framework
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **Recharts** - Chart library

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Edge Functions
  - Real-time subscriptions

### Form & Validation
- **React Hook Form 7.61.1** - Form management
- **Zod 3.25.76** - Schema validation

### Utilities
- **date-fns 3.6.0** - Date manipulation
- **Sonner** - Toast notifications
- **clsx & tailwind-merge** - Class name utilities

## 📦 Instalasi

### Prasyarat
- Node.js 18+ dan npm
- Akun Supabase (gratis)
- Git

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/budagbogor/psd.git
cd psd
```

2. **Install Dependencies**
```bash
npm install
```

3. **Konfigurasi Environment Variables**

Buat file `.env` di root folder:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Dapatkan kredensial dari [Supabase Dashboard](https://app.supabase.com):
- Project Settings → API → Project URL
- Project Settings → API → anon/public key

4. **Setup Database**

Jalankan migration SQL di Supabase SQL Editor:
```bash
# File migration ada di folder supabase/migrations/
```

5. **Jalankan Development Server**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:8080`

## ⚙️ Konfigurasi

### Supabase Setup

1. **Buat Project Baru** di [Supabase](https://app.supabase.com)

2. **Setup Authentication**
   - Enable Email provider
   - Konfigurasi email templates untuk reset password
   - Set redirect URLs untuk production

3. **Setup Storage**
   - Buat bucket `ticket-attachments` untuk foto tiket
   - Buat bucket `company-logos` untuk logo perusahaan
   - Set policies untuk akses public/private

4. **Setup Edge Functions**
   - Deploy edge functions untuk reset password
   - Konfigurasi SMTP untuk email

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: Google Gemini API (untuk AI Chatbot)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 🚀 Penggunaan

### Login Pertama Kali

1. Buka aplikasi di browser
2. Klik "Register" untuk membuat akun admin pertama
3. Login dengan kredensial yang dibuat
4. Akses halaman User Management untuk menambah user lain

### Membuat Tiket

1. Navigasi ke **Tiket → Buat Tiket Baru**
2. Isi informasi kendaraan dan komplain
3. Upload foto (opsional)
4. Klik "Simpan Tiket"

### Membuat Laporan Teknik

1. Buka detail tiket
2. Klik "Buat Laporan Teknik"
3. Isi diagnosis, pekerjaan, dan suku cadang
4. Klik "Simpan Laporan"
5. Export ke PDF jika diperlukan

### Menggunakan Buku Pintar

1. Navigasi ke **Buku Pintar**
2. Pilih merek, model, dan varian kendaraan
3. Lihat spesifikasi lengkap
4. Gunakan AI Chatbot untuk tanya jawab (masukkan Gemini API key)

### Manajemen Pengguna (Admin Only)

1. Navigasi ke **Pengguna**
2. Klik "Tambah Pengguna"
3. Isi data pengguna dan pilih role
4. Klik "Simpan"

## 📁 Struktur Proyek

```
mbtracker-main/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── buku-pintar/  # Vehicle database components
│   │   ├── layout/       # Layout components
│   │   ├── tickets/      # Ticket components
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── use-vehicles.ts
│   │   ├── use-buku-pintar.ts
│   │   └── use-toast.ts
│   ├── integrations/     # External integrations
│   │   └── supabase/
│   ├── lib/              # Utility functions
│   │   ├── export-utils.ts
│   │   └── utils.ts
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── TicketList.tsx
│   │   ├── CreateTicket.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── BukuPintar.tsx
│   │   ├── UserManagement.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── supabase/             # Supabase config & migrations
│   ├── functions/        # Edge functions
│   └── migrations/       # SQL migrations
├── .env                  # Environment variables (tidak di-commit)
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.ts    # Tailwind config
├── vite.config.ts        # Vite config
└── README.md             # Dokumentasi ini
```

## 🌐 Deployment

### Deploy ke Vercel (Recommended)

1. **Push ke GitHub** (sudah dilakukan)

2. **Import ke Vercel**
   - Buka [Vercel](https://vercel.com)
   - Klik "Import Project"
   - Pilih repository GitHub
   - Konfigurasi environment variables
   - Deploy!

3. **Konfigurasi Environment Variables di Vercel**
   - Settings → Environment Variables
   - Tambahkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

4. **Update Supabase Redirect URLs**
   - Authentication → URL Configuration
   - Tambahkan URL production Vercel

### Deploy ke Netlify

```bash
npm run build
# Upload folder dist/ ke Netlify
```

### Deploy Manual

```bash
# Build production
npm run build

# Folder dist/ siap di-deploy ke hosting apapun
```

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Developer

Developed with ❤️ by **budagbogor**

## 📞 Kontak & Support

- GitHub: [@budagbogor](https://github.com/budagbogor)
- Repository: [https://github.com/budagbogor/psd](https://github.com/budagbogor/psd)

## 🙏 Acknowledgments

- [Lovable.dev](https://lovable.dev) - Initial project setup
- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide Icons](https://lucide.dev) - Icons

---

**Made with ❤️ for better vehicle service management**
