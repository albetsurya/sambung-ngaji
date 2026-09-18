import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { scopedKey, migrateKey } from "../lib/scopedStorage";

const LAST_READ_BASE = "quran-last-read";
const BOOKMARK_BASE = "quran-bookmarks";

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

/* ---------- Load / Save ---------- */

function loadLastRead(key: string): LastRead | null {
  try {
    const raw = localStorage.getItem(key);
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

function persistLastRead(key: string, v: LastRead | null) {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {
    // ignore
  }
}

function loadBookmarks(key: string): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(key);
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

function persistBookmarks(key: string, list: BookmarkEntry[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/* ---------- Hook ---------- */

export function useQuranBookmark() {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;

  const lastReadKey = scopedKey(LAST_READ_BASE, userId);
  const bookmarkKey = scopedKey(BOOKMARK_BASE, userId);

  const [lastRead, setLastReadState] = useState<LastRead | null>(() =>
    loadLastRead(lastReadKey),
  );
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(() =>
    loadBookmarks(bookmarkKey),
  );

  // Reload saat user berubah + migrasi key lama
  useEffect(() => {
    if (userId) {
      migrateKey(LAST_READ_BASE, lastReadKey);
      migrateKey(BOOKMARK_BASE, bookmarkKey);
    }
    setLastReadState(loadLastRead(lastReadKey));
    setBookmarks(loadBookmarks(bookmarkKey));
  }, [lastReadKey, bookmarkKey, userId]);

  // Sinkron antar tab
  useEffect(() => {
    function handler(e: StorageEvent) {
      if (e.key === lastReadKey) setLastReadState(loadLastRead(lastReadKey));
      if (e.key === bookmarkKey) setBookmarks(loadBookmarks(bookmarkKey));
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [lastReadKey, bookmarkKey]);

  const setLastRead = useCallback(
    (v: LastRead) => {
      setLastReadState(v);
      persistLastRead(lastReadKey, v);
    },
    [lastReadKey],
  );

  const clearLastRead = useCallback(() => {
    setLastReadState(null);
    persistLastRead(lastReadKey, null);
  }, [lastReadKey]);

  const isBookmarked = useCallback(
    (surahNomor: number, ayatNomor: number) =>
      bookmarks.some(
        (b) => b.surahNomor === surahNomor && b.ayatNomor === ayatNomor,
      ),
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (entry: BookmarkEntry) => {
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
        persistBookmarks(bookmarkKey, next);
        return next;
      });
    },
    [bookmarkKey],
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    persistBookmarks(bookmarkKey, []);
  }, [bookmarkKey]);

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
