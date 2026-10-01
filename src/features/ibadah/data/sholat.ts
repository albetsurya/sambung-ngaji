export type WaktuSholat = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";
export type StatusSholat = "belum" | "tepat" | "telat" | "jamak" | "tidak";

export interface WaktuInfo {
  key: WaktuSholat;
  label: string;
  arab: string;
}

export const WAKTU_LIST: WaktuInfo[] = [
  { key: "subuh", label: "Subuh", arab: "الفجر" },
  { key: "dzuhur", label: "Dzuhur", arab: "الظهر" },
  { key: "ashar", label: "Ashar", arab: "العصر" },
  { key: "maghrib", label: "Maghrib", arab: "المغرب" },
  { key: "isya", label: "Isya", arab: "العشاء" },
];

export interface StatusInfo {
  key: StatusSholat;
  label: string;
  short: string;
  emoji: string;
  tone: "neutral" | "success" | "warning" | "accent" | "danger";
}

export const STATUS_LIST: StatusInfo[] = [
  { key: "belum", label: "Belum", short: "—", emoji: "○", tone: "neutral" },
  { key: "tepat", label: "Tepat Waktu", short: "✓", emoji: "✓", tone: "success" },
  { key: "telat", label: "Telat", short: "!", emoji: "!", tone: "warning" },
  { key: "jamak", label: "Jamak", short: "J", emoji: "J", tone: "accent" },
  { key: "tidak", label: "Tidak Sholat", short: "×", emoji: "×", tone: "danger" },
];

export function getStatusInfo(key: StatusSholat): StatusInfo {
  return STATUS_LIST.find((s) => s.key === key) ?? STATUS_LIST[0];
}


export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

export function formatDateId(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return iso;
  }
}
