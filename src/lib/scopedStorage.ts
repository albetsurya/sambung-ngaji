/**
 * Storage helper yang di-scope per user_id.
 * Format key: "sng:{userId}:{baseKey}"
 * Fallback ke "sng:anon:{baseKey}" kalau belum login.
 *
 * Benefit:
 * - Multi-user di device yang sama tidak saling lihat data
 * - Login sebagai user lain → data berbeda
 * - Logout → data tetap ada (tinggal login lagi)
 */

const PREFIX = "sng";

export function scopedKey(
  baseKey: string,
  userId: string | null | undefined,
): string {
  const uid = userId || "anon";
  return PREFIX + ":" + uid + ":" + baseKey;
}

/**
 * Migrasi dari key lama (global) ke key baru (scoped).
 * Hanya migrasi kalau:
 * - oldKey ada isinya
 * - newKey belum ada (jangan overwrite)
 *
 * Setelah migrasi, old key dihapus.
 */
export function migrateKey(oldKey: string, newKey: string): void {
  if (oldKey === newKey) return;
  try {
    const old = localStorage.getItem(oldKey);
    if (!old) return;
    if (localStorage.getItem(newKey)) return;
    localStorage.setItem(newKey, old);
    localStorage.removeItem(oldKey);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Hapus semua key yang dimiliki user (kalau mau fitur "reset my data").
 */
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
    // ignore
  }
  return removed;
}
