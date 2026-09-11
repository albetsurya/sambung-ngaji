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

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${HARI_ID[d.getDay()]}, ${d.getDate()} ${BULAN_ID_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function getHariFromDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return HARI_ID[d.getDay()];
}

export function getMemberAge(tanggalLahir?: string): number | null {
  if (!tanggalLahir) return null;
  const d = new Date(tanggalLahir);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
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
