import { useCallback } from "react";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import { playSfx } from "../../_shared/audio";
import type { GamePhase } from "../../_shared/types";
import { shuffleQuestions, type Question } from "../data/juz-amma-questions";

export type AnswerState = "idle" | "correct" | "wrong" | "timeout";
interface QuizState {
  phase: GamePhase; questions: Question[]; currentIndex: number; score: number;
  combo: number; maxCombo: number; lives: number; timeLeft: number;
  selectedIndex: number | null; answerState: AnswerState; feedbackLeft: number; perfect: boolean;
}
const initial = (): QuizState => ({ phase: "idle", questions: [], currentIndex: 0, score: 0, combo: 0, maxCombo: 0, lives: 3, timeLeft: 5, selectedIndex: null, answerState: "idle", feedbackLeft: 0, perfect: false });

function resolve(state: QuizState, index: number | null): QuizState {
  const question = state.questions[state.currentIndex];
  if (state.phase !== "playing" || state.answerState !== "idle" || !question) return state;
  const correct = index === question.correctIndex;
  const combo = correct ? state.combo + 1 : 0;
  const perfect = correct && 5 - state.timeLeft < 2;
  playSfx(correct ? (combo >= 3 ? "combo" : "correct") : "wrong");
  return { ...state, selectedIndex: index, answerState: index === null ? "timeout" : correct ? "correct" : "wrong", combo, maxCombo: Math.max(state.maxCombo, combo), score: state.score + (correct ? Math.round(100 * Math.min(1 + combo * 0.15, 4)) + (perfect ? 50 : 0) : 0), lives: state.lives - (correct ? 0 : 1), feedbackLeft: 1.1, perfect };
}

export function useQuizGame() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("juz-amma-speedrun", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing", questions: shuffleQuestions() })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const answer = useCallback((index: number) => update((s) => index >= 0 && index < 4 ? resolve(s, index) : s), [update]);
  useTicker(state.phase === "playing", (delta) => update((s) => {
    if (s.phase !== "playing") return s;
    if (s.answerState !== "idle") {
      const feedbackLeft = s.feedbackLeft - delta;
      if (feedbackLeft > 0) return { ...s, feedbackLeft };
      if (s.lives <= 0 || s.currentIndex + 1 >= s.questions.length) return { ...s, phase: "gameover" };
      return { ...s, currentIndex: s.currentIndex + 1, timeLeft: 5, selectedIndex: null, answerState: "idle", feedbackLeft: 0, perfect: false };
    }
    const timeLeft = Math.max(0, s.timeLeft - delta);
    return timeLeft === 0 ? resolve({ ...s, timeLeft }, null) : { ...s, timeLeft };
  }));
  return { ...state, ...record, currentQuestion: state.questions[state.currentIndex], comboMultiplier: Math.min(1 + state.combo * 0.15, 4), start, pause, resume, answer };
}
