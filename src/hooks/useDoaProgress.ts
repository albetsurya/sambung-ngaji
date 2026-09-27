import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey } from "../lib/scopedStorage";
import type { DoaWaktu } from "../data/doa";

const BASE_PREFIX = "doa-read";

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function buildKey(waktu: DoaWaktu, userId: string | null): string {
  const base = BASE_PREFIX + "-" + waktu + "-" + todayIso();
  return scopedKey(base, userId);
}

function load(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function save(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
  }
}

export function useDoaProgress(waktu: DoaWaktu, total: number) {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = buildKey(waktu, userId);

  const [readIds, setReadIds] = useState<Set<string>>(() => load(storageKey));

  useEffect(() => {
    setReadIds(load(storageKey));
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setReadIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        save(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    const empty = new Set<string>();
    setReadIds(empty);
    save(storageKey, empty);
  }, [storageKey]);

  const count = readIds.size;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return { readIds, toggle, reset, count, total, percentage };
}
