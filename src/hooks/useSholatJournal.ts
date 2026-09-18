import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey, migrateKey } from "../lib/scopedStorage";
import {
  todayIso,
  isoDate,
  type WaktuSholat,
  type StatusSholat,
} from "../data/sholat";

const BASE_KEY = "sholat-journal-v1";

export type JournalEntry = Partial<Record<WaktuSholat, StatusSholat>>;
export type JournalData = Record<string, JournalEntry>;

/* -------------------------------------------------------------------------- */
/*                              Persist                                       */
/* -------------------------------------------------------------------------- */

function load(key: string): JournalData {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as JournalData;
  } catch {
    return {};
  }
}

function persist(key: string, data: JournalData) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/* -------------------------------------------------------------------------- */
/*                              Stats helpers                                 */
/* -------------------------------------------------------------------------- */

const WAKTU_ORDER: WaktuSholat[] = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];

export function countRecorded(entry: JournalEntry): number {
  return WAKTU_ORDER.filter((k) => {
    const s = entry[k];
    return s && s !== "belum";
  }).length;
}

export function countTepat(entry: JournalEntry): number {
  return WAKTU_ORDER.filter((k) => entry[k] === "tepat").length;
}

export function isComplete(entry: JournalEntry): boolean {
  return WAKTU_ORDER.every((k) => {
    const s = entry[k];
    return s && s !== "belum";
  });
}

export function calculateStreak(data: JournalData): number {
  let streak = 0;
  const today = new Date();
  let started = false;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = isoDate(d);
    const entry = data[iso];

    if (!entry) {
      if (i === 0) continue;
      break;
    }

    if (isComplete(entry)) {
      streak++;
      started = true;
    } else {
      if (i === 0) continue;
      break;
    }
  }

  return started ? streak : 0;
}

/* -------------------------------------------------------------------------- */
/*                              Hook                                          */
/* -------------------------------------------------------------------------- */

export function useSholatJournal() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = scopedKey(BASE_KEY, userId);

  const [data, setData] = useState<JournalData>(() => load(storageKey));

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

  const setStatus = useCallback(
    (tanggal: string, waktu: WaktuSholat, status: StatusSholat) => {
      setData((prev) => {
        const entry = { ...(prev[tanggal] ?? {}) };
        if (status === "belum") {
          delete entry[waktu];
        } else {
          entry[waktu] = status;
        }
        const next = { ...prev };
        if (Object.keys(entry).length === 0) {
          delete next[tanggal];
        } else {
          next[tanggal] = entry;
        }
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const getEntry = useCallback(
    (tanggal: string): JournalEntry => data[tanggal] ?? {},
    [data],
  );

  const getHistory = useCallback(
    (days: number = 7): { tanggal: string; entry: JournalEntry }[] => {
      const out: { tanggal: string; entry: JournalEntry }[] = [];
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const iso = isoDate(d);
        out.push({ tanggal: iso, entry: data[iso] ?? {} });
      }
      return out;
    },
    [data],
  );

  const resetDate = useCallback(
    (tanggal: string) => {
      setData((prev) => {
        const next = { ...prev };
        delete next[tanggal];
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const today = todayIso();
  const todayEntry = data[today] ?? {};
  const streak = calculateStreak(data);

  return {
    data,
    today,
    todayEntry,
    streak,
    setStatus,
    getEntry,
    getHistory,
    resetDate,
  };
}

export { WAKTU_ORDER };
