import { useCallback, useRef } from "react";
import type { Card } from "../data/match-pairs";

export type Difficulty = "easy" | "normal" | "hard";
interface Memory { id: string; pairId: string; type: Card["type"] }
const CAPACITY = { easy: 1, normal: 3, hard: 5 };

export function useAIOpponent() {
  const memory = useRef<Memory[]>([]);
  const reset = useCallback(() => { memory.current = []; }, []);
  const remember = useCallback((card: Card, difficulty: Difficulty) => {
    memory.current = [...memory.current.filter((item) => item.id !== card.id), { id: card.id, pairId: card.pairId, type: card.type }].slice(-CAPACITY[difficulty]);
  }, []);
  const choose = useCallback((cards: Card[], firstId?: string): string | undefined => {
    const available = cards.filter((card) => !card.isMatched && !card.isFlipped);
    const known = memory.current.filter((entry) => available.some((card) => card.id === entry.id));
    if (firstId) {
      const first = memory.current.find((entry) => entry.id === firstId);
      const match = first && known.find((entry) => entry.pairId === first.pairId && entry.type !== first.type);
      if (match) return match.id;
    } else {
      const match = known.find((entry) => known.some((other) => other.id !== entry.id && other.pairId === entry.pairId && other.type !== entry.type));
      if (match) return match.id;
    }
    // Pemilihan acak tidak membaca pairId kartu yang belum pernah terbuka.
    return available[Math.floor(Math.random() * available.length)]?.id;
  }, []);
  return { reset, remember, choose };
}
