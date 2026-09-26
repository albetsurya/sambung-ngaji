import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey, migrateKey } from "../lib/scopedStorage";

const BASE_KEY = "doa-favorites";

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

function persist(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
  }
}

export function useDoaFavorites() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = scopedKey(BASE_KEY, userId);

  const [favorites, setFavorites] = useState<Set<string>>(() =>
    load(storageKey),
  );

  useEffect(() => {
    if (userId) {
      migrateKey(BASE_KEY, storageKey);
    }
    setFavorites(load(storageKey));
  }, [storageKey, userId]);

  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === storageKey) setFavorites(load(storageKey));
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        persist(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  const reset = useCallback(() => {
    setFavorites(new Set());
    persist(storageKey, new Set());
  }, [storageKey]);

  return { favorites, isFavorite, toggle, reset, count: favorites.size };
}
