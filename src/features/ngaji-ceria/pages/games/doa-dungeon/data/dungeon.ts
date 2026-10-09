import { DOA_HARIAN } from "../../../../../doa-dzikir/data/doa-harian";
import { shuffle } from "../../_shared/random";
import type { DoaEntry } from "../../../../../doa-dzikir/data/doa";

export interface DungeonRoom {
  id: string;
  floor: number;
  title: string;
  enemy: string;
  target: DoaEntry;
  options: DoaEntry[];
  monsterMaxHp: number;
}

const ENEMIES = ["Lupa Pagi", "Cemas Kecil", "Ragu-Ragu", "Lelah Belajar", "Takut Gelap", "Buru-Buru"];
const entries = DOA_HARIAN.flatMap((category) => category.entries.map((entry) => ({ ...entry, category: category.label })));

export function createDungeonRooms(): DungeonRoom[] {
  return shuffle(entries).slice(0, 6).map((target, index) => {
    const distractors = shuffle(entries.filter((entry) => entry.id !== target.id)).slice(0, 2);
    return { id: `dungeon-${target.id}`, floor: index + 1, title: target.judul, enemy: ENEMIES[index % ENEMIES.length], target, options: shuffle([target, ...distractors]), monsterMaxHp: 100 + index * 10 };
  });
}
