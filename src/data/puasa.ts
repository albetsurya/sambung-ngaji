
export interface PuasaInfo {
  key: string;
  nama: string;
  deskripsi: string;
  keutamaan?: string;
  dalil?: string;
  tone: "accent" | "success" | "warning";
}

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

export interface PuasaDay {
  date: Date;
  iso: string;
  hijri: HijriDate | null;
  puasaList: PuasaInfo[];
  dayOffset: number;
}


export const PUASA_SENIN: PuasaInfo = {
  key: "senin",
  nama: "Puasa Senin",
  deskripsi: "Puasa sunnah hari Senin",
  keutamaan:
    "Rasulullah SAW biasa berpuasa pada hari Senin karena pada hari itu beliau dilahirkan dan wahyu pertama diturunkan.",
  dalil: "HR. Muslim 1162",
  tone: "accent",
};

export const PUASA_KAMIS: PuasaInfo = {
  key: "kamis",
  nama: "Puasa Kamis",
  deskripsi: "Puasa sunnah hari Kamis",
  keutamaan:
    "Pada hari Kamis amal-amal perbuatan dilaporkan kepada Allah, dan Rasulullah SAW senang amalnya dilaporkan dalam keadaan berpuasa.",
  dalil: "HR. Tirmidzi 747",
  tone: "accent",
};

export const PUASA_AYYAMUL_BIDH: PuasaInfo = {
  key: "ayyamul-bidh",
  nama: "Puasa Ayyamul Bidh",
  deskripsi: "Puasa hari ke-13, 14, 15 bulan Hijriah",
  keutamaan:
    "Barangsiapa berpuasa 3 hari setiap bulan (Ayyamul Bidh), seolah-olah ia berpuasa sepanjang tahun.",
  dalil: "HR. Bukhari 1979, Muslim 1159",
  tone: "success",
};

export const PUASA_TASUA: PuasaInfo = {
  key: "tasua",
  nama: "Puasa Tasu'a",
  deskripsi: "Puasa 9 Muharram",
  keutamaan:
    "Puasa sehari sebelum Asyura untuk menyelisihi kebiasaan Yahudi dalam berpuasa Asyura.",
  dalil: "HR. Muslim 1134",
  tone: "warning",
};

export const PUASA_ASYURA: PuasaInfo = {
  key: "asyura",
  nama: "Puasa Asyura",
  deskripsi: "Puasa 10 Muharram",
  keutamaan:
    "Menghapus dosa-dosa setahun yang telah lalu.",
  dalil: "HR. Muslim 1162",
  tone: "warning",
};

export const PUASA_TARWIYAH: PuasaInfo = {
  key: "tarwiyah",
  nama: "Puasa Tarwiyah",
  deskripsi: "Puasa 8 Dzulhijjah",
  keutamaan:
    "Termasuk puasa sunnah di 10 hari awal Dzulhijjah yang sangat dianjurkan.",
  dalil: "HR. Abu Dawud 2437",
  tone: "warning",
};

export const PUASA_ARAFAH: PuasaInfo = {
  key: "arafah",
  nama: "Puasa Arafah",
  deskripsi: "Puasa 9 Dzulhijjah",
  keutamaan:
    "Menghapus dosa setahun yang lalu dan setahun yang akan datang, khusus bagi yang tidak berhaji.",
  dalil: "HR. Muslim 1162",
  tone: "warning",
};

export const PUASA_SYAWAL: PuasaInfo = {
  key: "syawal",
  nama: "Puasa 6 Hari Syawal",
  deskripsi: "Puasa 6 hari di bulan Syawal",
  keutamaan:
    "Barangsiapa berpuasa Ramadhan lalu melanjutkan dengan 6 hari di bulan Syawal, seolah-olah ia berpuasa sepanjang tahun.",
  dalil: "HR. Muslim 1164",
  tone: "success",
};


let hijriFmtCache: Intl.DateTimeFormat | null = null;
let hijriMonthCache: Intl.DateTimeFormat | null = null;
let hijriSupported: boolean | null = null;

function checkHijriSupported(): boolean {
  if (hijriSupported !== null) return hijriSupported;
  try {
    const test = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    test.format(new Date());
    hijriSupported = true;
  } catch {
    hijriSupported = false;
  }
  return hijriSupported;
}

export function toHijri(date: Date): HijriDate | null {
  if (!checkHijriSupported()) return null;

  try {
    if (!hijriFmtCache) {
      hijriFmtCache = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
    if (!hijriMonthCache) {
      hijriMonthCache = new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
        month: "long",
      });
    }

    const parts = hijriFmtCache.formatToParts(date);
    const dayStr = parts.find((p) => p.type === "day")?.value ?? "";
    const monthStr = parts.find((p) => p.type === "month")?.value ?? "";
    const yearStr = parts.find((p) => p.type === "year")?.value ?? "";

    const day = Number(dayStr.replace(/[^\d]/g, ""));
    const month = Number(monthStr.replace(/[^\d]/g, ""));
    const year = Number(yearStr.replace(/[^\d]/g, ""));

    if (!day || !month || !year) return null;

    const monthName = hijriMonthCache.format(date).trim();

    return { day, month, year, monthName };
  } catch {
    return null;
  }
}


export function detectPuasa(date: Date, hijri: HijriDate | null): PuasaInfo[] {
  const result: PuasaInfo[] = [];
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 1) result.push(PUASA_SENIN);
  if (dayOfWeek === 4) result.push(PUASA_KAMIS);

  if (hijri) {
    const isTasyrik =
      hijri.month === 12 && hijri.day >= 11 && hijri.day <= 13;
    if (!isTasyrik && (hijri.day === 13 || hijri.day === 14 || hijri.day === 15)) {
      result.push(PUASA_AYYAMUL_BIDH);
    }

    if (hijri.month === 1) {
      if (hijri.day === 9) result.push(PUASA_TASUA);
      if (hijri.day === 10) result.push(PUASA_ASYURA);
    }

    if (hijri.month === 12) {
      if (hijri.day === 8) result.push(PUASA_TARWIYAH);
      if (hijri.day === 9) result.push(PUASA_ARAFAH);
    }

    if (hijri.month === 10 && hijri.day >= 2 && hijri.day <= 7) {
      result.push(PUASA_SYAWAL);
    }
  }

  const seen = new Set<string>();
  return result.filter((p) => {
    if (seen.has(p.key)) return false;
    seen.add(p.key);
    return true;
  });
}

export function getPuasaSchedule(
  startDate: Date,
  days: number,
): PuasaDay[] {
  const out: PuasaDay[] = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);

    const iso =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");

    const hijri = toHijri(d);
    const puasaList = detectPuasa(d, hijri);

    out.push({
      date: d,
      iso,
      hijri,
      puasaList,
      dayOffset: i,
    });
  }

  return out;
}


const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function formatDateShort(d: Date): string {
  return d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear();
}

export function formatDayName(d: Date): string {
  return HARI[d.getDay()];
}

export function formatRelative(dayOffset: number): string {
  if (dayOffset === 0) return "Hari ini";
  if (dayOffset === 1) return "Besok";
  if (dayOffset === 2) return "Lusa";
  return "Dalam " + dayOffset + " hari";
}

export function daysUntil(targetIso: string): number {
  const target = new Date(targetIso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}
