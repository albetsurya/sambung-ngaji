import { useCallback, useEffect, useState } from "react";

const KEY = "mushaf-last-page";

function load(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= 604) return n;
  } catch {
    // ignore
  }
  return null;
}

export function useMushafBookmark() {
  const [lastPage, setLastPageState] = useState<number | null>(() => load());

  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === KEY) setLastPageState(load());
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setLastPage = useCallback((page: number) => {
    setLastPageState(page);
    try {
      localStorage.setItem(KEY, String(page));
    } catch {
      // ignore
    }
  }, []);

  const clear = useCallback(() => {
    setLastPageState(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);

  return { lastPage, setLastPage, clear };
}
