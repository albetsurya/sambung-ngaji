import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
} from "adhan";

/* -------------------------------------------------------------------------- */
/*                              Konfigurasi                                   */
/* -------------------------------------------------------------------------- */

// Desa Latukan, Kec. Karanggeneng, Kab. Lamongan
export const LATUKAN_COORDS = { lat: -6.9879, lng: 112.3729 };
export const LATUKAN_LABEL = "Latukan, Karanggeneng, Lamongan";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type PrayerKey =
  | "fajr"
  | "sunrise"
  | "dhuhr"
  | "asr"
  | "maghrib"
  | "isha";

export interface PrayerInfo {
  key: PrayerKey;
  label: string;       // Subuh, Syuruq, Dzuhur, Ashar, Maghrib, Isya
  arabic: string;      // الفجر، الشروق، ...
  time: Date;
  timeFormatted: string; // "HH:MM"
}

export interface PrayerDay {
  date: Date;
  prayers: PrayerInfo[];
}

export interface NextPrayerInfo {
  prayer: PrayerInfo;
  remainingMs: number;
  remainingFormatted: string; // "HH:MM:SS"
}

export const PRAYER_LABELS: Record<PrayerKey, { label: string; arabic: string }> = {
  fajr: { label: "Subuh", arabic: "الفجر" },
  sunrise: { label: "Syuruq", arabic: "الشروق" },
  dhuhr: { label: "Dzuhur", arabic: "الظهر" },
  asr: { label: "Ashar", arabic: "العصر" },
  maghrib: { label: "Maghrib", arabic: "المغرب" },
  isha: { label: "Isya", arabic: "العشاء" },
};

/* -------------------------------------------------------------------------- */
/*                          Calculation Parameters                            */
/* -------------------------------------------------------------------------- */

/**
 * Parameter perhitungan untuk Kemenag RI:
 * - Fajr angle: 20° (bukan 18° standar Karachi)
 * - Isha angle: 18°
 * - Madhab: Shafi (Ashar: panjang bayangan = panjang benda)
 * - Ihtiyati +2 menit untuk semua waktu (kehati-hatian)
 */
function buildParams() {
  const params = CalculationMethod.Karachi();
  params.fajrAngle = 20;
  params.ishaAngle = 18;
  params.madhab = Madhab.Shafi;

  // Ihtiyati Kemenag: +2 menit di semua waktu
  params.adjustments.fajr = 2;
  params.adjustments.sunrise = 2;
  params.adjustments.dhuhr = 2;
  params.adjustments.asr = 2;
  params.adjustments.maghrib = 2;
  params.adjustments.isha = 2;

  return params;
}

/* -------------------------------------------------------------------------- */
/*                              Public API                                    */
/* -------------------------------------------------------------------------- */

/**
 * Hitung waktu sholat untuk tanggal tertentu.
 * Default koordinat Latukan — bisa di-override kalau nanti user bisa pilih lokasi.
 */
export function getPrayerTimesForDate(
  date: Date,
  lat: number = LATUKAN_COORDS.lat,
  lng: number = LATUKAN_COORDS.lng,
): PrayerDay {
  const coords = new Coordinates(lat, lng);
  const params = buildParams();
  const times = new PrayerTimes(coords, date, params);

  const prayers: PrayerInfo[] = [
    buildPrayer("fajr", times.fajr),
    buildPrayer("sunrise", times.sunrise),
    buildPrayer("dhuhr", times.dhuhr),
    buildPrayer("asr", times.asr),
    buildPrayer("maghrib", times.maghrib),
    buildPrayer("isha", times.isha),
  ];

  return { date, prayers };
}

function buildPrayer(key: PrayerKey, time: Date): PrayerInfo {
  const meta = PRAYER_LABELS[key];
  return {
    key,
    label: meta.label,
    arabic: meta.arabic,
    time,
    timeFormatted: formatTime(time),
  };
}

/**
 * Ambil sholat berikutnya dari waktu sekarang.
 * Sunrise (Syuruq) di-skip — bukan waktu sholat wajib.
 * Kalau semua sudah lewat hari ini → ambil Subuh besok.
 */
export function getNextPrayer(
  now: Date = new Date(),
  lat: number = LATUKAN_COORDS.lat,
  lng: number = LATUKAN_COORDS.lng,
): NextPrayerInfo {
  const today = getPrayerTimesForDate(now, lat, lng);

  const future = today.prayers.filter(
    (p) => p.key !== "sunrise" && p.time.getTime() > now.getTime(),
  );

  if (future.length > 0) {
    return buildNext(future[0], now);
  }

  // Semua sudah lewat → Subuh besok
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = getPrayerTimesForDate(tomorrow, lat, lng);
  const fajr = tomorrowDay.prayers.find((p) => p.key === "fajr")!;
  return buildNext(fajr, now);
}

function buildNext(prayer: PrayerInfo, now: Date): NextPrayerInfo {
  const remainingMs = Math.max(0, prayer.time.getTime() - now.getTime());
  return {
    prayer,
    remainingMs,
    remainingFormatted: formatDuration(remainingMs),
  };
}

/**
 * Cek apakah waktu `now` sedang masuk waktu sholat tertentu.
 * Dipakai untuk highlight card waktu yang sedang aktif.
 */
export function getCurrentPrayer(
  now: Date = new Date(),
  lat: number = LATUKAN_COORDS.lat,
  lng: number = LATUKAN_COORDS.lng,
): PrayerKey | null {
  const today = getPrayerTimesForDate(now, lat, lng);

  // Urutan waktu sholat (skip sunrise)
  const order: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const map = new Map(today.prayers.map((p) => [p.key, p.time] as const));

  let current: PrayerKey | null = null;
  for (const key of order) {
    const t = map.get(key);
    if (t && t.getTime() <= now.getTime()) {
      current = key;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Jadwal sebulan penuh — untuk halaman detail.
 */
export function getMonthlySchedule(
  year: number,
  month: number,
  lat: number = LATUKAN_COORDS.lat,
  lng: number = LATUKAN_COORDS.lng,
): PrayerDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const out: PrayerDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    out.push(getPrayerTimesForDate(new Date(year, month, d), lat, lng));
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/*                              Format Helpers                                */
/* -------------------------------------------------------------------------- */

export function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
