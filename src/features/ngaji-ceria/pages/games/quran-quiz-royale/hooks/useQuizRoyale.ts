import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { shuffleQuestions, type Question } from "../data/quiz-royale-questions";

export type RoyaleAnswerState = "idle" | "correct" | "wrong" | "timeout";
export interface RoyalePlayer { id: string; name: string; alive: boolean; score: number }
interface RoyaleState { phase: GamePhase; questions: Question[]; currentIndex: number; score: number; timeLeft: number; selectedIndex: number | null; answerState: RoyaleAnswerState; feedbackLeft: number; players: RoyalePlayer[]; eliminated: boolean; rank: number }
const names = ["Kamu", "Alya", "Rafi", "Naila", "Fahri", "Hana", "Zidan", "Salma"];
const initial = (): RoyaleState => ({ phase: "idle", questions: [], currentIndex: 0, score: 0, timeLeft: 8, selectedIndex: null, answerState: "idle", feedbackLeft: 0, players: names.map((name, index) => ({ id: `royale-${index}`, name, alive: true, score: 0 })), eliminated: false, rank: 8 });

function resolveState(s: RoyaleState, index: number | null, timedOut: boolean): RoyaleState {
  const question = s.questions[s.currentIndex];
  if (s.phase !== "playing" || s.answerState !== "idle" || !question) return s;
  const correct = !timedOut && index === question.correctIndex;
  const playerAlive = correct;
  const players = s.players.map((player, playerIndex) => {
    if (playerIndex === 0) return { ...player, alive: playerAlive, score: player.score + (correct ? Math.round(100 + s.timeLeft * 10) : 0) };
    if (!player.alive) return player;
    const botCorrect = Math.random() < (timedOut ? 0.55 : 0.78);
    return { ...player, alive: botCorrect, score: player.score + (botCorrect ? 100 : 0) };
  });
  const score = correct ? s.score + Math.round(100 + s.timeLeft * 10) : s.score;
  const answerState = timedOut ? "timeout" : correct ? "correct" : "wrong";
  playSfx(correct ? "correct" : "wrong");
  return { ...s, selectedIndex: index, answerState, feedbackLeft: 1.1, score, players, eliminated: !playerAlive };
}

export function useQuizRoyale() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("quran-quiz-royale", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing", questions: shuffleQuestions() })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const resolve = useCallback((index: number | null, timedOut = false) => update((s) => resolveState(s, index, timedOut)), [update]);
  const answer = useCallback((index: number) => resolve(index), [resolve]);
  useTicker(state.phase === "playing", (delta) => update((s) => {
    if (s.phase !== "playing") return s;
    if (s.answerState !== "idle") {
      const feedbackLeft = s.feedbackLeft - delta;
      if (feedbackLeft > 0) return { ...s, feedbackLeft };
      const nextRank = s.eliminated ? 1 + s.players.filter((player, index) => index > 0 && player.alive).length : 1 + s.players.filter((player) => player.alive && player.score > s.score).length;
      if (s.eliminated || s.currentIndex + 1 >= s.questions.length) return { ...s, phase: "gameover", rank: Math.max(1, nextRank) };
      return { ...s, currentIndex: s.currentIndex + 1, timeLeft: 8, selectedIndex: null, answerState: "idle", feedbackLeft: 0, rank: Math.max(1, nextRank) };
    }
    const timeLeft = Math.max(0, s.timeLeft - delta);
    return timeLeft === 0 ? resolveState({ ...s, timeLeft }, null, true) : { ...s, timeLeft };
  }));
  // Asumsi: multiplayer realtime belum tersedia di backend, sehingga ronde ini memakai bot lokal dengan aturan yang sama.
  return { ...state, ...record, currentQuestion: state.questions[state.currentIndex], answer, start, pause, resume, alivePlayers: state.players.filter((player) => player.alive).length };
}
