import type { Transaction } from "../api/financeApi";

/* ------------------------------------------------------------------ */
/* Akun kas pindahan shodaqoh (hasil audit backend DuePostToCash).      */
/* Posting otomatis membuat jurnal DEBIT + KREDIT memakai akun-akun ini */
/* dengan description ber-marker POSTED_SHODAQOH_YYYY-MM. Chip kategori  */
/* di halaman rincian default-nya TIDAK mencentang akun-akun ini agar   */
/* rincian transaksi manual tidak tercampur jurnal otomatis.            */
/* ------------------------------------------------------------------ */
export const SHODAQOH_POSTED_ACCOUNTS = [
  "INFAQ SHODAQOH IR",
  "UANG SAMBUNG",
  "JIMPITAN",
  "SIAR-SIAR",
  "SERIBUAN",
  "KAFAN",
  "UKHRO MT",
  "DANA KESEHATAN",
] as const;

export function normalizeAccountName(name: unknown): string {
  return String(name ?? "").trim().toUpperCase();
}

/* Kata kunci pelengkap: akun legacy dari spreadsheet memakai varian nama */
/* ("Pemasukan/Setor Uang Sambung", "Infak IR", "Infak Seribuan", dsb)   */
/* sehingga pencocokan persis saja tidak cukup. "INFAQ JAMAAH" manual    */
/* tidak ikut tercocok (tidak mengandung kata kunci di bawah).           */
const SHODAQOH_ACCOUNT_KEYWORDS = [
  "SHODAQOH",
  "SAMBUNG",
  "JIMPITAN",
  "SIAR",
  "SERIBU",
  "KAFAN",
  "UKHRO",
  "KESEHATAN",
] as const;

export function isShodaqohPostedAccount(name: unknown): boolean {
  const key = normalizeAccountName(name);
  if (!key) return false;
  if ((SHODAQOH_POSTED_ACCOUNTS as readonly string[]).includes(key))
    return true;
  if (
    (SHODAQOH_ACCOUNT_KEYWORDS as readonly string[]).some((k) =>
      key.includes(k),
    )
  )
    return true;
  // "Infak IR" / "Infaq IR" tanpa kata Shodaqoh.
  return /\bIR\b/.test(key);
}

/* Akun sistem: tidak ditawarkan di select tambah/edit. */
export function isSystemAccount(name: unknown): boolean {
  return normalizeAccountName(name) === "SALDO AWAL";
}

/* Seed kategori umum; hanya dipakai sebagai opsi awal bila histori      */
/* kelompok belum punya akun lain. Histori selalu digabung di atasnya.  */
export const DEFAULT_CASH_ACCOUNTS = [
  "INFAQ JAMAAH",
  "KONSUMSI",
  "LISTRIK",
  "PERLENGKAPAN",
  "KEGIATAN DAKWAH",
  "LAIN-LAIN",
] as const;

/**
 * Opsi select kategori: union akun histori + seed default.
 * - Unik (case-insensitive, tampilan memakai ejaan pertama yang ditemui).
 * - "SALDO AWAL" & nama kosong dibuang, kecuali sedang dipakai (mode edit).
 * - Nilai current yang tak dikenal ikut disertakan agar select tidak blank.
 */
export function cashAccountOptions(
  transactions: Transaction[],
  current?: string,
): string[] {
  const seen = new Map<string, string>();
  const push = (raw: unknown) => {
    const name = String(raw ?? "").trim();
    if (!name) return;
    const key = name.toUpperCase();
    if (!seen.has(key)) seen.set(key, name);
  };
  DEFAULT_CASH_ACCOUNTS.forEach(push);
  transactions.forEach((t) => push(t.account_name));
  if (current?.trim()) push(current);
  const currentKey = normalizeAccountName(current);
  return [...seen.values()]
    .filter((name) => {
      const key = name.toUpperCase();
      if (key === "SALDO AWAL" && key !== currentKey) return false;
      return true;
    })
    .sort((a, b) => a.localeCompare(b, "id"));
}
