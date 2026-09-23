import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey } from "../lib/scopedStorage";
import { calculateStreak } from "./useStreak";

const BASE = "dzikir-streak";

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((d: unknown) => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function persist(key: string, dates: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(dates));
  } catch {
    // ignore
  }
}

export function useDzikirStreak() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const key = scopedKey(BASE, userId);

  const [activeDates, setActiveDates] = useState<string[]>(() => load(key));

  useEffect(() => {
    setActiveDates(load(key));
  }, [key]);

  const recordToday = useCallback(() => {
    const iso = new Date().toISOString().slice(0, 10);
    setActiveDates((prev) => {
      if (prev.includes(iso)) return prev;
      const next = [...prev, iso];
      persist(key, next);
      return next;
    });
  }, [key]);

  const streak = calculateStreak(activeDates);

  return { streak, recordToday, activeDates };
}
