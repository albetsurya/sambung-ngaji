# INSTRUKSI OPTIMASI APLIKASI — SAMBUNG NGAJI

> **Catatan**: Instruksi ini bersifat tambahan untuk proses optimasi. Instruksi utama tetap mengikuti `~/.ai-agent/INSTRUKSI.txt` (sudah dipindahkan ke `.ai-agent/INSTRUKSI.txt` di root proyek).

---

## LOKASI REPOSITORI

| Repo | Path | Stack |
|------|------|-------|
| **REPO A — Backend** | `~/Documents/Productivity/Sabil/web/sambung-ngaji/backend/go` | Go 1.26, Fiber v2, PostgreSQL (pgx), JWT, zerolog |
| **REPO B — Frontend** | `~/Documents/Productivity/Sabil/web/sambung-ngaji/sambung-ngaji-frontend` | React 18, TypeScript, Vite, Tailwind, TanStack Query, PWA |

---

## FASE 0 — PERSIAPAN (WAJIB)

1. Baca **SEMUA** file instruksi di kedua repo:
   - `.ai-agent/` (dan subfolder) di masing-masing repo
   - `AGENTS.md` / `CLAUDE.md` / `.cursorrules` di root masing-masing repo
   - Folder instruksi di root induk (kalau ada)

2. Ringkas **sekali saja** ke user, dipisah per repo:
   - **REPO A (Go)**: build/test/lint/vet/run commands, konvensi Go, migrasi DB, larangan, verifikasi lulus
   - **REPO B (Frontend)**: framework/versi/bundler/package manager, dev/build/test/lint/typecheck, konvensi, larangan, verifikasi lulus

3. Kalau konflik antar file instruksi → **TANYA user dulu**

4. Setelah ringkasan, **JANGAN minta konfirmasi lagi** per langkah — jalan otonom.

---

## FASE 1 — BUAT CHECKLIST (2 checklist terpisah)

### CHECKLIST A — BACKEND (Go)

| ID | Area | Item | Est | Risiko | File Terkait |
|----|------|------|-----|--------|--------------|
| A1-1 | Perf | Query DB: N+1, missing index, SELECT *, prepared stmt | M | med | `internal/repository/*.go` |
| A1-2 | Perf | Caching (Redis/in-memory, TTL, invalidation) | M | med | `internal/service/*`, `internal/cache/` |
| A1-3 | Perf | Connection pool (DB, HTTP client, gRPC) | S | low | `internal/database/database.go` |
| A1-4 | Perf | Goroutine leak, context cancellation | M | med | `cmd/api/main.go`, `internal/service/*` |
| A1-5 | Perf | JSON marshal/unmarshal (streaming vs buffer) | S | low | `internal/api/response.go` |
| A1-6 | Perf | Kompresi response (gzip/brotli) | S | low | `cmd/api/main.go` (middleware) |
| A2-1 | Reliability | Error wrapping (`%w`), sentinel error, custom error type | M | low | `internal/errors/`, all services |
| A2-2 | Reliability | Timeout & retry dengan backoff (HTTP, DB) | M | med | `internal/ai/*`, `internal/database/` |
| A2-3 | Reliability | Graceful shutdown (signal handler, drain) | S | low | `cmd/api/main.go` |
| A2-4 | Reliability | Health check & readiness probe | S | low | `internal/handler/health.go` |
| A2-5 | Reliability | Rate limiting / circuit breaker | M | med | `internal/api/middleware.go` |
| A3-1 | Security | Input validation, SQL injection, SSRF | M | high | `internal/api/handler_*.go` |
| A3-2 | Security | Secret management (no hardcode) | S | high | `internal/config/config.go` |
| A3-3 | Security | JWT/session handling | S | high | `internal/auth/` |
| A3-4 | Security | CORS, CSRF | S | med | `cmd/api/main.go` |
| A3-5 | Security | Dependency vulnerability (`govulncheck`) | S | high | `go.mod`, `go.sum` |
| A4-1 | Code Quality | Dead code, unused import, duplikasi | S | low | all `*.go` |
| A4-2 | Code Quality | Error swallow (`_, err := ...` tanpa cek) | M | med | all services |
| A4-3 | Code Quality | Log level konsisten (structured logging) | S | low | `cmd/api/main.go`, services |
| A4-4 | Code Quality | Test coverage package kritis | L | med | `*_test.go` |
| A4-5 | Code Quality | Lint issue (`golangci-lint` / `staticcheck`) | S | low | all `*.go` |
| A5-1 | Observability | Structured log + correlation ID | M | low | `internal/api/middleware.go` |
| A5-2 | Observability | Metrics (Prometheus) endpoint kritis | M | med | `internal/api/middleware.go` |
| A5-3 | Observability | Tracing (OpenTelemetry) | L | med | `cmd/api/main.go` |
| A6-1 | Build/Deploy | Binary size (`ldflags -s -w`) | S | low | `Dockerfile` |
| A6-2 | Build/Deploy | Docker layer caching | S | low | `Dockerfile` |
| A6-3 | Build/Deploy | Migration strategy (up/down, idempotent) | M | med | `db/migration/` |

