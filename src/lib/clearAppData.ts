import { del } from "idb-keyval";
import { queryClient } from "./queryClient";
import { createIDBPersister } from "./queryPersist";

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

  try {
    queryClient.clear();
    result.queryCleared = true;
  } catch {
  }
  try {
    await createIDBPersister().removeClient();
  } catch {
    try {
      await del("pengajian-query-cache");
    } catch {
    }
  }

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
  }

  try {
    sessionStorage.clear();
  } catch {
  }

  try {
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(
        names.map(async (n) => {
          try {
            await caches.delete(n);
            result.cachesCleared++;
          } catch {
          }
        }),
      );
    }
  } catch {
  }

  return result;
}

export async function flushAndReload(
  userId?: string | null,
  delayMs = 600,
): Promise<FlushResult> {
  const res = await flushAppData(userId);
  await new Promise((r) => setTimeout(r, delayMs));
  window.location.reload();
  return res;
}
