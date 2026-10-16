import { useCallback } from "react";
import { useGameState, useTicker, useBestScore } from "../../_shared/hooks";
import { playSfx } from "../../_shared/audio";
import type { GamePhase } from "../../_shared/types";
import { createDeck, type Card } from "../data/match-pairs";
import { useAIOpponent, type Difficulty } from "./useAIOpponent";

type Mode = "solo" | "battle";
interface MatchState {
  phase: GamePhase; mode: Mode; difficulty: Difficulty; cards: Card[]; flippedIds: string[];
  score: number; streak: number; maxCombo: number; aiScore: number; aiStreak: number; playerPairs: number; aiPairs: number;
  currentTurn: "player" | "ai"; timeLeft: number; stepLeft: number; message: string;
}
const initial = (): MatchState => ({ phase: "idle", mode: "solo", difficulty: "normal", cards: [], flippedIds: [], score: 0, streak: 0, maxCombo: 0, aiScore: 0, aiStreak: 0, playerPairs: 0, aiPairs: 0, currentTurn: "player", timeLeft: 90, stepLeft: 0, message: "Buka dua kartu: huruf Arab dan namanya." });

export function useMatchGame() {
  const { state, update } = useGameState(initial);
  const ai = useAIOpponent();
  const record = useBestScore(`hijaiyah-match-arena:${state.mode}`, state.phase, state.score);
  const start = useCallback(() => { ai.reset(); playSfx("pop"); update((s) => ({ ...initial(), mode: s.mode, difficulty: s.difficulty, phase: "playing", cards: createDeck() })); }, [update, ai.reset]);
  const setMode = useCallback((mode: Mode) => update((s) => s.phase === "idle" ? { ...s, mode } : s), [update]);
  const setDifficulty = useCallback((difficulty: Difficulty) => update((s) => s.phase === "idle" ? { ...s, difficulty } : s), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);

  const flip = useCallback((s: MatchState, id: string): MatchState => {
    const card = s.cards.find((item) => item.id === id);
    if (!card || card.isMatched || card.isFlipped || s.flippedIds.length >= 2) return s;
    ai.remember(card, s.difficulty);
    playSfx("pop");
    const flippedIds = [...s.flippedIds, id];
    return { ...s, cards: s.cards.map((item) => item.id === id ? { ...item, isFlipped: true } : item), flippedIds, stepLeft: flippedIds.length === 2 ? 0.8 : s.currentTurn === "ai" ? 1 : 0 };
  }, [ai.remember]);
  const flipPlayer = useCallback((id: string) => update((s) => s.phase === "playing" && s.currentTurn === "player" ? flip(s, id) : s), [update, flip]);

  useTicker(state.phase === "playing", (delta) => update((s) => {
    if (s.phase !== "playing") return s;
    const timeLeft = Math.max(0, s.timeLeft - delta);
    if (!timeLeft) return { ...s, timeLeft, phase: "gameover" };
    const next = { ...s, timeLeft, stepLeft: Math.max(0, s.stepLeft - delta) };
    if (next.stepLeft > 0) return next;
    if (s.flippedIds.length === 2) {
      const [first, second] = s.flippedIds.map((id) => s.cards.find((card) => card.id === id)!);
      const matched = first.pairId === second.pairId && first.type !== second.type;
      const isPlayer = s.currentTurn === "player";
      const streak = matched ? (isPlayer ? s.streak : s.aiStreak) + 1 : 0;
      const gain = matched ? 50 + 25 * streak : 0;
      playSfx(matched ? "correct" : "wrong");
      const cards = s.cards.map((card) => s.flippedIds.includes(card.id) ? { ...card, isMatched: matched, isFlipped: matched } : card);
      // Asumsi: Battle selalu berganti giliran setelah satu percobaan, termasuk saat cocok.
      const currentTurn = s.mode === "battle" && isPlayer ? "ai" : "player";
      return { ...next, cards, flippedIds: [], score: s.score + (isPlayer ? gain : 0), aiScore: s.aiScore + (isPlayer ? 0 : gain), streak: isPlayer ? streak : s.streak, maxCombo: isPlayer ? Math.max(s.maxCombo, streak) : s.maxCombo, aiStreak: isPlayer ? s.aiStreak : streak, playerPairs: s.playerPairs + (matched && isPlayer ? 1 : 0), aiPairs: s.aiPairs + (matched && !isPlayer ? 1 : 0), currentTurn, stepLeft: currentTurn === "ai" ? 1 : 0, phase: cards.every((card) => card.isMatched) ? "gameover" : "playing", message: matched ? `${isPlayer ? "Kamu" : "AI"} dapat pasangan! +${gain}` : `${isPlayer ? "Kamu" : "AI"} belum cocok. Ingat posisinya.` };
    }
    if (s.currentTurn === "ai") {
      const id = ai.choose(s.cards, s.flippedIds[0]);
      return id ? flip(next, id) : next;
    }
    return next;
  }));
  const resultTitle = state.mode === "solo" ? (state.cards.length && state.cards.every((card) => card.isMatched) ? "Papan Selesai!" : "Waktu Habis") : state.playerPairs > state.aiPairs ? "Kamu Menang!" : state.playerPairs < state.aiPairs ? "AI Menang Kali Ini" : "Hasil Seri";
  return { ...state, ...record, resultTitle, start, setMode, setDifficulty, pause, resume, flipPlayer };
}
