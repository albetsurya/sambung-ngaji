import { useCallback, useEffect, useState } from "react";
import type { DoaWaktu } from "../data/doa";

const STORAGE_PREFIX = "doa-read";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function storageKey(waktu: DoaWaktu): string {
  return STORAGE_PREFIX + "-" + waktu + "-" + todayIso();
}

function load(waktu: DoaWaktu): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(waktu));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function save(waktu: DoaWaktu, ids: Set<string>) {
  try {
    localStorage.setItem(storageKey(waktu), JSON.stringify([...ids]));
  } catch {
    // ignore quota errors
  }
}

export function useDoaProgress(waktu: DoaWaktu, total: number) {
  const [readIds, setReadIds] = useState<Set<string>>(() => load(waktu));

  // Reset state kalau waktu berganti (pagi <-> sore)
  useEffect(() => {
    setReadIds(load(waktu));
  }, [waktu]);

  const toggle = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        save(waktu, next);
        return next;
      });
    },
    [waktu],
  );

  const reset = useCallback(() => {
    const empty = new Set<string>();
    setReadIds(empty);
    save(waktu, empty);
  }, [waktu]);

  const count = readIds.size;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return { readIds, toggle, reset, count, total, percentage };
}