**Urutan prioritas**: (dampak/effort) tertinggi dulu → low-risk + high-impact優先.

### CHECKLIST B — FRONTEND

| ID | Area | Item | Est | Risiko | File Terkait |
|----|------|------|-----|--------|--------------|
| B1-1 | Perf Runtime | Re-render tidak perlu (React.memo, useMemo, useCallback, key benar) | M | low | `src/pages/*.tsx`, `src/components/**/*.tsx` |
| B1-2 | Perf Runtime | Code splitting per route (lazy/dynamic import) | S | low | `src/App.tsx` |
| B1-3 | Perf Runtime | Bundle size (bundle-analyzer, cari dep besar) | M | med | `package.json`, `vite.config.ts` |
| B1-4 | Perf Runtime | Image optimization (lazy load, webp/avif) | M | med | `src/components/common/Avatar.tsx`, `public/` |
| B1-5 | Perf Runtime | Virtualisasi list panjang | S | low | `src/pages/MembersListPage.tsx`, `src/pages/AttendancePage.tsx` |
| B1-6 | Perf Runtime | Debounce/throttle input & scroll | S | low | `src/hooks/` |
| B2-1 | Perf Loading | Prefetch route/data | S | low | `src/App.tsx`, `src/lib/queryClient.ts` |
| B2-2 | Perf Loading | Preload font kritikal (`font-display: swap`) | S | low | `index.html` |
| B2-3 | Perf Loading | Critical CSS inline | M | med | `vite.config.ts`, `index.html` |
| B2-4 | Perf Loading | Resource hint (preconnect, dns-prefetch) | S | low | `index.html` |
| B2-5 | Perf Loading | HTTP caching header static asset | S | low | `vite.config.ts`, `vercel.json`/`nginx.conf` |
| B3-1 | Perf Network | Request waterfall (paralel vs serial) | M | med | `src/lib/queryClient.ts`, services |
| B3-2 | Perf Network | Cache layer (react-query staleTime) | S | low | `src/lib/queryClient.ts` |
| B3-3 | Perf Network | Payload size (hapus field tidak dipakai) | M | med | `src/services/*.ts`, API contracts |
| B3-4 | Perf Network | Pagination / infinite scroll | S | low | `src/pages/MembersListPage.tsx` |
| B3-5 | Perf Network | Error boundary + retry | M | med | `src/App.tsx`, `src/components/common/ErrorBoundary.tsx` |
| B4-1 | UX | Loading state (skeleton, bukan spinner) | M | low | `src/components/common/Skeleton.tsx` |
| B4-2 | UX | Empty state & error state jelas | S | low | `src/components/common/States.tsx` |
| B4-3 | UX | Optimistic update | M | med | `src/hooks/use*.ts`, mutations |
| B4-4 | UX | Aksesibilitas (aria-label, keyboard nav, kontras) | M | low | all components |
| B4-5 | UX | Responsive breakpoint konsisten | S | low | `tailwind.config.js`, components |
| B5-1 | Code Quality | Dead code, unused import, komponen duplikat | S | low | all `*.tsx` |
| B5-2 | Code Quality | Type safety (hindari `any`, strict mode) | M | med | all `*.tsx` |
| B5-3 | Code Quality | Konsistensi styling | S | low | all `*.tsx` |
| B5-4 | Code Quality | ESLint / TypeScript error = 0 | M | med | `eslint.config.mjs`, `tsconfig.json` |
| B5-5 | Code Quality | Test komponen kritis | L | med | `*.test.tsx`, `*.spec.tsx` |
| B6-1 | SEO/Meta | Title & meta description per halaman | S | low | `index.html`, route meta |
| B6-2 | SEO/Meta | OpenGraph & Twitter card | S | low | `index.html` |
| B6-3 | SEO/Meta | Structured data (JSON-LD) | M | low | `index.html` |
| B6-4 | SEO/Meta | Sitemap & robots.txt | S | low | `public/robots.txt`, `scripts/generate-sitemap.ts` |
| B6-5 | SEO/Meta | Canonical URL | S | low | `index.html` |
| B7-1 | Build | Tree shaking aktif | S | low | `vite.config.ts` |
| B7-2 | Build | Source map hanya di dev | S | low | `vite.config.ts` |
| B7-3 | Build | Env var tidak bocor ke client bundle | S | high | `vite.config.ts`, `src/services/*.ts` |

