import type { PrayerSchedule, PrayerStatus } from "../data/prayers";
import { formatGameTime } from "../data/prayers";

const labels: Record<PrayerStatus, string> = { pending: "Menunggu", ontime: "Tepat waktu", late: "Terlambat", missed: "Terlewat" };
export function ScheduleRow({ prayer, status, gameMinutes, onPray }: { prayer: PrayerSchedule; status: PrayerStatus; gameMinutes: number; onPray: () => void }) {
  const available = status === "pending" && gameMinutes >= prayer.start && gameMinutes <= prayer.end;
  return <div className={`flex items-center gap-2 rounded-2xl border p-3 ${available ? "border-emerald-300 bg-emerald-500/15" : "border-white/10 bg-white/5"}`}><img src={prayer.icon} alt={prayer.name} className="w-8 h-8 object-contain" /><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{prayer.name}</p><p className="text-[10px] text-white/60">{formatGameTime(prayer.start)}–{formatGameTime(prayer.end)} · {labels[status]}</p></div><button type="button" disabled={!available} onClick={onPray} className="game-button min-h-9 px-3 text-xs bg-emerald-500">Sholat</button></div>;
}
