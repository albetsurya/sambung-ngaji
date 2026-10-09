import { useCallback, useMemo } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { ARABIC_WORDS, normalizeArabic, wordLetters, type TileStatus } from "../data/word-list";
import { dateIndex, localDateSeed } from "../utils/dailySeed";

type Mode = "normal" | "daily";
interface WordleState {
  phase: GamePhase; mode: Mode; dateSeed: string; target: string; guesses: string[]; current: string;
  statuses: TileStatus[][]; keyStatuses: Record<string, TileStatus>; score: number; message: string;
  shareText: string; solved: boolean;
}
const initial = (): WordleState => ({ phase: "idle", mode: "daily", dateSeed: localDateSeed(), target: ARABIC_WORDS[0], guesses: [], current: "", statuses: [], keyStatuses: {}, score: 0, message: "Tebak kata Arab lima huruf.", shareText: "", solved: false });

function evaluateGuess(guess: string, target: string): TileStatus[] {
  const guessLetters = wordLetters(normalizeArabic(guess));
  const targetLetters = wordLetters(normalizeArabic(target));
  const result: TileStatus[] = Array(guessLetters.length).fill("absent");
  const remaining = new Map<string, number>();
  targetLetters.forEach((letter, index) => { if (guessLetters[index] !== letter) remaining.set(letter, (remaining.get(letter) ?? 0) + 1); });
  guessLetters.forEach((letter, index) => {
    if (letter === targetLetters[index]) result[index] = "correct";
    else if ((remaining.get(letter) ?? 0) > 0) { result[index] = "present"; remaining.set(letter, remaining.get(letter)! - 1); }
  });
  return result;
}

function mergeKeyStatus(current: TileStatus | undefined, next: TileStatus): TileStatus {
  const rank: Record<TileStatus, number> = { empty: 0, absent: 1, present: 2, correct: 3 };
  return !current || rank[next] > rank[current] ? next : current;
}

function resultText(state: WordleState): string {
  const rows = state.statuses.map((row) => row.map((status) => status === "correct" ? "🟩" : status === "present" ? "🟨" : "⬛").join(""));
  return `Ngaji Ceria Arabic Wordle ${state.mode === "daily" ? state.dateSeed : "latihan"}\n${rows.join("\n")}\n${state.solved ? `${state.guesses.length}/6 percobaan` : "Belum terpecahkan"}`;
}

export function useArabicWordle() {
  const { state, update } = useGameState(initial);
  const record = useBestScore(`arabic-wordle:${state.mode}`, state.phase, state.score);
  const setMode = useCallback((mode: Mode) => update((s) => s.phase === "idle" ? { ...s, mode } : s), [update]);
  const start = useCallback(() => update((s) => {
    const dateSeed = localDateSeed();
    const target = s.mode === "daily" ? ARABIC_WORDS[dateIndex(dateSeed, ARABIC_WORDS.length)] : ARABIC_WORDS[Math.floor(Math.random() * ARABIC_WORDS.length)];
    playSfx("pop");
    return { ...initial(), phase: "playing", mode: s.mode, dateSeed, target, message: "Tebak kata Arab lima huruf." };
  }), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const input = useCallback((letter: string) => update((s) => s.phase === "playing" && wordLetters(s.current).length < 5 ? { ...s, current: `${s.current}${letter}`, message: "" } : s), [update]);
  const backspace = useCallback(() => update((s) => s.phase === "playing" ? { ...s, current: s.current.slice(0, -1), message: "" } : s), [update]);
  const submit = useCallback(() => update((s) => {
    if (s.phase !== "playing") return s;
    if (wordLetters(s.current).length !== 5) return { ...s, message: "Lengkapi lima huruf dulu." };
    const normalizedCurrent = normalizeArabic(s.current);
    const valid = ARABIC_WORDS.some((word) => normalizeArabic(word) === normalizedCurrent);
    if (!valid) return { ...s, message: "Kata itu belum ada di daftar latihan." };
    const statuses = evaluateGuess(s.current, s.target);
    const keyStatuses = { ...s.keyStatuses };
    wordLetters(s.current).forEach((letter, index) => { keyStatuses[letter] = mergeKeyStatus(keyStatuses[letter], statuses[index]); });
    const guesses = [...s.guesses, s.current];
    const solved = statuses.every((status) => status === "correct");
    const finished = solved || guesses.length >= 6;
    const score = solved ? Math.max(100, (7 - guesses.length) * 150) : 0;
    const next = { ...s, guesses, current: "", statuses: [...s.statuses, statuses], keyStatuses, score, solved, phase: finished ? "gameover" as const : "playing" as const, message: solved ? "Tepat! Kata berhasil dipecahkan." : finished ? `Kata hari ini: ${s.target}` : "" };
    playSfx(solved ? "correct" : finished ? "gameover" : "pop");
    return { ...next, shareText: resultText(next) };
  }), [update]);
  const share = useCallback(async () => {
    if (!state.shareText) return;
    try {
      if (navigator.share) await navigator.share({ title: "Arabic Wordle Ngaji Ceria", text: state.shareText });
      else await navigator.clipboard?.writeText(state.shareText);
      update((s) => ({ ...s, message: "Hasil sudah siap dibagikan." }));
    } catch { update((s) => ({ ...s, message: "Berbagi dibatalkan." })); }
  }, [state.shareText, update]);
  const board = useMemo(() => [...state.guesses.map((guess, index) => ({ word: guess, statuses: state.statuses[index] })), ...(state.phase === "playing" ? [{ word: state.current, statuses: [] as TileStatus[] }] : [])].concat(Array.from({ length: Math.max(0, 6 - state.guesses.length - (state.phase === "playing" ? 1 : 0)) }, () => ({ word: "", statuses: [] as TileStatus[] }))), [state]);
  return { ...state, ...record, board, setMode, start, pause, resume, input, backspace, submit, share };
}
