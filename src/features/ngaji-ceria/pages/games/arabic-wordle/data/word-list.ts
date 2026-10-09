export const ARABIC_WORDS = [
  "مدرسة", "سلامة", "عبادة", "أمانة", "عقيدة", "شريعة", "حقيقة", "طريقة", "طهارة", "قراءة",
  "تلاوة", "سجادة", "مسبحة", "منارة", "أذكار", "أخلاق", "إحسان", "إخلاص", "مغفرة", "محراب",
  "أدعية", "آخرة", "نبينا", "عمارة", "نظافة", "سعادة", "هداية", "إقامة", "كرامة", "رسالة",
] as const;

export type ArabicWord = (typeof ARABIC_WORDS)[number];
export type TileStatus = "empty" | "correct" | "present" | "absent";

export const ARABIC_KEYBOARD = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك"],
  ["ئ", "ء", "ؤ", "أ", "إ", "آ", "ر", "ى", "ة", "و", "ز", "ظ", "ط", "د", "ذ"],
] as const;

export function normalizeArabic(value: string): string {
  return value.normalize("NFKC").replace(/[ًٌٍَُِّْـ]/g, "").replace(/[إأآ]/g, "ا");
}

export function wordLetters(value: string): string[] {
  return [...value];
}
