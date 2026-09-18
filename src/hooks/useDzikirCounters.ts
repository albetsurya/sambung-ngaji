import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey } from "../lib/scopedStorage";

const BASE_PREFIX = "dzikir-counts";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function buildKey(userId: string | null): string {
  const base = BASE_PREFIX + "-" + todayIso();
  return scopedKey(base, userId);
}

function load(key: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === "number" && v >= 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function persist(key: string, counts: Record<string, number>) {
  try {
    localStorage.setItem(key, JSON.stringify(counts));
  } catch {
    // ignore
  }
}

export function useDzikirCounters() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = buildKey(userId);

  const [counts, setCounts] = useState<Record<string, number>>(() =>
    load(storageKey),
  );

  // Reload saat user berubah + reset kalau ganti hari
  useEffect(() => {
    setCounts(load(storageKey));
    const t = setInterval(() => {
      const freshKey = buildKey(userId);
      if (freshKey !== storageKey) {
        setCounts(load(freshKey));
      }
    }, 60_000);
    return () => clearInterval(t);
  }, [storageKey, userId]);

  const increment = useCallback(
    (id: string) => {
      setCounts((prev) => {
        const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(
    (id: string) => {
      setCounts((prev) => {
        const next = { ...prev };
        delete next[id];
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const resetAll = useCallback(() => {
    setCounts({});
    persist(storageKey, {});
  }, [storageKey]);

  const getCount = useCallback(
    (id: string) => counts[id] ?? 0,
    [counts],
  );

  return { counts, getCount, increment, reset, resetAll };
}

export function vibrate(ms: number | number[] = 30) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    // ignore
  }
}
