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

export function formatDate(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function formatDateShort(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(p.day)} ${BULAN_ID[p.month - 1]} ${p.year}`;
}

export function formatDateLong(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const d = new Date(p.year, p.month - 1, p.day);
  if (isNaN(d.getTime())) return "";
  return `${HARI_ID[d.getDay()]}, ${p.day} ${BULAN_ID_FULL[p.month - 1]} ${p.year}`;
}

export function getHariFromDate(dateStr?: string): string {
  const p = parseIsoParts(dateStr);
  if (!p) return "";
  const d = new Date(p.year, p.month - 1, p.day);
  if (isNaN(d.getTime())) return "";
  return HARI_ID[d.getDay()];
}

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

export function getMemberAge(tanggalLahir?: string): number | null {
  const p = parseIsoParts(tanggalLahir);
  if (!p) return null;
  const now = new Date();
  let age = now.getFullYear() - p.year;
  const m = now.getMonth() + 1 - p.month;
  if (m < 0 || (m === 0 && now.getDate() < p.day)) age--;
  return age;
}

/** Cermin dari getMemberCategory() backend — dipakai untuk preview UI sebelum submit ke server. */
export function getMemberCategory(
  member: Partial<Member>,
  latestEducation?: Partial<Education>,
): MemberCategory | null {
  if (member.is_nikah) {
    const age = getMemberAge(member.tanggal_lahir);
    return age !== null && age >= 60 ? "MANULA" : "DEWASA";
  }
  const jenjang = (latestEducation?.jenjang || "").toUpperCase();
  if (jenjang === "TK" || jenjang === "SD") return "CABERAWIT";
  if (jenjang === "SMP") return "PRA_REMAJA";
  if (jenjang === "SMA" || jenjang === "SMK") return "REMAJA";

  const age = getMemberAge(member.tanggal_lahir);
  if (age !== null && age >= 60) return "MANULA";
  if (age !== null && age < 13) return "CABERAWIT";
  return "PRA_NIKAH";
}

export function normalizePhoneNumber(raw?: string): string {
  if (!raw) return "";
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (!digits.startsWith("62")) digits = "62" + digits;
  return digits;
}

export const CATEGORY_LABEL: Record<MemberCategory, string> = {
  CABERAWIT: "Caberawit",
  PRA_REMAJA: "Pra Remaja",
  REMAJA: "Remaja",
  PRA_NIKAH: "Pra Nikah",
  DEWASA: "Dewasa",
  MANULA: "Manula",
};

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
