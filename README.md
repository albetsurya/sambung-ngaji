# Manajemen Pengajian & Biodata Jamaah

Aplikasi manajemen pengajian mobile-first: biodata jamaah, absensi cepat, monitoring
pembinaan, dan pengumuman WhatsApp otomatis. Frontend React + TypeScript + Tailwind,
backend Google Apps Script + Google Spreadsheet, foto disimpan di Google Drive.

## Status implementasi

Sudah jadi & terhubung end-to-end:

- Autentikasi (login/logout/session token) + 4 role dengan permission ditegakkan di backend
- CRUD jamaah + kategori otomatis (Caberawit/Pra Remaja/Remaja/Pra Nikah/Dewasa/Manula)
- Upload foto ke Google Drive
- Riwayat pendidikan (banyak baris per jamaah)
- Kelompok, jadwal pengajian (meetings)
- Absensi cepat (tap status → tersimpan, optimistic UI)
- Monitoring pembinaan (histori, tidak pernah terhapus)
- Pengumuman WhatsApp: template placeholder, generate, preview, copy, share
- Dashboard berbeda per role + attention list (indikator, bukan keputusan otomatis)
- Manajemen user & audit log (khusus Super Admin)
- Soft delete, mobile-first UI, PWA dasar

Belum diimplementasikan (fondasi sudah disiapkan agar mudah ditambahkan):

- Generate pengumuman mingguan otomatis dari UI (endpoint backend sudah ada: `generateWeeklyAnnouncements`)
- CV Ta'aruf khusus PRA_NIKAH (tab terpisah)
- Offline mode penuh untuk PWA
- Filter jamaah lanjutan (desa) di UI (sudah didukung backend)

## Struktur folder

```
frontend/    React + TypeScript + Tailwind (Vite)
backend/     Google Apps Script (.gs) — copy semua isinya ke Apps Script project
README.md
```

---

## 1. Setup Backend (Google Apps Script)

### a. Buat Spreadsheet & Apps Script project

1. Buat Google Spreadsheet baru di Google Drive (boleh kosong).
2. Buka **Extensions > Apps Script**.
3. Hapus isi default `Code.gs`, lalu buat file-file baru sesuai nama file di folder
   `backend/` (Code.gs, Config.gs, Setup.gs, Utils.gs, Repository.gs, Auth.gs, Members.gs,
   Education.gs, Groups.gs, Meetings.gs, Attendance.gs, Monitoring.gs, Announcements.gs,
   Upload.gs, Dashboard.gs, UsersSettingsAudit.gs) dan salin isinya masing-masing.
4. Buka `appsscript.json` (View > Show manifest file) dan samakan dengan `backend/appsscript.json`.

### b. Inisialisasi sheet

1. Di editor Apps Script, pilih fungsi `setupSpreadsheet` pada dropdown fungsi (dekat tombol Run).
2. Klik **Run**. Saat diminta izin, setujui akses ke Spreadsheet & Drive.
3. Ini otomatis membuat semua sheet (`users`, `members`, `member_education`, `groups`,
   `meetings`, `attendance`, `monitoring`, `announcements`, `announcement_templates`,
   `audit_logs`, `settings`, `sessions`) beserta header kolomnya, plus:
   - 1 user awal: **username `superadmin`, password `ganti123`** — segera ganti setelah login pertama.
   - 5 template pengumuman default.
   - Setting jadwal rutin (Minggu/Selasa/Kamis).
4. Aman dijalankan berkali-kali (tidak menimpa data yang sudah ada).

### c. Deploy sebagai Web App

1. Klik **Deploy > New deployment**.
2. Pilih tipe **Web app**.
3. Execute as: **Me**. Who has access: **Anyone** (agar bisa diakses dari frontend tanpa login Google).
4. Klik **Deploy**, salin URL yang muncul (formatnya `https://script.google.com/macros/s/XXXXX/exec`).
5. Setiap kali mengubah kode backend, buat **New deployment** lagi (atau gunakan "Manage deployments" >
   edit revisi pada deployment yang sama) agar perubahan aktif.

### d. Folder Google Drive untuk foto

Tidak perlu dibuat manual — folder bernama **"Pengajian - Foto Jamaah"** otomatis dibuat
di My Drive akun yang menjalankan script saat foto pertama diupload. Bila ingin folder lain,
ubah `DRIVE_FOLDER_NAME` di `Config.gs`.

### e. (Opsional) Standalone Apps Script project

Jika Apps Script project **tidak** dibuat dari dalam Spreadsheet (standalone project),
isi `SPREADSHEET_ID` di `Config.gs` dengan ID spreadsheet Anda (bagian di URL spreadsheet
antara `/d/` dan `/edit`).

---

## 2. Setup Frontend (React)

### a. Install & konfigurasi

```bash
cd frontend
npm install
cp .env.example .env
```

Isi `.env`:

```
VITE_API_BASE_URL=https://script.google.com/macros/s/XXXXX/exec
```

(gunakan URL Web App hasil deploy di langkah 1c)

### b. Jalankan development server

```bash
npm run dev
```

Buka `http://localhost:5173`. Login dengan `superadmin` / `ganti123`.

### c. Build production

```bash
npm run build
```

Hasil build ada di `frontend/dist/` — bisa di-hosting di Google Sites, Vercel, Netlify,
Firebase Hosting, GitHub Pages, atau server statis apa pun. Pastikan `VITE_API_BASE_URL`
sudah benar sebelum build (env variable di-bake saat build, bukan runtime).

---

## 3. Role & akun demo

Setelah login sebagai `superadmin`, buat user tambahan lewat menu **Lainnya > Manajemen User**
untuk masing-masing role: `ADMIN`, `TIM_PNKB`, `TIM_ABSENSI`. Permission setiap role
ditegakkan di backend (`Auth.gs` → `ROLE_PERMISSIONS`), bukan hanya disembunyikan di UI.

## 4. Cara kerja komunikasi frontend ↔ backend

Semua request dari frontend dikirim sebagai `POST` ke satu URL Web App dengan body
`{ action, token, ...params }`. Backend (`Code.gs`) membaca `action`, memvalidasi
`token` sesi, memeriksa permission role, lalu menjalankan handler yang sesuai dan
selalu mengembalikan `{ success, data, message }`.

## 5. Troubleshooting

- **"Unauthorized: sesi tidak valid"**: token kadaluarsa (default 12 jam) atau salah
  URL deployment. Login ulang / cek `VITE_API_BASE_URL`.
- **Data tidak muncul setelah edit sheet manual**: beberapa sheet (groups, settings,
  templates) di-cache 5 menit (`CacheService`). Tunggu atau jalankan
  `CacheService.getScriptCache().removeAll([...])` di editor Apps Script.
- **Error saat upload foto**: pastikan izin Drive sudah disetujui saat pertama kali
  menjalankan `setupSpreadsheet` / saat deployment meminta otorisasi ulang.
- **CORS error di browser**: pastikan deployment Web App diakses dengan opsi
  "Anyone" dan menggunakan URL `.../exec` (bukan `/dev`).
