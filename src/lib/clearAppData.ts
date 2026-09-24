import { del } from "idb-keyval";
import { queryClient } from "./queryClient";
import { createIDBPersister } from "./queryPersist";

/**
 * Flush data lokal supaya aplikasi kembali fresh, tanpa logout.
 *
 * Yang dibersihkan:
 * - React Query cache (memory) + persist IDB ("pengajian-query-cache")
 * - localStorage scoped user ("sng:{userId}:*" / "sng:anon:*")
 * - sessionStorage
 * - Cache Storage milik Workbox (JS/CSS basi), SW registration dipertahankan
 *
 * Yang dipertahankan: cookie token login + tema ("pengajian_theme/preset").
 */
export interface FlushResult {
  queryCleared: boolean;
  localKeys: number;
  cachesCleared: number;
}

export async function flushAppData(
  userId?: string | null,
): Promise<FlushResult> {
  const result: FlushResult = {
    queryCleared: false,
    localKeys: 0,
    cachesCleared: 0,
  };

  // 1. React Query memory + IDB persist.
  try {
    queryClient.clear();
    result.queryCleared = true;
  } catch {
    // ignore
  }
  try {
    await createIDBPersister().removeClient();
  } catch {
    try {
      await del("pengajian-query-cache");
    } catch {
      // ignore
    }
  }

  // 2. localStorage scoped user ini + anon (login & tema tidak ikut).
  try {
    const prefixes = ["sng:" + (userId || "anon") + ":"];
    if ((userId || "anon") !== "anon") prefixes.push("sng:anon:");
    const victims: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && prefixes.some((p) => k.startsWith(p))) victims.push(k);
    }
    victims.forEach((k) => localStorage.removeItem(k));
    result.localKeys = victims.length;
  } catch {
    // ignore (private mode)
  }

  // 3. sessionStorage.
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }

  // 4. Cache Storage (Workbox precache/runtime). SW tetap terdaftar.
  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(
        names.map(async (n) => {
          try {
            await caches.delete(n);
            result.cachesCleared++;
          } catch {
            // ignore per-cache
          }
        }),
      );
    }
  } catch {
    // ignore
  }

  return result;
}

/** Flush lalu reload supaya semua hook baca state fresh. */
export async function flushAndReload(
  userId?: string | null,
  delayMs = 600,
): Promise<FlushResult> {
  const res = await flushAppData(userId);
  await new Promise((r) => setTimeout(r, delayMs));
  window.location.reload();
  return res;
}
