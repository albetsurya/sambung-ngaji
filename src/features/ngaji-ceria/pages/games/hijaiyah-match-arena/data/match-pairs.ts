import { HIJAIYAH_LIST } from "../../../../data/hijaiyah";
import { shuffle } from "../../_shared/random";

export interface Card { id: string; pairId: string; content: string; type: "arabic" | "latin"; isFlipped: boolean; isMatched: boolean }
export const MATCH_PAIRS = HIJAIYAH_LIST.map((letter) => ({
  id: letter.id, arabic: letter.arabic,
  // Dua huruf bernama Ha dibedakan supaya pasangan Latin tidak ambigu.
  latin: letter.id === "ha" ? "Ha (tenggorokan)" : letter.id === "ha-kecil" ? "Ha (ringan)" : letter.name,
}));

export function createDeck(): Card[] {
  return shuffle(shuffle(MATCH_PAIRS).slice(0, 8).flatMap((pair) => ([
    { id: `${pair.id}:arabic`, pairId: pair.id, content: pair.arabic, type: "arabic" as const, isFlipped: false, isMatched: false },
    { id: `${pair.id}:latin`, pairId: pair.id, content: pair.latin, type: "latin" as const, isFlipped: false, isMatched: false },
  ])));
}
