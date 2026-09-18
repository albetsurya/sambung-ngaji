export interface JuzStart {
  juz: number;
  surah: number;
  ayat: number;
  surahNama: string;
}

/**
 * Titik awal 30 juz — mapping standar mushaf Madinah.
 * Dipakai untuk navigasi "Lompat ke Juz N".
 */
export const JUZ_LIST: JuzStart[] = [
  { juz: 1, surah: 1, ayat: 1, surahNama: "Al-Fatihah" },
  { juz: 2, surah: 2, ayat: 142, surahNama: "Al-Baqarah" },
  { juz: 3, surah: 2, ayat: 253, surahNama: "Al-Baqarah" },
  { juz: 4, surah: 3, ayat: 92, surahNama: "Ali 'Imran" },
  { juz: 5, surah: 4, ayat: 24, surahNama: "An-Nisa" },
  { juz: 6, surah: 4, ayat: 148, surahNama: "An-Nisa" },
  { juz: 7, surah: 5, ayat: 82, surahNama: "Al-Ma'idah" },
  { juz: 8, surah: 6, ayat: 111, surahNama: "Al-An'am" },
  { juz: 9, surah: 7, ayat: 88, surahNama: "Al-A'raf" },
  { juz: 10, surah: 8, ayat: 41, surahNama: "Al-Anfal" },
  { juz: 11, surah: 9, ayat: 93, surahNama: "At-Taubah" },
  { juz: 12, surah: 11, ayat: 6, surahNama: "Hud" },
  { juz: 13, surah: 12, ayat: 53, surahNama: "Yusuf" },
  { juz: 14, surah: 15, ayat: 1, surahNama: "Al-Hijr" },
  { juz: 15, surah: 17, ayat: 1, surahNama: "Al-Isra" },
  { juz: 16, surah: 18, ayat: 75, surahNama: "Al-Kahf" },
  { juz: 17, surah: 21, ayat: 1, surahNama: "Al-Anbiya" },
  { juz: 18, surah: 23, ayat: 1, surahNama: "Al-Mu'minun" },
  { juz: 19, surah: 25, ayat: 21, surahNama: "Al-Furqan" },
  { juz: 20, surah: 27, ayat: 56, surahNama: "An-Naml" },
  { juz: 21, surah: 29, ayat: 46, surahNama: "Al-Ankabut" },
  { juz: 22, surah: 33, ayat: 31, surahNama: "Al-Ahzab" },
  { juz: 23, surah: 36, ayat: 28, surahNama: "Yasin" },
  { juz: 24, surah: 39, ayat: 32, surahNama: "Az-Zumar" },
  { juz: 25, surah: 41, ayat: 47, surahNama: "Fussilat" },
  { juz: 26, surah: 46, ayat: 1, surahNama: "Al-Ahqaf" },
  { juz: 27, surah: 51, ayat: 31, surahNama: "Az-Zariyat" },
  { juz: 28, surah: 58, ayat: 1, surahNama: "Al-Mujadilah" },
  { juz: 29, surah: 67, ayat: 1, surahNama: "Al-Mulk" },
  { juz: 30, surah: 78, ayat: 1, surahNama: "An-Naba" },
];
