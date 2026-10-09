import { useCallback, useEffect } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { PRAYER_SCHEDULE, type PrayerStatus } from "../data/prayers";

interface SholatState { phase: GamePhase; gameMinutes: number; score: number; combo: number; maxCombo: number; statuses: Record<string, PrayerStatus>; message: string }
const initial = (): SholatState => ({ phase: "idle", gameMinutes: 240, score: 0, combo: 0, maxCombo: 0, statuses: Object.fromEntries(PRAYER_SCHEDULE.map((prayer) => [prayer.id, "pending"])), message: "Jaga lima waktu sampai hari selesai." });

export function useSholatHero() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("sholat-hero", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing" })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const pray = useCallback((id: string) => update((s) => {
    if (s.phase !== "playing" || s.statuses[id] !== "pending") return s;
    const prayer = PRAYER_SCHEDULE.find((item) => item.id === id);
    if (!prayer || s.gameMinutes < prayer.start || s.gameMinutes > prayer.end) return { ...s, message: "Belum masuk atau sudah lewat waktunya." };
    const late = s.gameMinutes > prayer.start + 20;
    const combo = late ? 0 : s.combo + 1;
    const score = s.score + (late ? 80 : 200) + (late ? 0 : combo * 20);
    playSfx(late ? "pop" : "correct");
    return { ...s, statuses: { ...s.statuses, [id]: late ? "late" : "ontime" }, score, combo, maxCombo: Math.max(s.maxCombo, combo), message: late ? `${prayer.name} tercatat terlambat.` : `${prayer.name} tepat waktu. Combo naik!` };
  }), [update]);
  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = window.setInterval(() => update((s) => {
      if (s.phase !== "playing") return s;
      const nextMinutes = s.gameMinutes + 10;
      const statuses = { ...s.statuses };
      PRAYER_SCHEDULE.forEach((prayer) => { if (statuses[prayer.id] === "pending" && nextMinutes > prayer.end) statuses[prayer.id] = "missed"; });
      return { ...s, gameMinutes: nextMinutes, statuses, phase: nextMinutes >= 1320 ? "gameover" : "playing" };
    }), 1000);
    return () => window.clearInterval(id);
  }, [state.phase, update]);
  return { ...state, ...record, prayers: PRAYER_SCHEDULE, start, pause, resume, pray };
}
