import { useEffect, useState } from "react";
import type { GamePhase } from "./types";
import { getNgajiActivity, hydrateActivity, recordActivity } from "../../../hooks/useNgajiCeriaStore";
import { activityDate } from "../../../utils/activityDate";
import { getToken } from "../../../../../services/api";
import { isNgajiCeriaServerAvailable, ngajiCeriaApi, type ServerNgajiProgress, type ServerProgressEvent } from "../../../services/ngajiCeriaApi";

const PROGRESS_KEY = "ngajiceria:progress:v1";
const PROGRESS_EVENT = "ngajiceria:progress-updated";
const LEADERBOARD_EVENT = "ngajiceria:leaderboard-updated";

export interface GameProgress {
  xp: number;
  totalScore: number;
  gamesPlayed: number;
  achievements: string[];
  coins: number;
  daily: DailyProgress;
}

export interface DailyProgress {
  date: string;
  gamesPlayed: number;
  totalScore: number;
  claimedMissions: string[];
}

export interface PendingReward {
  id: string;
  coins: number;
  label: string;
}

const REWARD_EVENT = "ngajiceria:reward-queued";
const PENDING_EVENTS_KEY = "ngajiceria:progress-events:v1";
let fallbackPendingEvents: ServerProgressEvent[] | null = null;
const rewardQueue: PendingReward[] = [];
let rewardSeq = 0;

function rewardEvent() { window.dispatchEvent(new CustomEvent(REWARD_EVENT)); }

/** Antrean hadiah yang menunggu dirayakan lewat peti. Saldo sudah masuk saat push. */
export function pushReward(coins: number, label: string): PendingReward | null {
  if (!Number.isFinite(coins) || coins <= 0) return null;
  const reward: PendingReward = { id: `reward-${Date.now()}-${rewardSeq++}`, coins: Math.floor(coins), label };
  rewardQueue.push(reward);
  rewardEvent();
  return reward;
}

export function takeRewards(): PendingReward[] {
  return rewardQueue.splice(0, rewardQueue.length);
}

export function subscribeRewards(listener: () => void): () => void {
  window.addEventListener(REWARD_EVENT, listener);
  return () => window.removeEventListener(REWARD_EVENT, listener);
}

/** Hibah koin langsung (klaim misi, bonus streak) + masuk antrean peti. */
export function grantCoins(coins: number, label: string): GameProgress {
  const current = getProgress();
  const amount = nonNegativeInteger(coins);
  const next: GameProgress = { ...current, coins: current.coins + amount };
  saveProgress(next);
  pushReward(amount, label);
  return next;
}

/** Tambahkan XP tanpa menghitung ulang sesi game atau jumlah permainan. */
export function grantXp(xp: number): GameProgress {
  const amount = nonNegativeInteger(xp);
  const current = getProgress();
  const next: GameProgress = { ...current, xp: current.xp + amount };
  saveProgress(next);
  return next;
}

export interface RankInfo { title: string; minXp: number; nextXp: number | null }
export interface LeaderboardEntry { id: string; name: string; score: number; gameId: string; updatedAt: number }

export const ACHIEVEMENT_LABELS: Record<string, { title: string; description: string }> = {
  ...Object.fromEntries([1, 2, 3, 4, 5, 6].map((jilid) => [`jilid-${jilid}-clear`, { title: `Qari Cilik Jilid ${jilid}`, description: `Selesaikan seluruh halaman Jilid ${jilid}.` }])),
  "pejuang-istiqomah": { title: "Pejuang Istiqomah", description: "Belajar lima hari berturut-turut." },
  "qari-cepat": { title: "Qari Cepat", description: "Jawab 5 soal tepat dan cepat berturut-turut." },
  "pejuang-tajwid": { title: "Pejuang Tajwid", description: "Tuntaskan satu permainan Tajwid Lab." },
  "first-game": { title: "Langkah Pertama", description: "Menyelesaikan game pertama." },
  "doa-dungeon-clear": { title: "Penjaga Doa", description: "Menaklukkan Doa Dungeon." },
  "nabi-chronicles-complete": { title: "Pemburu Hikmah", description: "Menyelesaikan Nabi Chronicles." },
  "malaikat-master": { title: "Mission Master", description: "Menyelesaikan Malaikat Mission." },
  "ayat-hunter-clear": { title: "Penemu Ayat", description: "Menemukan seluruh misi Ayat Hunter." },
  "tetris-lines": { title: "Penata Tajwid", description: "Mencetak skor di Tajwid Tetris." },
};

