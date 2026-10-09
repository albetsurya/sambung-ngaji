import { useNgajiCeriaStore, NgajiCeriaState } from "./useNgajiCeriaStore";
import { activityDate, yesterdayActivityDate } from "../utils/activityDate";

export function useNgajiCeriaStreak() {
  const streakDays = useNgajiCeriaStore((state: NgajiCeriaState) => state.streakDays);
  const currentStreak = useNgajiCeriaStore((state: NgajiCeriaState) => state.currentStreak);
  const lastPlayedAt = useNgajiCeriaStore((state: NgajiCeriaState) => state.lastPlayedAt);
  const active = lastPlayedAt === activityDate() || lastPlayedAt === yesterdayActivityDate();
  
  return {
    streakDays: active ? streakDays : Array<boolean>(7).fill(false),
    currentStreak: active ? currentStreak : 0,
    isLoading: false,
  };
}
