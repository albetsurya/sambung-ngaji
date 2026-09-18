import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey, migrateKey } from "../lib/scopedStorage";
import {
  TAHFIDZ_TARGETS,
  ayatKey,
  targetCount,
  type TahfidzTarget,
} from "../data/tahfidz";

const BASE_KEY = "tahfidz-v1";

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

export interface AyatState {
  hafal: boolean;
  hafalSince?: number;
  lastReview?: number;
}

export type TahfidzData = Record<string, AyatState>;

/* -------------------------------------------------------------------------- */
/*                              Persist                                       */
/* -------------------------------------------------------------------------- */

function load(key: string): TahfidzData {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as TahfidzData;
  } catch {
    return {};
  }
}

function persist(key: string, data: TahfidzData) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*                              Stats helpers                                 */
/* -------------------------------------------------------------------------- */

export interface SurahProgress {
  target: TahfidzTarget;
  total: number;
  hafal: number;
  percentage: number;
  complete: boolean;
}

export function getSurahProgress(
  data: TahfidzData,
  target: TahfidzTarget,
): SurahProgress {
  const total = targetCount(target);
  let hafal = 0;
  for (let a = target.ayatStart; a <= target.ayatEnd; a++) {
    const s = data[ayatKey(target.surah, a)];
    if (s?.hafal) hafal++;
  }
  const percentage = total > 0 ? Math.round((hafal / total) * 100) : 0;
  return {
    target,
    total,
    hafal,
    percentage,
    complete: hafal === total && total > 0,
  };
}

export function getOverallStats(data: TahfidzData) {
  let totalHafal = 0;
  let totalAyat = 0;
  let surahSelesai = 0;
  let surahMulai = 0;

  for (const target of TAHFIDZ_TARGETS) {
    const p = getSurahProgress(data, target);
    totalHafal += p.hafal;
    totalAyat += p.total;
    if (p.complete) surahSelesai++;
    else if (p.hafal > 0) surahMulai++;
  }

  const percentage =
    totalAyat > 0 ? Math.round((totalHafal / totalAyat) * 100) : 0;

  return {
    totalHafal,
    totalAyat,
    surahSelesai,
    surahMulai,
    totalSurah: TAHFIDZ_TARGETS.length,
    percentage,
  };
}

export function getReviewQueue(
  data: TahfidzData,
  limit: number = 5,
): { key: string; surah: number; ayat: number; state: AyatState }[] {
  const candidates: {
    key: string;
    surah: number;
    ayat: number;
    state: AyatState;
    score: number;
  }[] = [];

  for (const [key, state] of Object.entries(data)) {
    if (!state.hafal) continue;
    const [s, a] = key.split(":").map(Number);
    if (!Number.isInteger(s) || !Number.isInteger(a)) continue;

    const last = state.lastReview ?? state.hafalSince ?? 0;
    const ageDays = (Date.now() - last) / (1000 * 60 * 60 * 24);

    candidates.push({ key, surah: s, ayat: a, state, score: ageDays });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, limit).map((c) => ({
    key: c.key,
    surah: c.surah,
    ayat: c.ayat,
    state: c.state,
  }));
}

/* -------------------------------------------------------------------------- */
/*                              Hook                                          */
/* -------------------------------------------------------------------------- */

export function useTahfidz() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = scopedKey(BASE_KEY, userId);

  const [data, setData] = useState<TahfidzData>(() => load(storageKey));

  // Reload saat user berubah + migrasi key lama
  useEffect(() => {
    if (userId) {
      migrateKey(BASE_KEY, storageKey);
    }
    setData(load(storageKey));
  }, [storageKey, userId]);

  // Sinkron antar tab
  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === storageKey) setData(load(storageKey));
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  const isHafal = useCallback(
    (surah: number, ayat: number) => {
      return data[ayatKey(surah, ayat)]?.hafal ?? false;
    },
    [data],
  );

  const toggleHafal = useCallback(
    (surah: number, ayat: number) => {
      setData((prev) => {
        const key = ayatKey(surah, ayat);
        const existing = prev[key];
        const next = { ...prev };

        if (existing?.hafal) {
          delete next[key];
        } else {
          const now = Date.now();
          next[key] = {
            hafal: true,
            hafalSince: existing?.hafalSince ?? now,
            lastReview: now,
          };
        }

        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const markReviewed = useCallback(
    (surah: number, ayat: number) => {
      setData((prev) => {
        const key = ayatKey(surah, ayat);
        const existing = prev[key];
        if (!existing?.hafal) return prev;
        const next = {
          ...prev,
          [key]: { ...existing, lastReview: Date.now() },
        };
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    setData({});
    persist(storageKey, {});
  }, [storageKey]);

  const getState = useCallback(
    (surah: number, ayat: number): AyatState | undefined =>
      data[ayatKey(surah, ayat)],
    [data],
  );

  return {
    data,
    isHafal,
    toggleHafal,
    markReviewed,
    getState,
    reset,
  };
}