export const LEADERBOARD_GAME_IDS = ["ayat-hunter", "doa-dungeon", "nabi-chronicles", "malaikat-mission", "tajwid-tetris"];

const emptyDaily = (): DailyProgress => ({ date: activityDate(), gamesPlayed: 0, totalScore: 0, claimedMissions: [] });
let fallbackProgress: GameProgress | null = null;
const DEFAULT_ENTRIES = [
  { name: "Alya", score: 760 },
  { name: "Rafi", score: 540 },
  { name: "Naila", score: 320 },
];

function progressEvent() { window.dispatchEvent(new CustomEvent(PROGRESS_EVENT)); }
function leaderboardEvent() { window.dispatchEvent(new CustomEvent(LEADERBOARD_EVENT)); }

export function getProgress(): GameProgress {
  let parsed: Partial<GameProgress> | null = fallbackProgress;
  try {
    if (!parsed) parsed = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null");
  } catch { /* Storage tidak tersedia; gunakan saldo sesi. */ }
  const daily = parsed?.daily?.date === activityDate() ? parsed.daily : emptyDaily();
  return {
    xp: nonNegativeInteger(parsed?.xp),
    totalScore: nonNegativeInteger(parsed?.totalScore),
    gamesPlayed: nonNegativeInteger(parsed?.gamesPlayed),
    coins: nonNegativeInteger(parsed?.coins),
    achievements: stringList(parsed?.achievements),
    daily: {
      date: daily.date,
      gamesPlayed: nonNegativeInteger(daily.gamesPlayed),
      totalScore: nonNegativeInteger(daily.totalScore),
      claimedMissions: stringList(daily.claimedMissions),
    },
  };
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string"))] : [];
}

export function saveProgress(progress: GameProgress): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    fallbackProgress = null;
  } catch { fallbackProgress = progress; }
  progressEvent();
}

function fromServerProgress(server: ServerNgajiProgress): GameProgress {
  return {
    xp: Math.max(0, server.xp || 0),
    totalScore: Math.max(0, server.totalScore || 0),
    gamesPlayed: Math.max(0, server.gamesPlayed || 0),
    coins: Math.max(0, server.coins || 0),
    achievements: Array.isArray(server.achievements) ? server.achievements : [],
    daily: {
      date: server.dailyDate || activityDate(),
      gamesPlayed: Math.max(0, server.dailyGamesPlayed || 0),
      totalScore: Math.max(0, server.dailyTotalScore || 0),
      claimedMissions: Array.isArray(server.dailyClaimedMissions) ? server.dailyClaimedMissions : [],
    },
  };
}

export function applyServerProgress(server: ServerNgajiProgress): GameProgress {
  const progress = fromServerProgress(server);
  saveProgress(progress);
  hydrateActivity(server.lastActivityDate ?? null, server.currentStreak || 0);
  return progress;
}

function readPendingEvents(): ServerProgressEvent[] {
  if (fallbackPendingEvents) return fallbackPendingEvents;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PENDING_EVENTS_KEY) ?? "[]") as ServerProgressEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writePendingEvents(events: ServerProgressEvent[]): void {
  try { window.localStorage.setItem(PENDING_EVENTS_KEY, JSON.stringify(events)); fallbackPendingEvents = null; }
  catch { fallbackPendingEvents = events; }
}

function queueProgressEvent(event: ServerProgressEvent): void {
  const events = readPendingEvents();
  if (!events.some((item) => item.eventId === event.eventId)) writePendingEvents([...events, event]);
}

function removePendingEvent(eventId: string): void {
  writePendingEvents(readPendingEvents().filter((event) => event.eventId !== eventId));
}

