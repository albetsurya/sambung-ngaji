// Mapping hijaiyah alphabet data for games
import * as NEW from "../../../assets/ngaji-ceria-new/ngaji-ceria-tilawati/index";

export interface HijaiyahItem {
  id: string;
  name: string;
  arabic: string;
  transliteration: string;
  svg: string;
}

export const HIJAIYAH_LIST: HijaiyahItem[] = [
  { id: "alif", name: "Alif", arabic: "ا", transliteration: "A", svg: NEW.huruf01Alif },
  { id: "ba", name: "Ba", arabic: "ب", transliteration: "Ba", svg: NEW.huruf02Ba },
  { id: "ta", name: "Ta", arabic: "ت", transliteration: "Ta", svg: NEW.huruf03Ta },
  { id: "tsa", name: "Tsa", arabic: "ث", transliteration: "Tsa", svg: NEW.huruf04Tsa },
  { id: "jim", name: "Jim", arabic: "ج", transliteration: "Ja", svg: NEW.huruf05Jim },
  { id: "ha", name: "Ha", arabic: "ح", transliteration: "Ha", svg: NEW.huruf06Ha },
  { id: "kho", name: "Kho", arabic: "خ", transliteration: "Kho", svg: NEW.huruf07Kho },
  { id: "dal", name: "Dal", arabic: "د", transliteration: "Da", svg: NEW.huruf08Dal },
  { id: "dzal", name: "Dzal", arabic: "ذ", transliteration: "Dza", svg: NEW.huruf09Dzal },
  { id: "ro", name: "Ro", arabic: "ر", transliteration: "Ro", svg: NEW.huruf10Ro },
  { id: "zai", name: "Zai", arabic: "ز", transliteration: "Za", svg: NEW.huruf11Zai },
  { id: "sin", name: "Sin", arabic: "س", transliteration: "Sa", svg: NEW.huruf12Sin },
  { id: "syin", name: "Syin", arabic: "ش", transliteration: "Sya", svg: NEW.huruf13Syin },
  { id: "shod", name: "Shod", arabic: "ص", transliteration: "Sho", svg: NEW.huruf14Shod },
  { id: "dhod", name: "Dhod", arabic: "ض", transliteration: "Dho", svg: NEW.huruf15Dhod },
  { id: "tho", name: "Tho", arabic: "ط", transliteration: "Tho", svg: NEW.huruf16Tho },
  { id: "zho", name: "Zho", arabic: "ظ", transliteration: "Zho", svg: NEW.huruf17Zho },
  { id: "ain", name: "Ain", arabic: "ع", transliteration: "'A", svg: NEW.huruf18Ain },
  { id: "ghoin", name: "Ghoin", arabic: "غ", transliteration: "Gho", svg: NEW.huruf19Ghoin },
  { id: "fa", name: "Fa", arabic: "ف", transliteration: "Fa", svg: NEW.huruf20Fa },
  { id: "qof", name: "Qof", arabic: "ق", transliteration: "Qo", svg: NEW.huruf21Qof },
  { id: "kaf", name: "Kaf", arabic: "ك", transliteration: "Ka", svg: NEW.huruf22Kaf },
  { id: "lam", name: "Lam", arabic: "ل", transliteration: "La", svg: NEW.huruf23Lam },
  { id: "mim", name: "Mim", arabic: "م", transliteration: "Ma", svg: NEW.huruf24Mim },
  { id: "nun", name: "Nun", arabic: "ن", transliteration: "Na", svg: NEW.huruf25Nun },
  { id: "wau", name: "Wau", arabic: "و", transliteration: "Wa", svg: NEW.huruf26Wau },
  { id: "ha-kecil", name: "Ha", arabic: "ه", transliteration: "Ha", svg: NEW.huruf27HaKecil },
  { id: "ya", name: "Ya", arabic: "ي", transliteration: "Ya", svg: NEW.huruf28Ya },
];

export const JUZ_AMMA_QUIZ_DATA = [
  {
    id: 114,
    surahName: "An-Nas",
    ayatArabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    arti: "Katakanlah: Aku berlindung kepada Tuhannya manusia",
    options: ["An-Nas", "Al-Falaq", "Al-Ikhlas", "Al-Kafirun"],
  },
  {
    id: 113,
    surahName: "Al-Falaq",
    ayatArabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    arti: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh",
    options: ["Al-Falaq", "An-Nas", "Al-Ikhlas", "Al-Masad"],
  },
  {
    id: 112,
    surahName: "Al-Ikhlas",
    ayatArabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    arti: "Katakanlah: Dialah Allah, Yang Maha Esa",
    options: ["Al-Ikhlas", "Al-Falaq", "An-Nasr", "Al-Kafirun"],
  },
  {
    id: 111,
    surahName: "Al-Lahab",
    ayatArabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ",
    arti: "Binasalah kedua tangan Abu Lahab dan benar-benar binasa",
    options: ["Al-Lahab", "Al-Kafirun", "Al-Ma'un", "Al-Quraisy"],
  },
  {
    id: 110,
    surahName: "An-Nasr",
    ayatArabic: "إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ",
    arti: "Apabila telah datang pertolongan Allah dan kemenangan",
    options: ["An-Nasr", "Al-Kautsar", "Al-Fil", "Al-Ikhlas"],
  },
  {
    id: 108,
    surahName: "Al-Kautsar",
    ayatArabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
    arti: "Sungguh, Kami telah memberimu nikmat yang banyak",
    options: ["Al-Kautsar", "Al-Ma'un", "Al-Quraisy", "Al-Fil"],
  },
];
