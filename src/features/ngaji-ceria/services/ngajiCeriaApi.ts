import { callREST } from "../../../services/api";
import { API_BASE_URL } from "../../../constants";

/** Vite dev tanpa backend proxy harus tetap memakai progress offline tanpa noisy CORS error. */
export const isNgajiCeriaServerAvailable = () => Boolean(API_BASE_URL) || !import.meta.env.DEV;

export interface ServerNgajiProgress {
  xp: number;
  totalScore: number;
  gamesPlayed: number;
  coins: number;
  currentStreak: number;
  lastActivityDate?: string;
  dailyDate: string;
  dailyGamesPlayed: number;
  dailyTotalScore: number;
  dailyClaimedMissions: string[];
  achievements: string[];
}

export interface ServerProgressEvent {
  eventId: string;
  gameId: string;
  score: number;
  baseXp: number;
  achievementIds: string[];
}

export interface MissionRewardResponse {
  missionId: string;
  claimed: boolean;
  coins: number;
  xp: number;
  progress: ServerNgajiProgress;
}

export interface ServerLeaderboardEntry {
  id: string;
  name: string;
  score: number;
  gameId: string;
  updatedAt: string;
}

export interface ServerLeaderboardResponse {
  gameId: string;
  period: "daily" | "weekly";
  entries: ServerLeaderboardEntry[];
}

export const ngajiCeriaApi = {
  getProgress: () => callREST<ServerNgajiProgress>("GET", "/api/v1/ngaji-ceria/progress"),
  awardProgress: (event: ServerProgressEvent) => callREST<ServerNgajiProgress>("POST", "/api/v1/ngaji-ceria/progress/events", event),
  claimMission: (missionId: string) => callREST<MissionRewardResponse>("POST", `/api/v1/ngaji-ceria/missions/${encodeURIComponent(missionId)}/claim`),
  getLeaderboard: (gameId: string, period: "daily" | "weekly" = "weekly") => callREST<ServerLeaderboardResponse>("GET", "/api/v1/ngaji-ceria/leaderboard", undefined, { gameId, period }),
  submitLeaderboard: (event: ServerProgressEvent) => callREST<{ progress: ServerNgajiProgress }>("POST", "/api/v1/ngaji-ceria/leaderboard", event),
};
