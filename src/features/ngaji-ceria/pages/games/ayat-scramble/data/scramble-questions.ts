import { JUZ_AMMA_VERSES } from "../../juz-amma-speedrun/data/juz-amma-questions";

export interface ScrambleQuestion { id: string; words: string[]; surahName: string; ayahNumber: number; translation: string }
// TODO: review oleh ustadz/ustadzah. 24 ayat utuh, tanpa memotong lafadz.
export const SCRAMBLE_QUESTIONS: ScrambleQuestion[] = JUZ_AMMA_VERSES
  .filter((verse) => verse.arabic.split(" ").length >= 2)
  .map((verse) => ({ id: verse.id, words: verse.arabic.split(" "), surahName: verse.surahName, ayahNumber: verse.ayahNumber, translation: verse.translation }));
