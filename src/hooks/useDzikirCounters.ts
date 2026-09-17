import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "dzikir-counts";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function storageKey(): string {
  return STORAGE_PREFIX + "-" + todayIso();
}

function load(): Record<string, number> {
  try {
    const raw = localStorage.getItem(storageKey());
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

function persist(counts: Record<string, number>) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(counts));
  } catch {
    // ignore
  }
}

export function useDzikirCounters() {
  const [counts, setCounts] = useState<Record<string, number>>(() => load());

  // Reset kalau ganti hari (mis. app dibuka lewat tengah malam)
  useEffect(() => {
    function checkDate() {
      const fresh = load();
      setCounts(fresh);
    }
    const t = setInterval(checkDate, 60_000);
    return () => clearInterval(t);
  }, []);

  const increment = useCallback((id: string) => {
    setCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback((id: string) => {
    setCounts((prev) => {
      const next = { ...prev };
      delete next[id];
      persist(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setCounts({});
    persist({});
  }, []);

  const getCount = useCallback((id: string) => counts[id] ?? 0, [counts]);

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
