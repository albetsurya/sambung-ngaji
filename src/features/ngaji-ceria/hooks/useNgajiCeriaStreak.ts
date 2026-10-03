export function useNgajiCeriaStreak() {
  // Mockup: 3 hari streak
  return {
    streakDays: [true, true, true, false, false, false, false],
    currentStreak: 3,
    isLoading: false,
  };
}
