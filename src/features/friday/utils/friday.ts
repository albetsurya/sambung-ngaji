import type { FridaySchedule } from "../../../types";
import { formatDateLong } from "../../../utils/format";

export interface FridayRole {
  key: keyof Pick<
    FridaySchedule,
    "sermon_leader" | "muadzin" | "advisor" | "parking_attendant" | "footwear_attendant"
  >;
  label: string;
  short: string;
}

export const FRIDAY_ROLES: FridayRole[] = [
  { key: "sermon_leader", label: "Khatib / Imam", short: "Khatib" },
  { key: "muadzin", label: "Muadzin", short: "Muadzin" },
  { key: "advisor", label: "Penasihat", short: "Penasihat" },
  { key: "parking_attendant", label: "Petugas Parkir", short: "Parkir" },
  { key: "footwear_attendant", label: "Penata Sandal", short: "Sandal" },
];

export function missingRoles(s: FridaySchedule): FridayRole[] {
  return FRIDAY_ROLES.filter((r) => !(s[r.key] || "").trim());
}

export function isFridayComplete(s: FridaySchedule): boolean {
  return missingRoles(s).length === 0;
}

export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function isFridayDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return new Date(iso + "T00:00:00").getDay() === 5;
}

export function buildFridayMessage(s: FridaySchedule): string {
  const v = (x: string) => (x || "").trim() || "(belum diisi)";
  return [
    "╔════════════════════╗",
    "🕌 JADWAL PETUGAS SHALAT JUMAT",
    `🗓️ ${formatDateLong(s.date)}`,
    "╚════════════════════╝",
    "",
    `👤 Khatib & Imam : ${v(s.sermon_leader)}`,
    `🎙️ Muadzin          : ${v(s.muadzin)}`,
    `📖 Penasihat        : ${v(s.advisor)}`,
    `🚗 Petugas Parkir : ${v(s.parking_attendant)}`,
    `👞 Penata Sandal : ${v(s.footwear_attendant)}`,
    "",
    "Semoga Allah ﷻ memberikan pahala dan kebarokahan.",
    "",
    "جزاكم الله خيرًا",
  ].join("\n");
}
