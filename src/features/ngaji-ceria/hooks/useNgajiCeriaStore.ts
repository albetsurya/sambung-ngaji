import { useSyncExternalStore } from "react";
import { activityDate, yesterdayActivityDate } from "../utils/activityDate";

export interface NgajiCeriaState {
  stars: Record<string, number>;
  lastPlayedAt: string | null;
  currentStreak: number;
  streakDays: boolean[];
}

const STORAGE_KEY = "ngaji-ceria-progress";

function getUserScope(): string {
  try {
    const cached = JSON.parse(localStorage.getItem("sambung_ngaji_cached_user") || "null") as { user_id?: unknown } | null;
    if (typeof cached?.user_id === "string" && cached.user_id.trim()) {
      return cached.user_id.trim();
    }
  } catch {
    // Guest scope remains the safe fallback when the cached identity is invalid.
  }
  return "guest";
}

export function getNgajiCeriaScope(): string {
  return getUserScope();
}

function scopedStorageKey(scope: string): string {
  // Keep the guest key stable for backwards compatibility. Authenticated data
  // must never share that key with another account.
  return scope === "guest" ? STORAGE_KEY : `${STORAGE_KEY}:${encodeURIComponent(scope)}`;
}

function loadState(scope: string): NgajiCeriaState {
  try {
    const raw = localStorage.getItem(scopedStorageKey(scope));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        stars: parsed.stars || {},
        lastPlayedAt: parsed.lastPlayedAt || null,
        currentStreak: parsed.currentStreak || 0,
        streakDays: Array.isArray(parsed.streakDays) ? parsed.streakDays : Array(7).fill(false),
      };
    }
  } catch {
    // Fallback if parsing fails
  }
  return {
    stars: {},
    lastPlayedAt: null,
    currentStreak: 0,
    streakDays: Array(7).fill(false),
  };
}

let currentScope = getUserScope();
let currentState: NgajiCeriaState = loadState(currentScope);
export const getNgajiActivity = () => {
  ensureScope();
  return currentState;
};
const listeners = new Set<() => void>();

function ensureScope(): void {
  const nextScope = getUserScope();
  if (nextScope === currentScope) return;
  currentScope = nextScope;
  currentState = loadState(currentScope);
}

function emitChange() {
  try {
    localStorage.setItem(scopedStorageKey(currentScope), JSON.stringify(currentState));
  } catch {
    // localStorage full or disabled
  }
  listeners.forEach((listener) => listener());
}

export function awardStars(jilid: number, page: number, score: number) {
  ensureScope();
  const key = `jilid-${jilid}-hal-${page}`;
  const currentStars = currentState.stars[key] || 0;
  let earnedStars = 1;
  if (score >= 90) earnedStars = 3;
  else if (score >= 70) earnedStars = 2;

  if (earnedStars > currentStars) {
    currentState = {
      ...currentState,
      stars: { ...currentState.stars, [key]: earnedStars },
    };
    emitChange();
  }
}

export function recordActivity() {
  ensureScope();
  const now = new Date();
  const today = activityDate(now);

  if (currentState.lastPlayedAt === today) return;

  const newStreak = currentState.lastPlayedAt === yesterdayActivityDate(now) ? currentState.currentStreak + 1 : 1;
  const newStreakDays = Array<boolean>(7).fill(false);
  for (let daysAgo = 0; daysAgo < Math.min(7, newStreak); daysAgo++) {
    newStreakDays[(now.getDay() - daysAgo + 7) % 7] = true;
  }

  currentState = {
    ...currentState,
    lastPlayedAt: today,
    currentStreak: newStreak,
    streakDays: newStreakDays,
  };
  emitChange();
}

export function hydrateActivity(lastPlayedAt: string | null, currentStreak: number) {
  ensureScope();
  currentState = {
    ...currentState,
    lastPlayedAt,
    currentStreak: Math.max(0, Math.floor(currentStreak)),
  };
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureScope();
  return currentState;
}

export function useNgajiCeriaStore<T>(selector: (state: NgajiCeriaState) => T): T {
  ensureScope();
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector(state);
}
