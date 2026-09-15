import type { Member, MemberCategory, Education } from "../types";

const HARI_ID = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/* Bulan singkat 3 huruf (Indonesia). */
const BULAN_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/* Bulan panjang (Indonesia). */
const BULAN_ID_FULL = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function getTodayIso(): string {
  return toLocalIso(new Date());
}

export function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIsoParts(
  dateStr?: string,
): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const iso = String(dateStr).slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: y, month: m, day: d };
}

/* -------------------------------------------------------------------------- */
/*                          FORMAT TANGGAL                                    */
/* -------------------------------------------------------------------------- */

/**
 * Format ISO: YYYY-MM-DD.
 * Dipakai untuk payload API / internal state (bukan display).
 * Contoh: "2026-09-15"
 */
export function formatDate(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/**
 * Format: DD-MM-YYYY (ringkas, angka).
 * Dipakai untuk badge, sub-label, list item.
 * Contoh: "15-09-2026", "06-01-1998"
 */
export function formatDateShort(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(p.day)}-${pad(p.month)}-${p.year}`;
}

/**
 * Format: D MMM YYYY (bulan singkat, day tanpa leading zero).
 * Dipakai untuk display compact yang butuh nama bulan.
 * Contoh: "6 Jun 1998", "15 Sep 2026"
 */
export function formatDateMedium(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  return `${p.day} ${BULAN_ID[p.month - 1]} ${p.year}`;
}

/**
 * Format: D MMMM YYYY (bulan panjang, day tanpa leading zero).
 * Dipakai untuk display formal / biodata / laporan.
 * Contoh: "6 Januari 2016", "15 September 2026"
 */
export function formatDateLongText(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  return `${p.day} ${BULAN_ID_FULL[p.month - 1]} ${p.year}`;
}

/**
 * Format: HARI, DD-MM-YYYY.
 * Dipakai untuk header / judul.
 * Contoh: "Senin, 15-09-2026"
 */
export function formatDateLong(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const d = new Date(p.year, p.month - 1, p.day);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${HARI_ID[d.getDay()]}, ${p.day} ${BULAN_ID_FULL[p.month - 1]} ${p.year}`;
}

export function getHariFromDate(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const d = new Date(p.year, p.month - 1, p.day);
  if (isNaN(d.getTime())) return "";
  return HARI_ID[d.getDay()];
}

/**
 * Format custom (flexible).
 * Tersedia: dd-mm-yyyy | dd/mm/yyyy | yyyy-mm-dd | dd MMM yyyy
 */
export function formatDateCustom(
  dateStr: string | undefined,
  format:
    | "dd-mm-yyyy"
    | "dd/mm/yyyy"
    | "yyyy-mm-dd"
    | "dd MMM yyyy" = "dd-mm-yyyy",
): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const pad = (n: number) => String(n).padStart(2, "0");

  switch (format) {
    case "dd-mm-yyyy":
      return `${pad(p.day)}-${pad(p.month)}-${p.year}`;
    case "dd/mm/yyyy":
      return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
    case "yyyy-mm-dd":
      return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
    case "dd MMM yyyy":
      return `${p.day} ${BULAN_ID[p.month - 1]} ${p.year}`;
    default:
      return `${pad(p.day)}-${pad(p.month)}-${p.year}`;
  }
}

/* -------------------------------------------------------------------------- */
/*                          USIA & KATEGORI                                   */
/* -------------------------------------------------------------------------- */

/**
 * Hitung usia dari tanggal lahir (ISO date yyyy-mm-dd).
 * Return null kalau tidak valid.
 */
export function getMemberAge(tanggalLahir?: string): number | null {
  const p = parseIsoParts(tanggalLahir);
  if (!p) return null;
  const now = new Date();
  let age = now.getFullYear() - p.year;
  const m = now.getMonth() + 1 - p.month;
  if (m < 0 || (m === 0 && now.getDate() < p.day)) age--;
  return age;
}

