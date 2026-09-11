# 🕌 Manajemen Pengajian

Aplikasi web modern untuk manajemen pengajian, jamaah, absensi, monitoring pembinaan, dan pengumuman berbasis **Google Apps Script + React + Vite**.

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fitur

### 📊 Dashboard

- Ringkasan jamaah aktif, rata-rata kehadiran, dan jamaah yang perlu perhatian
- Distribusi jamaah per kategori (Caberawit, Pra Remaja, Remaja, Pra Nikah, Dewasa, Manula)
- Dashboard khusus per role (Super Admin, Admin, Tim PNKB, Tim Absensi)
- Pengajian terdekat dan daftar perlu perhatian

### 👥 Manajemen Jamaah

- Biodata lengkap jamaah (identitas, kontak, alamat, pendidikan)
- Kategori otomatis berdasarkan usia & status pernikahan
- Upload foto jamaah (maks. 5MB)
- Filter & pencarian jamaah
- Data jamaah lengkap dengan fallback avatar (icon hijab / pria)

### 📅 Absensi

- Buat jadwal pengajian
- Absensi cepat dengan segmented control (Hadir, Ijin, Sakit, Alpa)
- Bulk action "Tandai semua hadir"
- Progress indikator kehadiran
- Riwayat absensi per jamaah

### 💬 Monitoring & Pembinaan

- Catatan monitoring per jamaah
- Status pembinaan (Aktif, Perlu Perhatian, Kurang Aktif, Tidak Aktif)
- Timeline aktivitas jamaah
- Dashboard khusus Tim PNKB

### 📢 Pengumuman

- Template WhatsApp untuk undangan pengajian
- Generate otomatis berdasarkan template
- Preview sebelum share
- Bagikan langsung ke WhatsApp

### 🤖 AI Chat Assistant

- Asisten AI dengan tool calling untuk ambil data real
- Multi-provider: OmniRoute, Gemini, Groq (dengan fallback otomatis)
- Chat history tersimpan di localStorage
- Markdown renderer (bold, code, table, heading)
- Copy, share, regenerate response

### 🔐 Keamanan & Akses

- Login dengan session token (TTL 12 jam)
- Role-based access control:
  - **Super Admin** — akses penuh
  - **Admin** — kelola jamaah, kelompok, absensi, pengumuman
  - **Tim PNKB** — khusus pembinaan pra nikah
  - **Tim Absensi** — khusus absensi pengajian
- Audit log untuk aktivitas penting
- Field-level visibility berdasarkan role

### 🎨 UI/UX

- Design system konsisten dengan warna biru navy (Stockbit-inspired)
- Dark mode otomatis mengikuti sistem
- Animasi halus (FAB glow, shimmer skeleton, spring entrance)
- Skeleton loading mirror layout (tidak ada layout shift)
- Loading overlay blocking untuk aksi penting
- Responsive mobile-first (max-width 480px)
- Safe-area aware untuk iOS notch
- PWA-ready (installable di home screen)

---

## 🚀 Tech Stack

### Frontend

| Teknologi          | Fungsi                  |
| ------------------ | ----------------------- |
| **React 18**       | UI framework            |
| **TypeScript**     | Type safety             |
| **Vite**           | Build tool & dev server |
| **React Router 6** | Routing                 |
| **Tailwind CSS**   | Styling                 |
| **Lucide React**   | Icon library            |
| **Inter Font**     | Typography              |

### Backend

| Teknologi              | Fungsi                         |
| ---------------------- | ------------------------------ |
| **Google Apps Script** | Serverless backend             |
| **Google Sheets**      | Database                       |
| **Google Drive**       | Storage foto jamaah            |
| **UrlFetchApp**        | HTTP client untuk AI providers |

### AI Providers

| Provider      | Model                | Fungsi                |
| ------------- | -------------------- | --------------------- |
| **OmniRoute** | auto/best-vision     | Provider utama (fast) |
| **Gemini**    | gemini-2.0-flash-exp | Fallback 1            |
| **Groq**      | llama-3.3-70b        | Fallback 2 (gratis)   |

---

## 📁 Struktur Project
