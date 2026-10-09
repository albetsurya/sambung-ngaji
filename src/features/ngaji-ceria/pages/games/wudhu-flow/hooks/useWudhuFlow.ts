import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { WUDHU_STEPS } from "../data/steps";
import { useMetronome } from "./useMetronome";
import { connectedSteps } from "../data/pipes";

type Judgement = "idle" | "perfect" | "good" | "wrong";
type Mode = "pipes" | "challenge" | "rhythm";
interface WudhuState { phase: GamePhase; mode: Mode; rotations: number[]; water: number; turns: number; currentIndex: number; score: number; combo: number; maxCombo: number; bpm: number; judgement: Judgement; message: string; completed: number }
const initial = (): WudhuState => ({ phase: "idle", mode: "pipes", rotations: [], water: 12, turns: 0, currentIndex: 0, score: 0, combo: 0, maxCombo: 0, bpm: 60, judgement: "idle", message: "Putar pipa agar air melewati sepuluh langkah wudhu secara tertib.", completed: 0 });

export function useWudhuFlow() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("wudhu-flow", state.phase, state.score);
  const metronome = useMetronome(state.phase === "playing" && state.mode === "rhythm", state.bpm);
  const setMode = useCallback((mode: Mode) => update((s) => s.phase === "idle" ? { ...s, mode } : s), [update]);
  const start = useCallback(() => { playSfx("pop"); update((s) => ({ ...initial(), mode: s.mode, rotations: WUDHU_STEPS.map(() => 1 + Math.floor(Math.random() * 3)), phase: "playing" })); }, [update]);
  const rotatePipe = useCallback((index: number) => update((s) => {
    if (s.phase !== "playing" || s.mode === "rhythm" || index < 0 || index >= 10) return s;
    return { ...s, rotations: s.rotations.map((rotation, i) => i === index ? (rotation + 1) % 4 : rotation), turns: s.turns + 1, completed: 0 };
  }), [update]);
  const openWater = useCallback(() => update((s) => {
    if (s.phase !== "playing" || s.mode === "rhythm") return s;
    const completed = connectedSteps(s.rotations);
    const water = s.mode === "challenge" ? Math.max(0, s.water - 1) : s.water;
    const won = completed === 10;
    playSfx(won ? "correct" : "wrong");
    return { ...s, water, completed, score: won ? Math.max(100, 1200 - s.turns * 5) + water * 10 : 0,
      phase: won || water === 0 ? "gameover" : "playing",
      message: won ? "Air sampai tujuan! Semua langkah tersambung." : `${completed}/10 langkah teraliri. Perbaiki pipa ${completed + 1}.` };
  }), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const tapStep = useCallback((index: number) => update((s) => {
    if (s.phase !== "playing") return s;
    if (index !== s.currentIndex) {
      playSfx("wrong");
      return { ...s, combo: 0, bpm: Math.max(60, s.bpm - 10), judgement: "wrong" as const, message: "Belum urut. Ikuti langkah yang menyala." };
    }
    const closeness = 1 - Math.min(metronome.beatProgress, 1 - metronome.beatProgress) * 2;
    const perfect = closeness >= 0.7;
    const combo = s.combo + 1;
    const score = s.score + (perfect ? 100 + combo * 5 : 60 + combo * 3);
    const completed = s.completed + 1;
    const finished = completed >= WUDHU_STEPS.length;
    playSfx(perfect ? "combo" : "correct");
    return { ...s, currentIndex: Math.min(s.currentIndex + 1, WUDHU_STEPS.length - 1), score, combo, maxCombo: Math.max(s.maxCombo, combo), bpm: Math.min(140, s.bpm + 6), judgement: perfect ? "perfect" as const : "good" as const, message: perfect ? "Perfect! Tepat di ketukan." : "Good! Lanjutkan ritmenya.", completed, phase: finished ? "gameover" as const : "playing" as const };
  }), [metronome.beatProgress, update]);
  return { ...state, ...record, ...metronome, steps: WUDHU_STEPS, start, setMode, rotatePipe, openWater, pause, resume, tapStep };
}
