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

export function isShodaqohPostedAccount(name: unknown): boolean {
  const key = normalizeAccountName(name);
  return (SHODAQOH_POSTED_ACCOUNTS as readonly string[]).includes(key);
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
