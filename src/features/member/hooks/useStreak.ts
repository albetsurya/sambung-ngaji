import { useMemo } from "react";

export function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;

  const sorted = [...new Set(dates)].sort();
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    if (sorted.includes(iso)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export function useStreak(activeDates: string[]) {
  return useMemo(() => calculateStreak(activeDates), [activeDates]);
}
