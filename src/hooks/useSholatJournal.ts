import { useCallback, useEffect, useState } from "react";
import {
  todayIso,
  isoDate,
  type WaktuSholat,
  type StatusSholat,
} from "../data/sholat";

const STORAGE_KEY = "sholat-journal-v1";

/**
 * Format: { "2026-09-18": { subuh: "tepat", dzuhur: "belum", ... }, ... }
 */
export type JournalEntry = Partial<Record<WaktuSholat, StatusSholat>>;
export type JournalData = Record<string, JournalEntry>;

/* -------------------------------------------------------------------------- */
/*                              Persist                                       */
/* -------------------------------------------------------------------------- */

function load(): JournalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as JournalData;
  } catch {
    return {};
  }
}

function persist(data: JournalData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota
  }
}

/* -------------------------------------------------------------------------- */
/*                              Stats helpers                                 */
/* -------------------------------------------------------------------------- */

const WAKTU_ORDER: WaktuSholat[] = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];

/** Berapa waktu yang sudah dicatat (bukan 'belum' dan bukan undefined) */
export function countRecorded(entry: JournalEntry): number {
  return WAKTU_ORDER.filter((k) => {
    const s = entry[k];
    return s && s !== "belum";
  }).length;
}

/** Berapa waktu yang 'tepat' */
export function countTepat(entry: JournalEntry): number {
  return WAKTU_ORDER.filter((k) => entry[k] === "tepat").length;
}

/** Apakah entry lengkap (semua 5 waktu dicatat dengan status valid, minimal tidak 'belum') */
export function isComplete(entry: JournalEntry): boolean {
  return WAKTU_ORDER.every((k) => {
    const s = entry[k];
    return s && s !== "belum";
  });
}

/**
 * Hitung streak: berapa hari berturut-turut dari HARI INI ke belakang,
 * yang entry-nya lengkap (semua 5 waktu dicatat).
 * Hari ini belum lengkap → streak dianggap berjalan dari kemarin.
 */
export function calculateStreak(data: JournalData): number {
  let streak = 0;
  const today = new Date();
  let started = false;

  // Iterasi mundur dari hari ini
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = isoDate(d);
    const entry = data[iso];

    if (!entry) {
      // Hari ini belum ada entry → masih boleh streak dari kemarin
      if (i === 0) continue;
      break;
    }

    if (isComplete(entry)) {
      streak++;
      started = true;
    } else {
      // Hari ini belum lengkap → kalau belum start, lanjut cek kemarin
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
  const [data, setData] = useState<JournalData>(() => load());

  // Sinkron antar tab
  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setData(load());
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  /** Set status 1 waktu untuk tanggal tertentu */
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
        persist(next);
        return next;
      });
    },
    [],
  );

  /** Ambil entry 1 tanggal */
  const getEntry = useCallback(
    (tanggal: string): JournalEntry => data[tanggal] ?? {},
    [data],
  );

  /** Ambil entry untuk N hari terakhir (untuk history) */
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

  /** Reset 1 tanggal */
  const resetDate = useCallback((tanggal: string) => {
    setData((prev) => {
      const next = { ...prev };
      delete next[tanggal];
      persist(next);
      return next;
    });
  }, []);

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

/* -------------------------------------------------------------------------- */
/*                              Export helper                                 */
/* -------------------------------------------------------------------------- */

export { WAKTU_ORDER };
