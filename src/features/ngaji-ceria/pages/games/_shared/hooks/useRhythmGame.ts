import { useCallback, useEffect } from "react";
import { playSfx } from "../audio";
import { useBestScore, useGameState } from "../hooks";
import type { GamePhase } from "../types";

export interface RhythmNote { id: string; lane: number; y: number; letter: string; resolved: boolean }
interface RhythmState { phase: GamePhase; score: number; combo: number; maxCombo: number; misses: number; elapsed: number; notes: RhythmNote[]; recitationNote: RhythmNote | null; spawnLeft: number; judgement: "idle" | "perfect" | "good" | "miss"; latency: number }
interface RhythmOptions { gameId: string; lanes: number; duration: number; endless?: boolean; letters: string[] }
const initial = (): RhythmState => ({ phase: "idle", score: 0, combo: 0, maxCombo: 0, misses: 0, elapsed: 0, notes: [], recitationNote: null, spawnLeft: 0.5, judgement: "idle", latency: 0 });

export function useRhythmGame({ gameId, lanes, duration, endless = false, letters }: RhythmOptions) {
  const { state, update } = useGameState(initial);
  const record = useBestScore(gameId, state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update((s) => ({ ...initial(), phase: "playing", latency: s.latency })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const setLatency = useCallback((latency: number) => update((s) => s.phase === "idle" ? { ...s, latency } : s), [update]);
  const hitLane = useCallback((lane: number) => update((s) => {
    if (s.phase !== "playing") return s;
    const candidates = s.notes.filter((note) => !note.resolved && note.lane === lane).sort((a, b) => Math.abs(a.y - 80) - Math.abs(b.y - 80));
    const note = candidates[0];
    if (!note || Math.abs(note.y - 80) > 18) { playSfx("wrong"); return { ...s, combo: 0, misses: s.misses + 1, judgement: "miss" as const, phase: endless && s.misses + 1 >= 3 ? "gameover" as const : "playing" as const }; }
    const distance = Math.abs(note.y - 80);
    const perfect = distance <= 6;
    const combo = s.combo + 1;
    const gain = (perfect ? 300 : 150) * Math.min(1 + combo * 0.05, 4);
    playSfx(perfect ? "combo" : "correct");
    return { ...s, recitationNote: note, notes: s.notes.map((item) => item.id === note.id ? { ...item, resolved: true } : item), score: s.score + Math.round(gain), combo, maxCombo: Math.max(s.maxCombo, combo), judgement: perfect ? "perfect" as const : "good" as const };
  }), [endless, update]);
  useEffect(() => {
    if (state.phase !== "playing") return;
    let frame = 0; let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - previous) / 1000); previous = now;
      update((s) => {
        if (s.phase !== "playing") return s;
        const elapsed = s.elapsed + delta;
        if (!endless && elapsed >= duration) return { ...s, elapsed: duration, phase: "gameover" };
        const notes = s.notes.flatMap((note) => { const y = note.y + 62 * delta; if (y > 105) return []; return [{ ...note, y }]; });
        let spawnLeft = s.spawnLeft - delta;
        let nextNotes = notes;
        if (spawnLeft <= 0) { nextNotes = [...notes, { id: `rhythm-${now}`, lane: Math.floor(Math.random() * lanes), y: -10, letter: letters[Math.floor(Math.random() * letters.length)], resolved: false }]; spawnLeft = 0.6; }
        return { ...s, elapsed, notes: nextNotes, spawnLeft };
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, endless, lanes, letters, state.phase, update]);
  return { ...state, ...record, start, pause, resume, setLatency, hitLane, duration, lanes, endless };
}
