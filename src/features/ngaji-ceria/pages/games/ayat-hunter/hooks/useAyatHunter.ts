import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import { useLeaderboardRecord, useNgajiProgress } from "../../_shared/progression";
import { shuffle } from "../../_shared/random";
import type { GamePhase } from "../../_shared/types";
import {
  ARENA_COLUMNS, ARENA_ROWS, HUNTER_MISSIONS, HUNTER_ROUNDS, HUNTER_SECONDS, START_CELL,
  createHunterTokens, isAdjacentCell, type HunterMission, type HunterToken,
} from "../data/hunter-missions";

export type HunterDirection = "up" | "down" | "left" | "right";
type EndReason = "complete" | "lives" | "timeout" | null;

interface HunterState {
  phase: GamePhase;
  missions: HunterMission[];
  missionIndex: number;
  tokens: HunterToken[];
  playerCell: number;
  collected: number;
  solved: number;
  score: number;
  lives: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  status: "hunting" | "cleared";
  feedback: string;
  endReason: EndReason;
}

const initial = (): HunterState => ({
  phase: "idle", missions: [], missionIndex: 0, tokens: [], playerCell: START_CELL,
  collected: 0, solved: 0, score: 0, lives: 3, combo: 0, maxCombo: 0,
  timeLeft: HUNTER_SECONDS, status: "hunting", endReason: null,
  feedback: "Dekati kata target, lalu tekan Ambil kata.",
});

function prepare(mission: HunterMission) {
  return {
    tokens: createHunterTokens(mission), playerCell: START_CELL, collected: 0,
    timeLeft: HUNTER_SECONDS, status: "hunting" as const,
    feedback: "Dekati kata target, lalu tekan Ambil kata.",
  };
}

export function useAyatHunter() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("ayat-hunter", state.phase, state.score);
  const progress = useNgajiProgress();
  const leaderboard = useLeaderboardRecord("ayat-hunter");
  const start = useCallback(() => update(() => {
    const missions = shuffle(HUNTER_MISSIONS).slice(0, HUNTER_ROUNDS);
    playSfx("pop");
    return { ...initial(), phase: "playing", missions, ...prepare(missions[0]) };
  }), [update]);
  const pause = useCallback(() => update((current) => current.phase === "playing" ? { ...current, phase: "paused" } : current), [update]);
  const resume = useCallback(() => update((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current), [update]);

  const moveTo = useCallback((cell: number) => update((current) => {
    if (current.phase !== "playing" || current.status !== "hunting" || !isAdjacentCell(current.playerCell, cell)) return current;
    return { ...current, playerCell: cell };
  }), [update]);

  const move = useCallback((direction: HunterDirection) => update((current) => {
    if (current.phase !== "playing" || current.status !== "hunting") return current;
    const row = Math.floor(current.playerCell / ARENA_COLUMNS);
    const column = current.playerCell % ARENA_COLUMNS;
    const nextRow = row + (direction === "up" ? -1 : direction === "down" ? 1 : 0);
    const nextColumn = column + (direction === "left" ? -1 : direction === "right" ? 1 : 0);
    if (nextRow < 0 || nextRow >= ARENA_ROWS || nextColumn < 0 || nextColumn >= ARENA_COLUMNS) return current;
    const cell = nextRow * ARENA_COLUMNS + nextColumn;
    return isAdjacentCell(current.playerCell, cell) ? { ...current, playerCell: cell } : current;
  }), [update]);

  const collect = useCallback(() => update((current) => {
    if (current.phase !== "playing" || current.status !== "hunting") return current;
    const token = current.tokens.find((item) => item.cell === current.playerCell);
    if (!token) return current;
    const mission = current.missions[current.missionIndex];
    if (token.text !== mission.words[current.collected]) {
      playSfx("wrong");
      const lives = current.lives - 1;
      return {
        ...current, lives, combo: 0, phase: lives === 0 ? "gameover" : "playing",
        endReason: lives === 0 ? "lives" : null,
        feedback: "Belum sesuai urutan. Cari kata target yang ditampilkan di atas peta.",
      };
    }
    const collected = current.collected + 1;
    const combo = current.combo + 1;
    const cleared = collected === mission.words.length;
    const complete = cleared && current.missionIndex === current.missions.length - 1;
    playSfx(cleared ? "powerup" : combo % 5 === 0 ? "combo" : "correct");
    return {
      ...current, tokens: current.tokens.filter((item) => item.id !== token.id), collected,
      combo, maxCombo: Math.max(current.maxCombo, combo),
      score: current.score + 100 + Math.min(combo, 5) * 25 + (cleared ? 200 + Math.floor(current.timeLeft) * 2 : 0),
      solved: current.solved + (cleared ? 1 : 0), status: cleared ? "cleared" : "hunting",
      phase: complete ? "gameover" : "playing", endReason: complete ? "complete" : null,
      feedback: cleared ? "Ayat lengkap! Baca ayat dan artinya sebelum melanjutkan." : "Tepat! Lanjutkan mencari kata berikutnya.",
    };
  }), [update]);

  const nextMission = useCallback(() => update((current) => {
    if (current.phase !== "playing" || current.status !== "cleared") return current;
    const missionIndex = current.missionIndex + 1;
    const mission = current.missions[missionIndex];
    if (!mission) return current;
    playSfx("pop");
    return { ...current, missionIndex, ...prepare(mission) };
  }), [update]);

  useTicker(state.phase === "playing" && state.status === "hunting", (delta) => update((current) => {
    if (current.phase !== "playing" || current.status !== "hunting") return current;
    const timeLeft = Math.max(0, current.timeLeft - delta);
    return {
      ...current, timeLeft, phase: timeLeft === 0 ? "gameover" : "playing",
      endReason: timeLeft === 0 ? "timeout" : null,
      feedback: timeLeft === 0 ? "Waktu pencarian habis. Baca kembali ayatnya, lalu coba lagi." : current.feedback,
    };
  }));

  return {
    ...state, ...record, currentMission: state.missions[state.missionIndex],
    standingToken: state.tokens.find((token) => token.cell === state.playerCell),
    progress, leaderboard, start, pause, resume, moveTo, move, collect, nextMission,
  };
}
