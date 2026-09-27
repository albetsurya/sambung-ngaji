
const PREFIX = "sng";

export function scopedKey(
  baseKey: string,
  userId: string | null | undefined,
): string {
  const uid = userId || "anon";
  return PREFIX + ":" + uid + ":" + baseKey;
}

export function migrateKey(oldKey: string, newKey: string): void {
  if (oldKey === newKey) return;
  try {
    const old = localStorage.getItem(oldKey);
    if (!old) return;
    if (localStorage.getItem(newKey)) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
  }
}

export function clearUserData(userId: string | null | undefined): number {
  const uid = userId || "anon";
  const prefix = PREFIX + ":" + uid + ":";
  let removed = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    for (const k of keys) {
      localStorage.removeItem(k);
      removed++;
    }
  } catch {
  }
  return removed;
}

export function migrateAnonDataToUser(
  userId: string | null | undefined,
): number {
  if (!userId) return 0;
  const anonPrefix = PREFIX + ":anon:";
  const userPrefix = PREFIX + ":" + userId + ":";
  if (anonPrefix === userPrefix) return 0;
  let moved = 0;
  try {
    const bases: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(anonPrefix)) bases.push(k.slice(anonPrefix.length));
    }
    for (const base of bases) {
      const from = anonPrefix + base;
      const to = userPrefix + base;
      const value = localStorage.getItem(from);
      if (value === null) continue;
      if (localStorage.getItem(to) !== null) continue;
      try {
        localStorage.setItem(to, value);
        localStorage.removeItem(from);
        moved++;
      } catch {
        break;
      }
    }
  } catch {
  }
  return moved;
}
