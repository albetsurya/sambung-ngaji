import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import { useLeaderboardRecord, useNgajiProgress } from "../../_shared/progression";
import type { GamePhase } from "../../_shared/types";
import { shuffle } from "../../_shared/random";
import { ANGEL_MISSIONS, type AngelMission } from "../data/missions";
import type { BattleAttack, BattleOutcome } from "../../_shared/battle/types";

interface MissionState { phase: GamePhase; missions: AngelMission[]; index: number; score: number; playerHp: number; monsterHp: number; timeLeft: number; status: "idle" | "correct" | "wrong" | "timeout"; feedbackLeft: number; selected: number | null; combo: number; attack: BattleAttack | null; outcome: BattleOutcome }
const initial = (): MissionState => ({ phase: "idle", missions: [], index: 0, score: 0, playerHp: 100, monsterHp: 100, timeLeft: 10, status: "idle", feedbackLeft: 0, selected: null, combo: 0, attack: null, outcome: null });
const prepareMissions = () => ANGEL_MISSIONS.map((mission) => { const correct = mission.options[mission.correctIndex]; const options = shuffle(mission.options); return { ...mission, options, correctIndex: options.indexOf(correct) }; });

export function useMalaikatMission() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("malaikat-mission", state.phase, state.score);
  const progress = useNgajiProgress();
  const leaderboard = useLeaderboardRecord("malaikat-mission");
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing", missions: prepareMissions() })); }, [update]);
  const pause = useCallback(() => update((current) => current.phase === "playing" ? { ...current, phase: "paused" } : current), [update]);
  const resume = useCallback(() => update((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current), [update]);
  const answer = useCallback((selected: number | null, timeout = false) => update((current) => {
    if (current.phase !== "playing" || current.status !== "idle") return current;
    const mission = current.missions[current.index];
    const correct = !timeout && selected === mission.correctIndex;
    const playerHp = correct ? current.playerHp : Math.max(0, current.playerHp - 20);
    const monsterHp = correct ? Math.max(0, current.monsterHp - 25) : current.monsterHp;
    const combo = correct ? current.combo + 1 : 0;
    const status = timeout ? "timeout" : correct ? "correct" : "wrong";
    playSfx(correct ? combo % 4 === 0 ? "combo" : "correct" : "wrong");
    return { ...current, selected, status, playerHp, monsterHp, combo, attack: { id: Date.now(), attacker: correct ? "player" : "monster", damage: correct ? 25 : 20 }, outcome: null, score: current.score + (correct ? 100 + Math.floor(current.timeLeft * 5) + combo * 20 : 0), feedbackLeft: correct ? 0.9 : 1.2, phase: "playing" };
  }), [update]);
  useTicker(state.phase === "playing", (delta) => update((current) => {
    if (current.phase !== "playing") return current;
    if (current.status !== "idle") {
      const feedbackLeft = current.feedbackLeft - delta;
      if (feedbackLeft > 0) return { ...current, feedbackLeft };
      if (current.playerHp <= 0) return { ...current, phase: "gameover", feedbackLeft: 0, attack: null, outcome: "defeat" as const };
      if (current.monsterHp <= 0) {
        if (current.index + 1 >= current.missions.length) return { ...current, phase: "gameover", feedbackLeft: 0, attack: null, outcome: "victory" as const };
        return { ...current, index: current.index + 1, monsterHp: 100, timeLeft: 10, selected: null, status: "idle", attack: null, outcome: null, feedbackLeft: 0 };
      }
      return { ...current, timeLeft: 10, selected: null, status: "idle", attack: null, outcome: null, feedbackLeft: 0 };
    }
    const timeLeft = Math.max(0, current.timeLeft - delta);
    if (timeLeft === 0) { const playerHp = Math.max(0, current.playerHp - 20); return { ...current, timeLeft, status: "timeout", feedbackLeft: 1.2, playerHp, attack: { id: Date.now(), attacker: "monster", damage: 20 }, combo: 0, phase: "playing" }; }
    return { ...current, timeLeft };
  }));
  return { ...state, ...record, progress, leaderboard, lives: Math.ceil(state.playerHp / 34), mission: state.missions[state.index], start, pause, resume, answer };
}
