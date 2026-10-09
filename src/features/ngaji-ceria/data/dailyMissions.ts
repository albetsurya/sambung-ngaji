import { getProgress, pushReward, saveProgress, applyServerProgress } from "../pages/games/_shared/progression";
import { getToken } from "../../../services/api";
import { isNgajiCeriaServerAvailable, ngajiCeriaApi } from "../services/ngajiCeriaApi";

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
}

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: "daily-games-1",
    title: "Semangat Ngaji",
    description: "Selesaikan 2 sesi game hari ini.",
    target: 2,
    rewardCoins: 30,
    rewardXp: 50,
  },
  {
    id: "daily-score-1",
    title: "Capaian Skor",
    description: "Kumpulkan total skor minimal 200.",
    target: 200,
    rewardCoins: 50,
    rewardXp: 80,
  },
  {
    id: "daily-first-game",
    title: "Langkah Pembuka",
    description: "Selesaikan 1 sesi game berhadiah hari ini.",
    target: 1,
    rewardCoins: 20,
    rewardXp: 30,
  },
];

const CLAIM_KEY = "ngajiceria:daily-claimed:v1";

function getClaimedToday(): string[] {
  const current = getProgress();
  let legacy: unknown = [];
  try {
    // Klaim versi lama memakai tanggal UTC; pertahankan agar upgrade tidak memberi hadiah dua kali.
    const dateKey = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem(`${CLAIM_KEY}:${dateKey}`);
    legacy = raw ? JSON.parse(raw) : [];
  } catch { /* Klaim tetap dapat dibaca dari progress baru. */ }
  return [...new Set([
    ...current.daily.claimedMissions,
    ...(Array.isArray(legacy)
      ? legacy.filter((id): id is string => typeof id === "string").map((id) => id === "daily-[#first-game]" ? "daily-first-game" : id)
      : []),
  ])];
}

export function isMissionClaimed(id: string): boolean {
  return getClaimedToday().includes(id);
}

export function claimMission(mission: DailyMission): boolean {
  const definedMission = DAILY_MISSIONS.find((item) => item.id === mission.id);
  if (!definedMission || isMissionClaimed(definedMission.id) || getMissionCurrentProgress(definedMission) < definedMission.target) return false;

  const current = getProgress();
  saveProgress({
    ...current,
    coins: current.coins + definedMission.rewardCoins,
    xp: current.xp + definedMission.rewardXp,
    daily: { ...current.daily, claimedMissions: [...getClaimedToday(), definedMission.id] },
  });
  pushReward(definedMission.rewardCoins, `Misi Harian: ${definedMission.title}`);
  if (isNgajiCeriaServerAvailable() && getToken()) {
    void ngajiCeriaApi.claimMission(definedMission.id)
      .then((response) => applyServerProgress(response.progress))
      .catch(() => { /* Offline fallback sudah diberikan secara lokal. */ });
  }
  return true;
}

export function getMissionCurrentProgress(mission: DailyMission): number {
  const p = getProgress();
  if (mission.id.includes("score")) return Math.min(p.daily.totalScore, mission.target);
  return Math.min(p.daily.gamesPlayed, mission.target);
}
