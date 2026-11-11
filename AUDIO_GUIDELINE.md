# Panduan Sistem Audio Tilawati & Ngaji Ceria (Audio Guidelines for AI Agents)

> **DOKUMEN INI ADALAH PEDOMAN RESMI UNTUK PENGEMBANG DAN AI AGENT.**  
> Dokumen ini menjelaskan arsitektur, lokasi berkas, aturan integritas, dan alur resolusi audio pada proyek `tartila` dan `sambung-ngaji`.

---

## 1. Aturan Mutlak (Golden Rules for AI Agents)

1. **Sambung-Ngaji adalah Single Source of Truth (SSOT)**:
   - Direktori `sambung-ngaji/frontend/public/audio/tilawati/` adalah kebenaran mutlak (*the truth*).
   - Direktori `tartila/public/audio/tilawati/` harus selalu mencerminkan isi direktori `sambung-ngaji` secara identik (1:1 byte-for-byte dan hash level).
2. **Dilarang Menghidupkan Kembali `tilawati_modified`**:
   - Direktori `public/audio/tilawati_modified/` telah **dihapus dan dihentikan selamanya**.
   - **JANGAN PERNAH** membuat kembali folder tersebut, menulis skrip batch pitch-shift untuk menghasilkan audio baru di folder tersebut, atau menambahkan redirect URL ke `/audio/tilawati_modified/`.
   - Hanya gunakan URL kanonik: `/audio/tilawati/...`.
3. **Status Jilid yang Aktif**:
   - **Jilid 1, 2, dan 3**: **100% tuntas, valid, dan tersinkronisasi** dari `sambung-ngaji`.
   - **Jilid 4, 5, dan 6**: Masih menunggu giliran rilis (*follow-up*).
4. **Larangan Halusinasi Nama Berkas (No Guesswork)**:
   - **TIDAK SEMUA HALAMAN MEMILIKI 8 BARIS**.
   - Contoh nyata: Jilid 2 Halaman 1 hanya memiliki 6 baris (`hal1_baris_01.ogg` s/d `hal1_baris_06.ogg`). Baris 07 dan 08 **TIDAK ADA**.
   - Contoh nyata: Jilid 3 Halaman 1 hanya memiliki 7 baris (`hal1_baris_01.ogg` s/d `hal1_baris_07.ogg`). Baris 08 **TIDAK ADA**.
   - Setiap kali mereferensikan audio baris, AI Agent **WAJIB** mengecek fisik berkas di disk (`fs.existsSync`).

---

## 2. Struktur Direktori & Konvensi Penamaan

```
public/audio/
├── ngaji-ceria/
│   ├── bgm/                       # Background music (menu.ogg, quiz.ogg, battle.ogg)
│   └── sfx/                       # Sound effects (correct.ogg, wrong.ogg, streak.ogg, tap.ogg, dll.)
└── tilawati/                      # Audio Tilawati Murottal (SSOT dari sambung-ngaji)
    ├── jilid_1/ s/d jilid_6/
    │   └── hal{N}/
    │       ├── editor_{timestamp}_{id}.ogg  # Klip hasil pemotongan Timeline Editor (paling presisi)
    │       ├── hal{N}_baris_{01..08}.ogg    # Klip per baris halaman Tilawati
    │       ├── hal{N}_isi_full.ogg          # Audio master utuh 1 halaman
    │       ├── hal{N}_demo.ogg              # Audio peraga / pokok bahasan halaman
    │       ├── hal{N}_header_datar.ogg      # Potongan contoh nada datar
    │       ├── hal{N}_header_full.ogg       # Potongan contoh siklus nada lengkap
    │       └── hal{N}_footer_{01..02}.ogg   # Audio catatan kaidah bawah
    ├── prologues/                           # taawudz.ogg, basmalah.ogg
    ├── taawudz_basmalah.ogg
    ├── mapping.ts                           # Metadata konfigurasi audio jilid
    └── page_status.json                     # Status edit & review per halaman
```

---

## 3. Alur Resolusi Audio di Frontend

Setiap komponen pemutar audio (Kuis, Cek Audio, Lab Irama, dll.) mengikuti hierarki resolusi berikut:

```
                  ┌────────────────────────────────────────┐
                  │ Request Audio (Jilid, Page, Soal/Teks) │
                  └───────────────────┬────────────────────┘
                                      │
                   Ada Published Timeline di JSON?
                               /             \
                             Ya               Tidak
                            /                   \
        ┌───────────────────────────┐     ┌────────────────────────────┐
        │ Ambil editor_*.ogg        │     │ Cek Mapping Baris          │
        │ dari Published Timeline   │     │ (hal{N}_baris_{XX}.ogg)    │
        └───────────────────────────┘     └─────────────┬──────────────┘
                                                        │
                                           Berkas Baris Tersedia di Disk?
                                                    /            \
                                                  Ya              Tidak
                                                 /                  \
                                     ┌──────────────────┐  ┌─────────────────────┐
                                     │ Mainkan Berkas   │  │ Fallback ke Master  │
                                     │ Baris            │  │ (hal{N}_isi_full)   │
                                     │                  │  │ dengan offset waktu │
                                     └──────────────────┘  └─────────────────────┘
```

