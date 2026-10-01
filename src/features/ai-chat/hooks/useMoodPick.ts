import { useMemo } from "react";
import type { Mood, MoodAyat, MoodDoa } from "../data/mood";


function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}


export interface MoodPick {
  ayat: MoodAyat;
  doa: MoodDoa;
  seed: string;
}

export function useMoodPick(mood: Mood): MoodPick {
  return useMemo(() => {
    const date = todayIso();
    const seedAyat = date + "|" + mood.key + "|ayat";
    const seedDoa = date + "|" + mood.key + "|doa";

    const ayatIdx = hashString(seedAyat) % mood.ayat.length;
    const doaIdx = hashString(seedDoa) % mood.doa.length;

    return {
      ayat: mood.ayat[ayatIdx],
      doa: mood.doa[doaIdx],
      seed: date,
    };
  }, [mood]);
}
