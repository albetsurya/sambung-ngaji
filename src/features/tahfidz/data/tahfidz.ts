export type TahfidzKategori = "juz30" | "juz1" | "pilihan";

export interface TahfidzTarget {
  surah: number;
  namaLatin: string;
  arti: string;
  jumlahAyat: number;
  ayatStart: number;
  ayatEnd: number;
  kategori: TahfidzKategori;
}

export interface TahfidzKategoriInfo {
  key: TahfidzKategori;
  label: string;
  deskripsi: string;
  emoji: string;
}

export const TAHFIDZ_KATEGORI: TahfidzKategoriInfo[] = [
  {
    key: "juz30",
    label: "Juz 30",
    deskripsi: "Juz 'Amma, 37 surah pendek",
    emoji: "🌱",
  },
  {
    key: "juz1",
    label: "Juz 1",
    deskripsi: "Al-Fatihah + Al-Baqarah 1-141",
    emoji: "🌿",
  },
  {
    key: "pilihan",
    label: "Surah Pilihan",
    deskripsi: "Yasin, Ar-Rahman, Al-Waqi'ah, dll",
    emoji: "⭐",
  },
];


export const TAHFIDZ_TARGETS: TahfidzTarget[] = [
  { surah: 78, namaLatin: "An-Naba", arti: "Berita Besar", jumlahAyat: 40, ayatStart: 1, ayatEnd: 40, kategori: "juz30" },
  { surah: 79, namaLatin: "An-Nazi'at", arti: "Malaikat Pencabut", jumlahAyat: 46, ayatStart: 1, ayatEnd: 46, kategori: "juz30" },
  { surah: 80, namaLatin: "'Abasa", arti: "Bermuka Masam", jumlahAyat: 42, ayatStart: 1, ayatEnd: 42, kategori: "juz30" },
  { surah: 81, namaLatin: "At-Takwir", arti: "Menggulung", jumlahAyat: 29, ayatStart: 1, ayatEnd: 29, kategori: "juz30" },
  { surah: 82, namaLatin: "Al-Infitar", arti: "Terbelah", jumlahAyat: 19, ayatStart: 1, ayatEnd: 19, kategori: "juz30" },
  { surah: 83, namaLatin: "Al-Mutaffifin", arti: "Orang yang Curang", jumlahAyat: 36, ayatStart: 1, ayatEnd: 36, kategori: "juz30" },
  { surah: 84, namaLatin: "Al-Insyiqaq", arti: "Terbelah", jumlahAyat: 25, ayatStart: 1, ayatEnd: 25, kategori: "juz30" },
  { surah: 85, namaLatin: "Al-Buruj", arti: "Gugusan Bintang", jumlahAyat: 22, ayatStart: 1, ayatEnd: 22, kategori: "juz30" },
  { surah: 86, namaLatin: "At-Tariq", arti: "Bintang Subuh", jumlahAyat: 17, ayatStart: 1, ayatEnd: 17, kategori: "juz30" },
  { surah: 87, namaLatin: "Al-A'la", arti: "Yang Maha Tinggi", jumlahAyat: 19, ayatStart: 1, ayatEnd: 19, kategori: "juz30" },
  { surah: 88, namaLatin: "Al-Gasyiyah", arti: "Hari Kiamat", jumlahAyat: 26, ayatStart: 1, ayatEnd: 26, kategori: "juz30" },
  { surah: 89, namaLatin: "Al-Fajr", arti: "Fajar", jumlahAyat: 30, ayatStart: 1, ayatEnd: 30, kategori: "juz30" },
  { surah: 90, namaLatin: "Al-Balad", arti: "Negeri", jumlahAyat: 20, ayatStart: 1, ayatEnd: 20, kategori: "juz30" },
  { surah: 91, namaLatin: "Asy-Syams", arti: "Matahari", jumlahAyat: 15, ayatStart: 1, ayatEnd: 15, kategori: "juz30" },
  { surah: 92, namaLatin: "Al-Lail", arti: "Malam", jumlahAyat: 21, ayatStart: 1, ayatEnd: 21, kategori: "juz30" },
  { surah: 93, namaLatin: "Ad-Duha", arti: "Waktu Duha", jumlahAyat: 11, ayatStart: 1, ayatEnd: 11, kategori: "juz30" },
  { surah: 94, namaLatin: "Asy-Syarh", arti: "Melapangkan", jumlahAyat: 8, ayatStart: 1, ayatEnd: 8, kategori: "juz30" },
  { surah: 95, namaLatin: "At-Tin", arti: "Buah Tin", jumlahAyat: 8, ayatStart: 1, ayatEnd: 8, kategori: "juz30" },
  { surah: 96, namaLatin: "Al-'Alaq", arti: "Segumpal Darah", jumlahAyat: 19, ayatStart: 1, ayatEnd: 19, kategori: "juz30" },
  { surah: 97, namaLatin: "Al-Qadr", arti: "Kemuliaan", jumlahAyat: 5, ayatStart: 1, ayatEnd: 5, kategori: "juz30" },
  { surah: 98, namaLatin: "Al-Bayyinah", arti: "Bukti Nyata", jumlahAyat: 8, ayatStart: 1, ayatEnd: 8, kategori: "juz30" },
  { surah: 99, namaLatin: "Az-Zalzalah", arti: "Gempa", jumlahAyat: 8, ayatStart: 1, ayatEnd: 8, kategori: "juz30" },
  { surah: 100, namaLatin: "Al-'Adiyat", arti: "Kuda Perang", jumlahAyat: 11, ayatStart: 1, ayatEnd: 11, kategori: "juz30" },
  { surah: 101, namaLatin: "Al-Qari'ah", arti: "Hari Kiamat", jumlahAyat: 11, ayatStart: 1, ayatEnd: 11, kategori: "juz30" },
  { surah: 102, namaLatin: "At-Takasur", arti: "Bermegah-megahan", jumlahAyat: 8, ayatStart: 1, ayatEnd: 8, kategori: "juz30" },
  { surah: 103, namaLatin: "Al-'Asr", arti: "Waktu", jumlahAyat: 3, ayatStart: 1, ayatEnd: 3, kategori: "juz30" },
  { surah: 104, namaLatin: "Al-Humazah", arti: "Pengumpat", jumlahAyat: 9, ayatStart: 1, ayatEnd: 9, kategori: "juz30" },
  { surah: 105, namaLatin: "Al-Fil", arti: "Gajah", jumlahAyat: 5, ayatStart: 1, ayatEnd: 5, kategori: "juz30" },
  { surah: 106, namaLatin: "Quraisy", arti: "Suku Quraisy", jumlahAyat: 4, ayatStart: 1, ayatEnd: 4, kategori: "juz30" },
  { surah: 107, namaLatin: "Al-Ma'un", arti: "Barang Berguna", jumlahAyat: 7, ayatStart: 1, ayatEnd: 7, kategori: "juz30" },
  { surah: 108, namaLatin: "Al-Kausar", arti: "Nikmat Berlimpah", jumlahAyat: 3, ayatStart: 1, ayatEnd: 3, kategori: "juz30" },
  { surah: 109, namaLatin: "Al-Kafirun", arti: "Orang Kafir", jumlahAyat: 6, ayatStart: 1, ayatEnd: 6, kategori: "juz30" },
  { surah: 110, namaLatin: "An-Nasr", arti: "Pertolongan", jumlahAyat: 3, ayatStart: 1, ayatEnd: 3, kategori: "juz30" },
  { surah: 111, namaLatin: "Al-Lahab", arti: "Api Menyala", jumlahAyat: 5, ayatStart: 1, ayatEnd: 5, kategori: "juz30" },
  { surah: 112, namaLatin: "Al-Ikhlas", arti: "Kemurnian Iman", jumlahAyat: 4, ayatStart: 1, ayatEnd: 4, kategori: "juz30" },
  { surah: 113, namaLatin: "Al-Falaq", arti: "Waktu Subuh", jumlahAyat: 5, ayatStart: 1, ayatEnd: 5, kategori: "juz30" },
  { surah: 114, namaLatin: "An-Nas", arti: "Manusia", jumlahAyat: 6, ayatStart: 1, ayatEnd: 6, kategori: "juz30" },

  { surah: 1, namaLatin: "Al-Fatihah", arti: "Pembukaan", jumlahAyat: 7, ayatStart: 1, ayatEnd: 7, kategori: "juz1" },
  { surah: 2, namaLatin: "Al-Baqarah", arti: "Sapi Betina", jumlahAyat: 286, ayatStart: 1, ayatEnd: 141, kategori: "juz1" },

  { surah: 18, namaLatin: "Al-Kahf", arti: "Gua", jumlahAyat: 110, ayatStart: 1, ayatEnd: 110, kategori: "pilihan" },
  { surah: 36, namaLatin: "Yasin", arti: "Yaasin", jumlahAyat: 83, ayatStart: 1, ayatEnd: 83, kategori: "pilihan" },
  { surah: 55, namaLatin: "Ar-Rahman", arti: "Yang Maha Pengasih", jumlahAyat: 78, ayatStart: 1, ayatEnd: 78, kategori: "pilihan" },
  { surah: 56, namaLatin: "Al-Waqi'ah", arti: "Hari Kiamat", jumlahAyat: 96, ayatStart: 1, ayatEnd: 96, kategori: "pilihan" },
  { surah: 67, namaLatin: "Al-Mulk", arti: "Kerajaan", jumlahAyat: 30, ayatStart: 1, ayatEnd: 30, kategori: "pilihan" },
];


export function getTargetBySurah(surah: number): TahfidzTarget | undefined {
  return TAHFIDZ_TARGETS.find((t) => t.surah === surah);
}

export function getTargetsByKategori(
  kategori: TahfidzKategori,
): TahfidzTarget[] {
  return TAHFIDZ_TARGETS.filter((t) => t.kategori === kategori);
}

export function targetCount(target: TahfidzTarget): number {
  return target.ayatEnd - target.ayatStart + 1;
}

export const TOTAL_TARGET_AYAT = TAHFIDZ_TARGETS.reduce(
  (sum, t) => sum + targetCount(t),
  0,
);

export function ayatKey(surah: number, ayat: number): string {
  return surah + ":" + ayat;
}
