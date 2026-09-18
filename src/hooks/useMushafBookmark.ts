import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey, migrateKey } from "../lib/scopedStorage";

const BASE_KEY = "mushaf-last-page";

function load(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= 604) return n;
  } catch {
    // ignore
  }
  return null;
}

export function useMushafBookmark() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;
  const storageKey = scopedKey(BASE_KEY, userId);

  const [lastPage, setLastPageState] = useState<number | null>(() =>
    load(storageKey),
  );

  // Reload saat user berubah + migrasi key lama
  useEffect(() => {
    if (userId) {
      migrateKey(BASE_KEY, storageKey);
    }
    setLastPageState(load(storageKey));
  }, [storageKey, userId]);

  // Sinkron antar tab
  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === storageKey) setLastPageState(load(storageKey));
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  const setLastPage = useCallback(
    (page: number) => {
      setLastPageState(page);
      try {
        localStorage.setItem(storageKey, String(page));
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    setLastPageState(null);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { lastPage, setLastPage, clear };
}