**Urutan prioritas**: (dampak/effort) tertinggi dulu → low-risk + high-impact優先.

---

## FASE 2 — LOOP OTONOM

### Per Repo (Backend dulu, lalu Frontend)

UNTUK SETIAP ITEM DI CHECKLIST:

1. **Baca kode terkait**. Kalau 2+ pendekatan, pilih yang:
   - Paling sesuai konvensi `.ai-agent/` repo itu
   - Paling kecil diff-nya
   - Paling mudah di-revert
   - **Jangan tanya user — langsung pilih terbaik**

2. **Implement perubahan**

3. **Jalankan verifikasi minimal**:

   **REPO A (Go):**
   ```bash
   gofmt -w .
   go build ./...
   go vet ./...
   go test ./... -race
   golangci-lint run
   staticcheck ./...
   govulncheck ./...
   ```

   **REPO B (Frontend):**
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```

4. **Kalau SEMUA hijau:**
   - Tandai `[x]`
   - Commit 1 commit kecil: `perf(<scope>): <deskripsi>`
   - Lanjut OTOMATIS ke item berikutnya

5. **Kalau GAGAL:**
   - Revert perubahan item ini (`git checkout -- <file>` atau `git stash`)
   - Tandai `[!] + alasan + output error`
   - **LANJUT ke item berikutnya (jangan berhenti)**

6. **Kalau butuh keputusan ambigu** (arsitektur, breaking change, migrasi DB, ganti library):
   - Tandai `[?]`
   - SKIP, lanjut ke berikutnya
   - Kumpulkan di akhir untuk user review

---

## FASE 3 — LAPORAN AKHIR

Setelah KEDUA repo selesai, tampilkan:

### RINGKASAN REPO A (Go)
- Total: N item
- Selesai `[x]`: ...
- Gagal `[!]`: ... + alasan
- Perlu review `[?]`: ... + pertanyaan
- `git diff --stat`
- `git log --oneline -N`

### RINGKASAN REPO B (Frontend)
- Total: N item
- Selesai `[x]`: ...
- Gagal `[!]`: ... + alasan
- Perlu review `[?]`: ... + pertanyaan
- Bundle size sebelum vs sesudah (dari output build)
- `git diff --stat`
- `git log --oneline -N`

### REKOMENDASI LANJUTAN
Item yang butuh keputusan user, plus saran urutan review.

---

## ATURAN KETAT

- ❌ JANGAN commit kalau test/lint/build gagal
- ❌ JANGAN skip verifikasi walau perubahan "kelihatan sepele"
- ❌ JANGAN ubah file di `.ai-agent/` (di repo manapun)
- ❌ JANGAN install dependency baru tanpa cek `go.mod` / `package.json`
- ❌ JANGAN refactor besar di luar scope item
- ❌ JANGAN campur commit antara REPO A dan REPO B
- ✅ 1 item = 1 commit kecil
- ✅ Kalau ragu 2 opsi → pilih yang lebih konservatif
- ✅ Jalan sampai KEDUA checklist habis, baru lapor

---

## PERINTAH CEPAT (COPY-PASTE READY)

### Backend
```bash
cd ~/Documents/Productivity/Sabil/web/sambung-ngaji/backend/go
gofmt -w . && go build ./... && go vet ./... && go test ./... -race && golangci-lint run && staticcheck ./... && govulncheck ./...
```

### Frontend
```bash
cd ~/Documents/Productivity/Sabil/web/sambung-ngaji/sambung-ngaji-frontend
npm run lint && npx tsc --noEmit && npm run build
```

---

## FORMAT BALASAN DIHARAPKAN

1. Output perintah verifikasi
2. Kalau error → paste full error
3. Konfirmasi item selanjutnya / status `[x]/[!]/[?]`

---

*File ini dibuat sebagai panduan optimasi. Instruksi utama tetap mengikuti `.ai-agent/INSTRUKSI.txt`.*