# 🕌 Sambung Ngaji — Frontend

Aplikasi web manajemen pengajian untuk **admin** & **jamaah**. Dibangun dengan **React 18 + TypeScript + Vite**, mengonsumsi API backend Go (lihat [`../backend/go/README.md`](../backend/go/README.md)).

![Status](https://img.shields.io/badge/status-active-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Fitur

Aplikasi punya **2 mode** yang dibedakan berdasarkan role user.

### 🛠️ Mode Admin

Role: `SUPER_ADMIN`, `ADMIN`, `TIM_PNKB`, `TIM_ABSENSI`, `PENGAWAS`

- **Dashboard** — statistik jamaah, kehadiran, perlu perhatian; layout beda per role
- **Jamaah** — CRUD biodata, import dari text WhatsApp, upload foto, export CSV, virtual list
- **Absensi** — per meeting, bulk "Hadir semua", filter kategori & gender
- **Jadwal** — kalender bulanan, bulk create 1 bulan, import dari text/PDF
- **Pengumuman** — template WhatsApp, generate otomatis, share ke WA
- **Monitoring** — catatan pembinaan per jamaah + timeline
- **Kelompok** — kelola kelompok pengajian
- **User & Akses** — manajemen user, reset password, role assignment
- **Permintaan Member** — approve/reject request jadi member
- **Audit Log** — riwayat aktivitas sistem
- **QR Pendaftaran** — share link/form pendaftaran jamaah baru

### 🕌 Mode Member

- **Beranda** — greeting, jadwal sholat, quick actions, preview jadwal pengajian terdekat
- **Al-Quran** — 114 surah (per ayat / mushaf), audio multi-qari, bookmark
- **Doa & Dzikir** — pagi, sore, harian; dzikir counter dengan progress
- **Waktu Sholat** — jadwal 5 waktu, countdown, hijriah (adhan)
- **Puasa Sunnah** — jadwal 60 hari ke depan
- **Arah Kiblat** — kompas real-time berbasis sensor
- **Tenangkan Hati** — ayat & doa sesuai mood
- **Jurnal Sholat** — tracker 5 waktu + streak
- **Tahfidz** — progress hafalan per surah/ayat + mode uji
- **Jadwal Pengajian** — kalender + daftar, filter per kategori user
- **Biodata Saya** — lihat & edit profil sendiri
- **Asisten AI** — chat pribadi untuk tanya data sendiri

### 🔗 Cross-cutting

- **Auth** — login, register publik, ganti password/username
- **Tema** — light/dark + preset warna custom
- **PWA** — installable, offline cache via Workbox
- **Backup** — export/import data lokal

---

## 🚀 Tech Stack

### Core

| Teknologi          | Fungsi                  |
| ------------------ | ----------------------- |
| **React 18**       | UI framework            |
| **TypeScript 5**   | Type safety             |
| **Vite 5**         | Build tool & dev server |
| **React Router 6** | Routing                 |

### Data & State

| Teknologi                    | Fungsi                                     |
| ---------------------------- | ------------------------------------------ |
| **TanStack Query v5**        | Server state, caching, retry               |
| **TanStack Query Persister** | Cache persisten (IndexedDB via idb-keyval) |
| **Context API**              | Auth, Theme, Toast                         |

### UI

| Teknologi          | Fungsi          |
| ------------------ | --------------- |
| **Tailwind CSS 3** | Styling utility |
| **FontAwesome**    | Icon library    |
| **Inter**          | Typography      |

### Fitur Khusus

| Teknologi                     | Fungsi                             |
| ----------------------------- | ---------------------------------- |
| **FullCalendar**              | Kalender jadwal (admin + member)   |
| **adhan**                     | Perhitungan waktu sholat           |
| **browser-image-compression** | Kompres foto sebelum upload        |
| **qrcode.react**              | QR pendaftaran                     |
| **TanStack Virtual**          | Virtual list (daftar jamaah besar) |

### PWA & Build

| Teknologi                      | Fungsi                    |
| ------------------------------ | ------------------------- |
| **vite-plugin-pwa**            | Service worker + manifest |
| **Workbox**                    | Runtime caching strategy  |
| **@vite-pwa/assets-generator** | Generate icon PWA         |

---

## 📁 Struktur Project

```
src/
├── components/
│   ├── common/         # Button, Input, Sheet, Modal, dsb
│   ├── layout/         # AppLayout, Header, BottomNav, ProfileMenuSheet
│   ├── member/         # Komponen khusus mode jamaah
│   ├── jadwal/         # Kalender & tab jadwal admin
│   └── monitoring/     # Komponen monitoring
├── contexts/           # AuthContext, ThemeContext, ToastContext
├── data/               # Data statis (quran, doa, dzikir, tahfidz, mood)
├── hooks/              # Custom hooks (usePermission, useTahfidz, dsb)
├── lib/                # QueryClient, helper
├── pages/              # Halaman per route
├── services/           # API clients (authApi, memberApi, domainApi, dsb)
├── types/              # TypeScript types
└── utils/              # Formatter, helper umum
```

---

## 🔧 Setup Development

### Prerequisites

- **Node.js** ≥ 20
- **Yarn**
- Backend Go jalan di `127.0.0.1:8080` (lihat README backend)

### Install

```bash
yarn install
```

### Konfigurasi Env

Copy `.env.example` → `.env.local`:

```bash
cp .env.example .env.local
```

Isi `VITE_API_BASE_URL` dengan endpoint backend. **Gunakan `127.0.0.1`, bukan `localhost`** (macOS IPv6 issue):

```env
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

### Run

```bash
yarn dev
```

Buka `http://127.0.0.1:5173`.

---

## 📜 Scripts

| Perintah         | Fungsi                                   |
| ---------------- | ---------------------------------------- |
| `yarn dev`       | Dev server (Vite HMR)                    |
| `yarn build`     | Type-check (`tsc -b`) + production build |
| `yarn build:dev` | Build dengan mode development            |
| `yarn preview`   | Preview hasil build lokal                |
| `yarn fetch-doa` | Regenerate data doa dari sumber          |

---

## 🧪 Verifikasi Sebelum Commit

```bash
npx tsc --noEmit
yarn build
```

Expected: `tsc` tanpa output, build `✓ built in ...` dengan PWA generated.

---

## 🚢 Deploy

Repo punya `vercel.json` — deploy otomatis via Vercel.

### Setup di Vercel

1. Import repo GitHub → framework preset **Vite**
2. Set env variable: `VITE_API_BASE_URL` → URL backend production
3. Build command & output default dari `vercel.json`

---

## 🔌 Kontrak API

Semua request pakai pola **single-endpoint dispatcher**:

```
POST {VITE_API_BASE_URL}
Content-Type: application/json

Body:
{
  "action": "login",
  "token": "...",
  ...params
}

Response:
{
  "success": true,
  "data": { ... },
  "message": ""
}
```

Implementasi: `src/services/api.ts` (`call<T>()` dengan retry otomatis).
Daftar action lengkap: `src/services/domainApi.ts`.

---

## 📚 Terkait

- **Backend Go** — [`../backend/go/README.md`](../backend/go/README.md)

---

## 📄 Lisensi

MIT
