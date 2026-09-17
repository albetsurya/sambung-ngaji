const BASE = "https://api.quran.com/api/v4";

export interface MushafVerse {
  id: number;
  verseKey: string;      // "1:1"
  surah: number;         // 1
  ayat: number;          // 1
  textUthmani: string;
  pageNumber: number;
  juzNumber: number;
}

export interface MushafPage {
  page: number;
  verses: MushafVerse[];
  /** Surah yang punya ayat 1 di halaman ini (untuk render judul surah) */
  surahStarts: { surah: number; ayat: number }[];
}

interface ApiVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  page_number: number;
  juz_number: number;
}

interface ApiResponse {
  verses: ApiVerse[];
}

/**
 * Fetch 1 halaman mushaf (1-604) dari quran.com API.
 * Halaman standar Mushaf Madinah (15 baris per halaman).
 */
export async function fetchMushafPage(page: number): Promise<MushafPage> {
  if (!Number.isInteger(page) || page < 1 || page > 604) {
    throw new Error("Nomor halaman tidak valid (1-604)");
  }
  const url = BASE + "/verses/by_page/" + page + "?fields=text_uthmani&per_page=100";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Gagal memuat halaman (HTTP " + res.status + ")");
  }
  const json = (await res.json()) as ApiResponse;
  if (!Array.isArray(json.verses)) {
    throw new Error("Response tidak valid");
  }

  const verses: MushafVerse[] = json.verses.map((v) => {
    const [s, a] = v.verse_key.split(":").map(Number);
    return {
      id: v.id,
      verseKey: v.verse_key,
      surah: s,
      ayat: a,
      textUthmani: v.text_uthmani.trim(),
      pageNumber: v.page_number,
      juzNumber: v.juz_number,
    };
  });

  const surahStarts: { surah: number; ayat: number }[] = [];
  for (const v of verses) {
    if (v.ayat === 1) {
      surahStarts.push({ surah: v.surah, ayat: 1 });
    }
  }

  return { page, verses, surahStarts };
}

/**
 * Konversi nomor surah + ayat → nomor halaman (untuk "Lompat ke surah").
 * Kita pakai data statis (mapping start page per surah) supaya tidak perlu API call.
 */
const SURAH_START_PAGE: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187,
  10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267,
  17: 282, 18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342,
  24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446,
  38: 453, 39: 458, 40: 467, 41: 477, 42: 483, 43: 489, 44: 496,
  45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518, 51: 520,
  52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542,
  59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556, 65: 558,
  66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572,
  73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583,
  80: 585, 81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591,
  87: 591, 88: 592, 89: 593, 90: 594, 91: 595, 92: 595, 93: 596,
  94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602,
  107: 602, 108: 602, 109: 603, 110: 603, 111: 603, 112: 604,
  113: 604, 114: 604,
};

export function surahToStartPage(surah: number): number {
  return SURAH_START_PAGE[surah] ?? 1;
}

/**
 * Konversi halaman → juz (untuk display header).
 * Pakai approximate — tampilkan juz dari ayat pertama halaman.
 */
export function juzFromPage(verses: MushafVerse[]): number {
  return verses[0]?.juzNumber ?? 1;
}