### Logika Kunci pada Kode:
- **`src/features/ngaji-ceria/data/tilawatiQuizData.ts`**:
  Fungsi `applyTimelineEdits` mengecek apakah suatu halaman sudah memiliki `published` di `tilawatiTimelineEdits.json`. Jika ada, soal langsung digantikan oleh soal timeline yang menunjuk ke berkas `editor_*.ogg`.
- **`src/features/ngaji-ceria/services/tilawatiAudio.ts`**:
  Fungsi `resolveTilawatiAudio(request)` mencari klip audio yang paling cocok dengan teks Arab soal.
- **`src/features/ngaji-ceria/utils/audioUrl.ts`**:
  Fungsi `getAudioUrl(url)` menerima path audio dan langsung mengembalikannya (tanpa manipulasi prefix atau redirect).

---

## 4. Peta Penggunaan Audio pada Fitur Tartila

| Fitur | Lokasi Komponen / Data | Sumber Data Audio |
| :--- | :--- | :--- |
| **Kuis Tilawati** | `src/features/ngaji-ceria/pages/NgajiCeriaQuizPage.tsx`<br>`src/features/ngaji-ceria/components/quiz-models/` | `tilawatiQuizData.ts` & `tilawatiTimelineEdits.json` |
| **Cek Audio** | `src/features/ngaji-ceria/pages/CekAudioContent.tsx` | `QUIZ_DATASETS` dari `tilawatiQuizData.ts` |
| **Lab Irama** | `src/features/ngaji-ceria/pages/LabIramaPage.tsx`<br>`src/features/ngaji-ceria/data/labIramaData.ts` | 39 file contoh irama (`halX_baris_YY.ogg`, `halX_header_*.ogg`) |
| **Preview Ustadz** | `src/features/ustadz/pages/UstadzMaterialPreviewPage.tsx` | `getTilawatiDataset(jilid)` via `tilawatiPageDatasets.ts` |
| **Peta & Adventure** | `src/features/ngaji-ceria/pages/explore/TilawatiMapPage.tsx`<br>`src/features/ngaji-ceria/pages/explore/TilawatiAdventurePage.tsx` | `tilawatiQuizData.ts` |
| **Mini Games** | `src/features/ngaji-ceria/data/arenaKartuData.ts`<br>`src/features/ngaji-ceria/data/rhythmMemoryData.ts` | Berkas audio per baris yang terverifikasi ada di disk |

---

## 5. Protokol Verifikasi Mandiri untuk AI Agent

Sebelum melakukan commit atau menyatakan tugas selesai, jalankan audit berikut:

### 1. Audit Referensi Audio Hilang (Missing Audio Check)
Jalankan skrip ini dari terminal root direktori `tartila`:
```bash
node -e "
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
let checked = 0, missing = 0;

function walk(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (item === 'node_modules' || item === '.git' || item === 'dist') continue;
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|jsx|json)$/.test(item)) {
      const content = fs.readFileSync(full, 'utf-8');
      const matches = content.match(/\/audio\/tilawati\/jilid_[1-3]\/[a-zA-Z0-9_\-\.\/]+\.ogg/g) || [];
      for (const m of matches) {
        checked++;
        if (!fs.existsSync(path.join(ROOT, 'public', m))) {
          console.error('MISSING in ' + path.relative(ROOT, full) + ': ' + m);
          missing++;
        }
      }
    }
  }
}
walk(path.join(ROOT, 'src'));
console.log('Jilid 1-3 checked: ' + checked + ', Missing: ' + missing);
process.exit(missing > 0 ? 1 : 0);
"
```
**Kriteria Lolos:** Output `Missing: 0` dan exit code `0`.

### 2. Audit Keselarasan dengan Sambung-Ngaji (Parity Check)
```bash
diff -rq ../sambung-ngaji/frontend/public/audio/tilawati/jilid_1 public/audio/tilawati/jilid_1
diff -rq ../sambung-ngaji/frontend/public/audio/tilawati/jilid_2 public/audio/tilawati/jilid_2
diff -rq ../sambung-ngaji/frontend/public/audio/tilawati/jilid_3 public/audio/tilawati/jilid_3
```
**Kriteria Lolos:** Tidak ada output yang dihasilkan (0 perbedaan berkas).
