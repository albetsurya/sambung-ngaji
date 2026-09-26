import type { AttendanceStatus } from "../types";

export interface AttendanceSnapshot {
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceAnalysis {
  last30Total: number;
  last30Hadir: number;
  last30Rate: number;
  sakitStreak: number;
  alpaStreak: number;
  ijinStreak: number;
  suggestions: string[];
  suggestedCatatan: string;
  hasWarning: boolean;
}


const MIN_ATTENDANCE_FOR_RATE = 3;
const RATE_THRESHOLD = 50;
const SAKIT_STREAK_THRESHOLD = 3;
const ALPA_STREAK_THRESHOLD = 5;
const IJIN_STREAK_THRESHOLD = 5;


export function analyzeAttendance(
  attendance: AttendanceSnapshot[],
  now: Date = new Date(),
): AttendanceAnalysis {
  const valid = attendance.filter((a) => a.date && a.status);
  const sorted = [...valid].sort((a, b) => b.date.localeCompare(a.date));

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const last30 = sorted.filter((a) => a.date >= cutoffStr);
  const last30Total = last30.length;
  const last30Hadir = last30.filter((a) => a.status === "HADIR").length;
  const last30Rate =
    last30Total > 0 ? Math.round((last30Hadir / last30Total) * 100) : 0;

  function currentStreak(status: AttendanceStatus): number {
    let count = 0;
    for (const item of sorted) {
      if (item.status === status) count++;
      else break;
    }
    return count;
  }

  const sakitStreak = currentStreak("SAKIT");
  const alpaStreak = currentStreak("ALPA");
  const ijinStreak = currentStreak("IZIN");

  const suggestions: string[] = [];

  if (alpaStreak >= ALPA_STREAK_THRESHOLD) {
    suggestions.push(
      `Tidak hadir tanpa keterangan ${alpaStreak}x berturut-turut. Mohon dihubungi dan ditanyakan kondisinya.`,
    );
  }

  if (sakitStreak >= SAKIT_STREAK_THRESHOLD) {
    suggestions.push(
      `Sedang sakit selama ${sakitStreak} pertemuan berturut-turut. Mari kita doakan kesembuhannya.`,
    );
  }

  if (ijinStreak >= IJIN_STREAK_THRESHOLD) {
    suggestions.push(
      `Izin ${ijinStreak}x berturut-turut. Mari doakan agar diberikan kelapangan waktu untuk hadir kembali.`,
    );
  }

  if (last30Total >= MIN_ATTENDANCE_FOR_RATE && last30Rate < RATE_THRESHOLD) {
    suggestions.push(
      `Kehadiran 30 hari terakhir ${last30Rate}% (${last30Hadir}/${last30Total}). Perlu perhatian khusus.`,
    );
  }

  return {
    last30Total,
    last30Hadir,
    last30Rate,
    sakitStreak,
    alpaStreak,
    ijinStreak,
    suggestions,
    suggestedCatatan: suggestions.join("\n\n"),
    hasWarning: suggestions.length > 0,
  };
}
