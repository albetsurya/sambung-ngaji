import { shuffle } from "../../_shared/random";
import { JUZ_AMMA_VERSES } from "../../juz-amma-speedrun/data/juz-amma-questions";

export interface HunterMission {
  id: string;
  words: string[];
  arabic: string;
  surahName: string;
  ayahNumber: number;
  translation: string;
}

export const HUNTER_MISSIONS: HunterMission[] = JUZ_AMMA_VERSES
  .map((verse) => ({ ...verse, words: verse.arabic.split(/\s+/) }))
  .filter((verse) => verse.words.length >= 2 && verse.words.length <= 6);

export const HUNTER_ROUNDS = 5;
export const HUNTER_SECONDS = 60;
export const ARENA_COLUMNS = 5;
export const ARENA_ROWS = 5;
export const START_CELL = 22;
// Semua lorong terhubung. Kata hanya ditempatkan di petak yang dapat dijangkau.
export const ARENA_WALLS = [6, 8, 16, 18];

export interface HunterToken { id: string; text: string; cell: number }

export function createHunterTokens(mission: HunterMission): HunterToken[] {
  const cells = shuffle(Array.from({ length: ARENA_COLUMNS * ARENA_ROWS }, (_, cell) => cell)
    .filter((cell) => cell !== START_CELL && !ARENA_WALLS.includes(cell)));
  const distractors = shuffle([...new Set(HUNTER_MISSIONS.flatMap((verse) => verse.words))]
    .filter((word) => !mission.words.includes(word))).slice(0, 3);
  return [...mission.words, ...distractors].map((text, index) => ({
    id: `${mission.id}:${index}`,
    text,
    cell: cells[index],
  }));
}

export function isAdjacentCell(from: number, to: number): boolean {
  if (!Number.isInteger(to) || to < 0 || to >= ARENA_COLUMNS * ARENA_ROWS || ARENA_WALLS.includes(to)) return false;
  const rowDistance = Math.abs(Math.floor(from / ARENA_COLUMNS) - Math.floor(to / ARENA_COLUMNS));
  const columnDistance = Math.abs(from % ARENA_COLUMNS - to % ARENA_COLUMNS);
  return rowDistance + columnDistance === 1;
}
