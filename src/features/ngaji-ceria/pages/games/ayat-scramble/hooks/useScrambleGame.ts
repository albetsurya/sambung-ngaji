import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { shuffle } from "../../_shared/random";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { SCRAMBLE_QUESTIONS, type ScrambleQuestion } from "../data/scramble-questions";
import { localDateSeed, seededRandom } from "../utils/dailySeed";

export interface Word { id: string; text: string }
type Mode = "normal" | "daily";
interface ScrambleState {
  phase: GamePhase; mode: Mode; dateSeed: string; questions: ScrambleQuestion[]; currentIndex: number;
  shuffledWords: Word[]; slots: (Word | null)[]; lockedPositions: number[];
  score: number; streak: number; solved: number; timeLeft: number; hintsLeft: number;
  status: "idle" | "correct" | "wrong" | "timeout"; feedbackLeft: number;
}
const initial = (): ScrambleState => ({ phase: "idle", mode: "normal", dateSeed: localDateSeed(), questions: [], currentIndex: 0, shuffledWords: [], slots: [], lockedPositions: [], score: 0, streak: 0, solved: 0, timeLeft: 45, hintsLeft: 2, status: "idle", feedbackLeft: 0 });
function prepare(question: ScrambleQuestion, random: () => number) {
  const ordered = question.words.map((text, index) => ({ id: `${question.id}:${index}`, text }));
  let shuffledWords = shuffle(ordered, random);
  if (shuffledWords.every((word, index) => word.id === ordered[index].id)) shuffledWords = [...shuffledWords.slice(1), shuffledWords[0]];
  return { shuffledWords, slots: question.words.map(() => null), lockedPositions: [], timeLeft: 45, status: "idle" as const, feedbackLeft: 0 };
}

export function useScrambleGame() {
  const { state, update } = useGameState(initial);
  const record = useBestScore(`ayat-scramble:${state.mode}`, state.phase, state.score);
  const start = useCallback(() => update((s) => {
    const dateSeed = localDateSeed();
    const random = s.mode === "daily" ? seededRandom(dateSeed) : Math.random;
    const questions = shuffle(SCRAMBLE_QUESTIONS, random).slice(0, 5);
    playSfx("pop");
    return { ...initial(), mode: s.mode, dateSeed, phase: "playing", questions, ...prepare(questions[0], s.mode === "daily" ? seededRandom(`${dateSeed}:${questions[0].id}`) : Math.random) };
  }), [update]);
  const setMode = useCallback((mode: Mode) => update((s) => s.phase === "idle" ? { ...s, mode } : s), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);

  const moveWord = useCallback((id: string, destination: number | "source") => update((s) => {
    if (s.phase !== "playing" || s.status !== "idle") return s;
    const from = s.slots.findIndex((word) => word?.id === id);
    const word = from >= 0 ? s.slots[from] : s.shuffledWords.find((item) => item.id === id);
    if (!word || s.lockedPositions.includes(from)) return s;
    const slots = [...s.slots];
    let shuffledWords = s.shuffledWords.filter((item) => item.id !== id);
    if (destination === "source") {
      if (from < 0) return s;
      slots[from] = null;
      shuffledWords.push(word);
    } else {
      if (destination < 0 || destination >= slots.length || s.lockedPositions.includes(destination)) return s;
      if (from >= 0) {
        const unlocked = slots.map((_, i) => i).filter((i) => !s.lockedPositions.includes(i));
        const reordered = arrayMove(unlocked.map((i) => slots[i]), unlocked.indexOf(from), unlocked.indexOf(destination));
        unlocked.forEach((slot, i) => { slots[slot] = reordered[i]; });
      } else {
        if (slots[destination]) shuffledWords.push(slots[destination]);
        slots[destination] = word;
      }
    }
    return { ...s, slots, shuffledWords };
  }), [update]);

  const hint = useCallback(() => update((s) => {
    if (s.phase !== "playing" || s.status !== "idle" || s.hintsLeft <= 0) return s;
    const question = s.questions[s.currentIndex];
    const position = question.words.findIndex((text, index) => s.slots[index]?.text !== text && !s.lockedPositions.includes(index));
    if (position < 0) return s;
    const all = [...s.shuffledWords, ...s.slots.filter((word): word is Word => word !== null)];
    const word = all.find((item) => item.id === `${question.id}:${position}`) ?? all.find((item) => item.text === question.words[position] && !s.lockedPositions.some((index) => s.slots[index]?.id === item.id));
    if (!word) return s;
    const slots = s.slots.map((item) => item?.id === word.id ? null : item);
    const displaced = slots[position];
    slots[position] = word;
    const shuffledWords = s.shuffledWords.filter((item) => item.id !== word.id);
    if (displaced) shuffledWords.push(displaced);
    playSfx("powerup");
    return { ...s, slots, shuffledWords, lockedPositions: [...s.lockedPositions, position], hintsLeft: s.hintsLeft - 1 };
  }), [update]);

  const check = useCallback(() => update((s) => {
    if (s.phase !== "playing" || s.status !== "idle" || s.slots.some((word) => !word)) return s;
    const correct = s.slots.every((word, i) => word?.text === s.questions[s.currentIndex].words[i]);
    playSfx(correct ? "correct" : "wrong");
    const streak = correct ? s.streak + 1 : 0;
    return { ...s, status: correct ? "correct" : "wrong", feedbackLeft: correct ? 1.2 : 0.65, streak, solved: s.solved + (correct ? 1 : 0), score: s.score + (correct ? 150 + Math.floor(s.timeLeft) * 5 + streak * 50 : 0) };
  }), [update]);

  useTicker(state.phase === "playing", (delta) => update((s) => {
    if (s.phase !== "playing") return s;
    if (s.status !== "idle") {
      const feedbackLeft = s.feedbackLeft - delta;
      if (feedbackLeft > 0) return { ...s, feedbackLeft };
      if (s.status === "wrong") return { ...s, status: "idle", feedbackLeft: 0 };
      if (s.currentIndex + 1 >= s.questions.length) return { ...s, phase: "gameover" };
      const question = s.questions[s.currentIndex + 1];
      return { ...s, currentIndex: s.currentIndex + 1, ...prepare(question, s.mode === "daily" ? seededRandom(`${s.dateSeed}:${question.id}`) : Math.random) };
    }
    const timeLeft = Math.max(0, s.timeLeft - delta);
    if (!timeLeft) { playSfx("wrong"); return { ...s, timeLeft, status: "timeout", feedbackLeft: 2, streak: 0 }; }
    return { ...s, timeLeft };
  }));
  // Asumsi: dua hint habis berarti lanjut tanpa bantuan, bukan langsung game over.
  return { ...state, ...record, currentQuestion: state.questions[state.currentIndex], start, setMode, pause, resume, moveWord, hint, check };
}