/**
 * Cermin dari getMemberCategory() backend — dipakai untuk preview UI
 * sebelum submit ke server.
 *
 * Logika (urutan prioritas):
 *  1. Sudah menikah:
 *     - 60+ tahun          → ISTIMEWA
 *     - < 60 tahun         → DEWASA
 *  2. Berdasarkan jenjang pendidikan:
 *     - PAUD / TK / SD     → CABERAWIT  (PAUD/TK selalu CABERAWIT apapun usia)
 *     - SMP                → PRA_REMAJA
 *     - SMA / SMK / MA     → REMAJA
 *  3. Fallback berdasarkan usia (untuk yang belum sekolah / jenjang kosong):
 *     - < 6 tahun          → BALITA
 *     - 6–12 tahun         → CABERAWIT
 *     - 13–15 tahun        → PRA_REMAJA
 *     - 16–18 tahun        → REMAJA
 *     - 60+ tahun          → ISTIMEWA
 *     - else               → PRA_NIKAH
 */
export function getMemberCategory(
  member: Partial<Member>,
  latestEducation?: Partial<Education>,
): MemberCategory | null {
  /* -------- 1. Sudah menikah -------- */
  if (member.is_nikah) {
    const age = getMemberAge(member.tanggal_lahir);
    return age !== null && age >= 60 ? "ISTIMEWA" : "DEWASA";
  }

  /* -------- 2. Berdasarkan jenjang pendidikan -------- */
  /* Prioritas: latestEducation.jenjang → member.jenjang_pendidikan */
  const jenjang = (
    latestEducation?.jenjang ||
    member.jenjang_pendidikan ||
    ""
  ).toUpperCase();

  if (jenjang === "PAUD" || jenjang === "TK") return "CABERAWIT";
  if (jenjang === "SD") return "CABERAWIT";
  if (jenjang === "SMP") return "PRA_REMAJA";
  if (jenjang === "SMA" || jenjang === "SMK" || jenjang === "MA")
    return "REMAJA";

  /* -------- 3. Fallback berdasarkan usia -------- */
  const age = getMemberAge(member.tanggal_lahir);
  if (age !== null && age >= 60) return "ISTIMEWA";
  if (age !== null && age < 6) return "BALITA";
  if (age !== null && age < 13) return "CABERAWIT";
  if (age !== null && age < 16) return "PRA_REMAJA";
  if (age !== null && age < 19) return "REMAJA";

  /* -------- 4. Default -------- */
  return "PRA_NIKAH";
}

/* -------------------------------------------------------------------------- */
/*                          HELPERS                                           */
/* -------------------------------------------------------------------------- */

export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return "";
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return digits;
}

export const CATEGORY_LABEL: Record<MemberCategory, string> = {
  BALITA: "Balita",
  CABERAWIT: "Caberawit",
  PRA_REMAJA: "Pra Remaja",
  REMAJA: "Remaja",
  PRA_NIKAH: "Pra Nikah",
  DEWASA: "Dewasa",
  ISTIMEWA: "Istimewa",
};

export function getCategoryLabel(
  category: MemberCategory | null | undefined,
): string {
  if (!category) return "-";
  return CATEGORY_LABEL[category] ?? "-";
}

export const ATTENDANCE_LABEL: Record<string, string> = {
  HADIR: "Hadir",
  IJIN: "Ijin",
  SAKIT: "Sakit",
  TANPA_KETERANGAN: "Alpa",
};

export const MONITORING_LABEL: Record<string, string> = {
  AKTIF: "Aktif",
  PERLU_PERHATIAN: "Perlu Perhatian",
  KURANG_AKTIF: "Kurang Aktif",
  TIDAK_AKTIF: "Tidak Aktif",
};

export function normalizeGender(value?: string | null): "L" | "P" | undefined {
  if (value === "L" || value === "P") return value;
  return undefined;
}

/**
 * Display name dengan sapaan Bapak/Ibu untuk usia >= 35.
 * Backend tetap pakai nama_lengkap — ini murni untuk tampilan.
 */
export function getDisplayName(member: Member): string {
  const usia = getMemberAge(member.tanggal_lahir);
  if (usia === null || usia < 35) return member.nama_lengkap;

  const jk = (member.jenis_kelamin || "").toUpperCase();
  if (jk === "L") return `Bapak ${member.nama_lengkap}`;
  if (jk === "P") return `Ibu ${member.nama_lengkap}`;
  return member.nama_lengkap;
}
