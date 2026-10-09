import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import { useLeaderboardRecord, useNgajiProgress } from "../../_shared/progression";
import type { GamePhase } from "../../_shared/types";
import { CHRONICLES } from "../data/chronicles";

interface ChroniclesState { phase: GamePhase; chapterIndex: number; wisdom: number; courage: number; mercy: number; score: number; selected: string | null }
const initial = (): ChroniclesState => ({ phase: "idle", chapterIndex: 0, wisdom: 0, courage: 0, mercy: 0, score: 0, selected: null });

function ending(state: ChroniclesState) {
  const total = state.wisdom + state.courage + state.mercy;
  return total >= 22 ? "Teladan yang Matang" : total >= 14 ? "Langkah yang Baik" : total >= 7 ? "Pelajaran yang Tumbuh" : "Perlu Refleksi Lebih Dalam";
}

export function useNabiChronicles() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("nabi-chronicles", state.phase, state.score);
  const progress = useNgajiProgress();
  const leaderboard = useLeaderboardRecord("nabi-chronicles");
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing" })); }, [update]);
  const pause = useCallback(() => update((current) => current.phase === "playing" ? { ...current, phase: "paused" } : current), [update]);
  const resume = useCallback(() => update((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current), [update]);
  const choose = useCallback((choiceId: string) => update((current) => {
    if (current.phase !== "playing") return current;
    const chapter = CHRONICLES[current.chapterIndex];
    const choice = chapter?.choices.find((item) => item.id === choiceId);
    if (!choice) return current;
    const next = { ...current, chapterIndex: current.chapterIndex + 1, wisdom: current.wisdom + choice.delta.wisdom, courage: current.courage + choice.delta.courage, mercy: current.mercy + choice.delta.mercy, score: current.score + Math.max(20, 100 + choice.delta.wisdom * 20 + choice.delta.courage * 20 + choice.delta.mercy * 20), selected: null };
    if (current.chapterIndex === CHRONICLES.length - 1) { playSfx("gameover"); return { ...next, phase: "gameover" as const }; }
    playSfx(choice.delta.wisdom + choice.delta.mercy >= 2 ? "correct" : "wrong");
    return next;
  }), [update]);
  return { ...state, ...record, progress, leaderboard, chapter: CHRONICLES[state.chapterIndex], totalChapters: CHRONICLES.length, ending: ending(state), selectedChoice: state.selected ? CHRONICLES[state.chapterIndex]?.choices.find((choice) => choice.id === state.selected) : undefined, start, pause, resume, choose };
}
