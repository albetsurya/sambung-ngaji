import {
  iconSholatSubuh,
  iconSholatDzuhur,
  iconSholatAshar,
  iconSholatMaghrib,
  iconSholatIsya,
} from "@/assets/ngaji-ceria-new";

export interface PrayerSchedule { id: string; name: string; start: number; end: number; icon: string }
export const PRAYER_SCHEDULE: PrayerSchedule[] = [
  { id: "subuh", name: "Subuh", start: 270, end: 330, icon: iconSholatSubuh },
  { id: "dzuhur", name: "Dzuhur", start: 720, end: 780, icon: iconSholatDzuhur },
  { id: "ashar", name: "Ashar", start: 900, end: 990, icon: iconSholatAshar },
  { id: "maghrib", name: "Maghrib", start: 1080, end: 1125, icon: iconSholatMaghrib },
  { id: "isya", name: "Isya", start: 1140, end: 1230, icon: iconSholatIsya },
];
export type PrayerStatus = "pending" | "ontime" | "late" | "missed";
export const formatGameTime = (minutes: number): string => `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;
