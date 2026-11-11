import { create } from "zustand";

import { getProgress, pushReward, saveProgress } from "../pages/games/_shared/progression";
import {
  eventApi,
  type ClaimEventMissionResult,
  type EventActionType,
  type EventInfo,
  type EventMission,
} from "../services/eventApi";

export interface EventBalances {
  coins: number;
  tickets: number;
  hearts: number;
}

interface EventState {
  activeEvent: EventInfo | null;
  missions: EventMission[];
  isLoading: boolean;
  claimingId: string | null;
  balances: EventBalances | null;
  fetchActiveEvent: () => Promise<void>;
  trackProgress: (actionType: EventActionType) => Promise<void>;
  claimReward: (missionId: string) => Promise<ClaimEventMissionResult>;
}

/** Koin dari server adalah sumber kebenaran; simpan agar UI langsung ikut. */
function applyClaimedCoins(coins: number): void {
  if (!Number.isFinite(coins) || coins < 0) return;
  const progress = getProgress();
  const next = Math.floor(coins);
  if (progress.coins !== next) saveProgress({ ...progress, coins: next });
}

export const useEventStore = create<EventState>((set, get) => ({
  activeEvent: null,
  missions: [],
  isLoading: false,
  claimingId: null,
  balances: null,

  fetchActiveEvent: async () => {
    set({ isLoading: true });
    try {
      const response = await eventApi.getActiveEvent();
      set({
        activeEvent: response.event,
        missions: response.missions ?? [],
        isLoading: false,
      });
    } catch {
      // Biarkan data terakhir tetap tampil bila server sedang tidak tersedia.
      set({ isLoading: false });
    }
  },

  trackProgress: async (actionType) => {
    try {
      const response = await eventApi.trackProgress(actionType);
      set({
        activeEvent: response.event,
        missions: response.missions ?? [],
      });
    } catch {
      // Progres game tidak boleh gagal hanya karena event tidak tersedia.
    }
  },

  claimReward: async (missionId) => {
    set({ claimingId: missionId });
    try {
      const result = await eventApi.claimMission(missionId);
      const rewardCoins = result.reward?.coins ?? 0;
      set((state) => ({
        missions: state.missions.map((mission) =>
          mission.id === missionId ? { ...mission, is_claimed: true } : mission,
        ),
        balances: {
          coins: result.coins,
          tickets: result.tickets,
          hearts: result.hearts,
        },
        claimingId: null,
      }));
      applyClaimedCoins(result.coins);
      if (rewardCoins > 0) pushReward(rewardCoins, "Hadiah Misi Event");
      void get().fetchActiveEvent();
      return result;
    } catch (error) {
      set({ claimingId: null });
      throw error;
    }
  },
}));
