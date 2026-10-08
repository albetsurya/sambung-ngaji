import { useNgajiCeriaStore, NgajiCeriaState } from "./useNgajiCeriaStore";

export function useNgajiCeriaStreak() {
  const streakDays = useNgajiCeriaStore((state: NgajiCeriaState) => state.streakDays);
  const currentStreak = useNgajiCeriaStore((state: NgajiCeriaState) => state.currentStreak);
  
  return {
    streakDays,
    currentStreak,
    isLoading: false,
  };
}