function newEventId(gameId: string): string {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${gameId}-${suffix}`;
}

let syncing: Promise<void> | null = null;
async function flushProgressEvents(): Promise<void> {
  if (syncing) return syncing;
  if (!isNgajiCeriaServerAvailable() || !getToken()) return;
  syncing = (async () => { while (true) {
    const event = readPendingEvents()[0];
    if (!event) break;
    try {
      // EventId membuat retry idempotent untuk XP dan papan skor.
      const result = await ngajiCeriaApi.submitLeaderboard(event);
      removePendingEvent(event.eventId);
      if (readPendingEvents().length === 0) applyServerProgress(result.progress);
      leaderboardEvent();
    } catch { break; }
  } })().finally(() => { syncing = null; });
  return syncing;
}

export async function syncNgajiCeriaProgress(): Promise<void> {
  if (!isNgajiCeriaServerAvailable() || !getToken()) return;
  try {
    await flushProgressEvents();
    if (!readPendingEvents().length) {
      const server = await ngajiCeriaApi.getProgress();
      if (!readPendingEvents().length) applyServerProgress(server);
    }
  } catch { /* Offline/member API belum tersedia: local progress tetap dipakai. */ }
}

export function getRank(xp: number): RankInfo {
  const ranks = [
    { title: "Pemula", minXp: 0 },
    { title: "Penjelajah", minXp: 250 },
    { title: "Penghafal", minXp: 700 },
    { title: "Guru Muda", minXp: 1400 },
    { title: "Ustadz Cilik", minXp: 2500 },
  ];
  const current = [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0];
  const next = ranks.find((rank) => rank.minXp > current.minXp);
  return { ...current, nextXp: next?.minXp ?? null };
}

export function awardProgress(gameId: string, score: number, baseXp: number, achievementIds: string[] = []): GameProgress {
  gameId = gameId.split(":")[0];
  score = nonNegativeInteger(score);
  baseXp = nonNegativeInteger(baseXp);
  const current = getProgress();
  const achievements = new Set(current.achievements);
  recordActivity();
  if (getNgajiActivity().currentStreak >= 5) achievementIds = [...achievementIds, "pejuang-istiqomah"];
  achievements.add("first-game");
  achievementIds.forEach((id) => achievements.add(id));
  const earnedCoins = Math.max(5, Math.floor((baseXp + score) / 10));
  const next: GameProgress = {
    xp: current.xp + Math.max(baseXp, Math.floor(score / 10)),
    totalScore: current.totalScore + Math.max(0, score),
    gamesPlayed: current.gamesPlayed + 1,
    achievements: [...achievements],
    coins: (current.coins || 0) + earnedCoins,
    daily: { ...current.daily, gamesPlayed: current.daily.gamesPlayed + 1, totalScore: current.daily.totalScore + score },
  };
  saveProgress(next);
  const event: ServerProgressEvent = {
    eventId: newEventId(gameId),
    gameId,
    score,
    baseXp,
    achievementIds: [...new Set(["first-game", ...achievementIds])],
  };
  queueProgressEvent(event);
  void flushProgressEvents();
  pushReward(earnedCoins, `Hadiah Game ${gameId}`);
  return next;
}

function leaderboardKey(gameId: string) { return `ngajiceria:leaderboard:${gameId}:v1`; }

export function getLeaderboard(gameId: string): LeaderboardEntry[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(leaderboardKey(gameId)) ?? "null") as LeaderboardEntry[] | null;
    if (Array.isArray(stored)) return stored.sort((a, b) => b.score - a.score).slice(0, 10);
  } catch { /* Use the offline seed below. */ }
  return DEFAULT_ENTRIES.map((entry, index) => ({ ...entry, id: `${gameId}:seed:${index}`, gameId, updatedAt: 0 }));
}

export function recordLeaderboard(gameId: string, score: number): LeaderboardEntry[] {
  const previous = getLeaderboard(gameId).find((entry) => entry.name === "Kamu")?.score ?? 0;
  score = Math.max(previous, nonNegativeInteger(score));
  const entries = getLeaderboard(gameId).filter((entry) => entry.name !== "Kamu");
  entries.push({ id: `${gameId}:kamu`, name: "Kamu", score, gameId, updatedAt: Date.now() });
  const next = entries.sort((a, b) => b.score - a.score).slice(0, 10);
  try { window.localStorage.setItem(leaderboardKey(gameId), JSON.stringify(next)); } catch { /* Score remains visible for this render. */ }
  leaderboardEvent();
  return next;
}

export function useNgajiProgress() {
  const [progress, setProgress] = useState(getProgress);
  useEffect(() => {
    const refresh = () => setProgress(getProgress());
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(PROGRESS_EVENT, refresh);
  }, []);
  useEffect(() => {
    const sync = () => { void syncNgajiCeriaProgress(); };
    sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);
  return progress;
}

export function subscribeProgress(listener: () => void): () => void {
  window.addEventListener(PROGRESS_EVENT, listener);
  return () => window.removeEventListener(PROGRESS_EVENT, listener);
}

export function useLeaderboardRecord(gameId: string) {
  const [entries, setEntries] = useState(() => getLeaderboard(gameId));
  useEffect(() => {
    const refresh = () => setEntries(getLeaderboard(gameId));
    window.addEventListener(LEADERBOARD_EVENT, refresh);
    return () => window.removeEventListener(LEADERBOARD_EVENT, refresh);
  }, [gameId]);
  return entries;
}
