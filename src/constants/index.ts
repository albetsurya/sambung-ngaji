export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const MEMBER_CATEGORIES = [
  "BALITA",
  "CABERAWIT",
  "PRA_REMAJA",
  "REMAJA",
  "PRA_NIKAH",
  "DEWASA",
  "ISTIMEWA",
] as const;

export const ATTENDANCE_STATUSES = [
  "HADIR",
  "IZIN",
  "SAKIT",
  "ALPA",
  "DISPENSASI",
] as const;

export const MONITORING_STATUSES = [
  "AKTIF",
  "PERLU_PERHATIAN",
  "KURANG_AKTIF",
  "TIDAK_AKTIF",
] as const;

export const JADWAL_RUTIN = ["Minggu", "Selasa", "Kamis"];
