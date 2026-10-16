import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import { useLeaderboardRecord, useNgajiProgress } from "../../_shared/progression";
import type { GamePhase } from "../../_shared/types";
import { createDungeonRooms, type DungeonRoom } from "../data/dungeon";
import type { BattleAttack, BattleOutcome } from "../../_shared/battle/types";

interface DungeonState {
  phase: GamePhase;
  rooms: DungeonRoom[];
  roomIndex: number;
  playerHp: number;
  monsterHp: number;
  score: number;
  combo: number;
  status: "idle" | "attacking" | "cleared";
  attack: BattleAttack | null;
  feedbackLeft: number;
  outcome: BattleOutcome;
  feedback: string;
  secondChanceUsed: boolean;
}

const initial = (): DungeonState => ({ phase: "idle", rooms: [], roomIndex: 0, playerHp: 100, monsterHp: 100, score: 0, combo: 0, status: "idle", attack: null, feedbackLeft: 0, outcome: null, feedback: "Jawab benar untuk menyerang monster. Jawaban salah membuat monster menyerang balik.", secondChanceUsed: false });

export function useDoaDungeon() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("doa-dungeon", state.phase, state.score);
  const progress = useNgajiProgress();
  const leaderboard = useLeaderboardRecord("doa-dungeon");
  const start = useCallback(() => { playSfx("pop"); update(() => { const rooms = createDungeonRooms(); return { ...initial(), phase: "playing", rooms, monsterHp: rooms[0]?.monsterMaxHp ?? 100 }; }); }, [update]);
  const pause = useCallback(() => update((current) => current.phase === "playing" ? { ...current, phase: "paused" } : current), [update]);
  const resume = useCallback(() => update((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current), [update]);
  const answer = useCallback((entryId: string) => update((current) => {
    if (current.phase !== "playing" || current.status !== "idle") return current;
    const room = current.rooms[current.roomIndex];
    if (!room) return current;
    if (entryId !== room.target.id) {
      const playerHp = Math.max(0, current.playerHp - 20);
      playSfx("wrong");
      return { ...current, playerHp, combo: 0, status: "attacking", attack: { id: Date.now(), attacker: "monster", damage: 20 }, feedbackLeft: 0.9, outcome: playerHp <= 0 ? "defeat" : null, phase: "playing", feedback: playerHp <= 0 ? "Penjaga dungeon mengalahkanmu. HP kamu habis." : "Monster menyerang balik. Baca situasi dan doa dengan lebih teliti." };
    }
    const combo = current.combo + 1;
    const monsterHp = Math.max(0, current.monsterHp - 25);
    playSfx(combo % 3 === 0 ? "combo" : "correct");
    return { ...current, combo, monsterHp, score: current.score + 150 + combo * 30, status: "attacking", attack: { id: Date.now(), attacker: "player", damage: 25 }, feedbackLeft: 0.9, outcome: monsterHp <= 0 ? "victory" : null, feedback: monsterHp <= 0 ? "Monster dikalahkan! Baca doa ini sebelum turun ke lantai berikutnya." : "Serangan berhasil! Monster kehilangan HP." };
  }), [update]);
  const nextRoom = useCallback(() => update((current) => {
    if (current.phase !== "playing" || current.status !== "cleared") return current;
    const roomIndex = current.roomIndex + 1;
    if (roomIndex >= current.rooms.length) { playSfx("gameover"); return { ...current, phase: "gameover", status: "cleared" }; }
    playSfx("pop");
    return { ...current, roomIndex, monsterHp: current.rooms[roomIndex]?.monsterMaxHp ?? 100, status: "idle", attack: null, outcome: null, feedback: "Jawab benar untuk menyerang monster. Jawaban salah membuat monster menyerang balik." };
  }), [update]);
  useTicker(state.phase === "playing" && state.status === "attacking", (delta) => update((current) => {
    if (current.phase !== "playing" || current.status !== "attacking") return current;
    const feedbackLeft = current.feedbackLeft - delta;
    if (feedbackLeft > 0) return { ...current, feedbackLeft };
    if (current.playerHp <= 0) return { ...current, phase: "gameover", status: "cleared", attack: null, outcome: "defeat" as const, feedbackLeft: 0 };
    if (current.monsterHp <= 0) return { ...current, status: "cleared", attack: null, outcome: "victory" as const, feedbackLeft: 0 };
    return { ...current, status: "idle", attack: null, outcome: null, feedbackLeft: 0 };
  }));
  const revive = useCallback(() => update((current) => current.phase === "gameover" && current.outcome === "defeat" && !current.secondChanceUsed
    ? { ...current, phase: "playing", playerHp: 35, status: "idle", attack: null, outcome: null, feedbackLeft: 0, secondChanceUsed: true, feedback: "Kamu bangkit! Jawab dengan tenang dan lanjutkan perjalanan." }
    : current), [update]);
  const room = state.rooms[state.roomIndex];
  return { ...state, ...record, progress, leaderboard, room, hp: state.playerHp, start, pause, resume, answer, nextRoom, revive, canSecondChance: state.outcome === "defeat" && !state.secondChanceUsed };
}
