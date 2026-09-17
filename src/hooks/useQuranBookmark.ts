import { useCallback, useEffect, useState } from "react";

const LAST_READ_KEY = "quran-last-read";
const BOOKMARK_KEY = "quran-bookmarks";

export interface LastRead {
  surahNomor: number;
  surahNama: string;
  ayatNomor: number;
  timestamp: number;
}

export interface BookmarkEntry {
  surahNomor: number;
  surahNama: string;
  ayatNomor: number;
  ayatPreview: string;
  timestamp: number;
}

/* ---------- Last Read ---------- */

function loadLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.surahNomor === "number" &&
      typeof parsed?.ayatNomor === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function persistLastRead(v: LastRead | null) {
  try {
    if (v === null) localStorage.removeItem(LAST_READ_KEY);
    else localStorage.setItem(LAST_READ_KEY, JSON.stringify(v));
  } catch {
    // ignore
  }
}

/* ---------- Bookmarks ---------- */

function loadBookmarks(): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b: unknown): b is BookmarkEntry =>
        typeof b === "object" &&
        b !== null &&
        typeof (b as BookmarkEntry).surahNomor === "number" &&
        typeof (b as BookmarkEntry).ayatNomor === "number",
    );
  } catch {
    return [];
  }
}

function persistBookmarks(list: BookmarkEntry[]) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/* ---------- Hook ---------- */

export function useQuranBookmark() {
  const [lastRead, setLastReadState] = useState<LastRead | null>(() =>
    loadLastRead(),
  );
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(() =>
    loadBookmarks(),
  );

  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === LAST_READ_KEY) setLastReadState(loadLastRead());
      if (e.key === BOOKMARK_KEY) setBookmarks(loadBookmarks());
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setLastRead = useCallback((v: LastRead) => {
    setLastReadState(v);
    persistLastRead(v);
  }, []);

  const clearLastRead = useCallback(() => {
    setLastReadState(null);
    persistLastRead(null);
  }, []);

  const isBookmarked = useCallback(
    (surahNomor: number, ayatNomor: number) =>
      bookmarks.some(
        (b) => b.surahNomor === surahNomor && b.ayatNomor === ayatNomor,
      ),
    [bookmarks],
  );

  const toggleBookmark = useCallback((entry: BookmarkEntry) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) =>
          b.surahNomor === entry.surahNomor &&
          b.ayatNomor === entry.ayatNomor,
      );
      const next = exists
        ? prev.filter(
            (b) =>
              !(
                b.surahNomor === entry.surahNomor &&
                b.ayatNomor === entry.ayatNomor
              ),
          )
        : [entry, ...prev];
      persistBookmarks(next);
      return next;
    });
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    persistBookmarks([]);
  }, []);

  return {
    lastRead,
    setLastRead,
    clearLastRead,
    bookmarks,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    bookmarkCount: bookmarks.length,
  };
}
