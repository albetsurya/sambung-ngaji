import { scopedKey } from "./scopedStorage";

/* -------------------------------------------------------------------------- */
/*                              Constants                                     */
/* -------------------------------------------------------------------------- */

const APP_NAME = "sambung-ngaji";
const BACKUP_VERSION = 1;
const MAX_IMPORT_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Whitelist pattern backup.
 * `exact` → match key tepat.
 * `prefix` → match key yang diawali prefix (untuk key per-hari).
 */
const BACKUP_PATTERNS: { type: "exact" | "prefix"; value: string; label: string }[] = [
  { type: "exact", value: "tahfidz-v1", label: "Hafalan Tahfidz" },
  { type: "exact", value: "sholat-journal-v1", label: "Jurnal Sholat" },
  { type: "exact", value: "quran-bookmarks", label: "Bookmark Ayat" },
  { type: "exact", value: "quran-last-read", label: "Terakhir Baca Quran" },
  { type: "exact", value: "mushaf-last-page", label: "Halaman Mushaf" },
  { type: "exact", value: "doa-favorites", label: "Doa Favorit" },
  { type: "prefix", value: "doa-read-", label: "Progress Doa" },
  { type: "prefix", value: "dzikir-counts-", label: "Dzikir Counter" },
];

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

export interface BackupPayload {
  app: typeof APP_NAME;
  version: number;
  exported_at: string;
  user_id: string;
  username: string;
  /** Map: baseKey (tanpa prefix sng:{userId}:) → value (string JSON) */
  keys: Record<string, string>;
}

export interface BackupStats {
  keyCount: number;
  sizeBytes: number;
  sizeFormatted: string;
}

export interface ImportPreview {
  file: BackupPayload;
  keyCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  exportedAt: string;
  originalUserId: string;
  originalUsername: string;
}

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

function matchesPattern(baseKey: string): boolean {
  return BACKUP_PATTERNS.some((p) =>
    p.type === "exact" ? baseKey === p.value : baseKey.startsWith(p.value),
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/* -------------------------------------------------------------------------- */
/*                              Collect                                       */
/* -------------------------------------------------------------------------- */

export function collectBackup(
  userId: string,
  username: string,
): { payload: BackupPayload; stats: BackupStats } {
  const prefix = scopedKey("", userId); // "sng:{userId}:"
  const keys: Record<string, string> = {};
  let sizeBytes = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (!fullKey || !fullKey.startsWith(prefix)) continue;

      const baseKey = fullKey.slice(prefix.length);
      if (!matchesPattern(baseKey)) continue;

      const value = localStorage.getItem(fullKey);
      if (value === null) continue;

      keys[baseKey] = value;
      sizeBytes += fullKey.length + value.length;
    }
  } catch {
    // ignore quota
  }

  const payload: BackupPayload = {
    app: APP_NAME,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    user_id: userId,
    username,
    keys,
  };

  const keyCount = Object.keys(keys).length;

  return {
    payload,
    stats: { keyCount, sizeBytes, sizeFormatted: formatSize(sizeBytes) },
  };
}

/* -------------------------------------------------------------------------- */
/*                              Download                                      */
/* -------------------------------------------------------------------------- */

export function downloadBackup(
  payload: BackupPayload,
  username: string,
): void {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const date = new Date().toISOString().slice(0, 10);
  const safeUsername = username.replace(/[^a-z0-9_-]/gi, "_");
  const filename = "backup-sambung-ngaji-" + safeUsername + "-" + date + ".json";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* -------------------------------------------------------------------------- */
/*                              Parse + Validate                              */
/* -------------------------------------------------------------------------- */

export function parseBackupFile(
  text: string,
  currentUserId: string,
): ImportPreview {
  if (text.length > MAX_IMPORT_SIZE) {
    throw new Error("File terlalu besar (maksimal 5 MB)");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("File bukan JSON valid");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Format file tidak dikenali");
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.app !== APP_NAME) {
    throw new Error("File ini bukan backup Sambung Ngaji");
  }

  if (obj.version !== BACKUP_VERSION) {
    throw new Error(
      "Versi backup tidak kompatibel (file: " +
        String(obj.version) +
        ", aplikasi: " +
        BACKUP_VERSION +
        ")",
    );
  }

  if (!obj.keys || typeof obj.keys !== "object" || Array.isArray(obj.keys)) {
    throw new Error("Struktur backup tidak valid");
  }

  const keys = obj.keys as Record<string, unknown>;
  const validKeys: Record<string, string> = {};
  let sizeBytes = 0;

  for (const [baseKey, value] of Object.entries(keys)) {
    if (typeof value !== "string") continue;
    if (!matchesPattern(baseKey)) continue;
    validKeys[baseKey] = value;
    sizeBytes += baseKey.length + value.length;
  }

  if (Object.keys(validKeys).length === 0) {
    throw new Error("Backup tidak berisi data yang bisa direstore");
  }

  const originalUserId =
    typeof obj.user_id === "string" ? obj.user_id : "";
  const originalUsername =
    typeof obj.username === "string" ? obj.username : "(tidak diketahui)";

  // Tolak jika backup milik user lain
  if (originalUserId && originalUserId !== currentUserId) {
    throw new Error(
      "Backup ini milik @" +
        originalUsername +
        ", sedangkan Anda login sebagai akun berbeda. Gunakan file backup milik Anda sendiri.",
    );
  }

  const payload: BackupPayload = {
    app: APP_NAME,
    version: BACKUP_VERSION,
    exported_at:
      typeof obj.exported_at === "string" ? obj.exported_at : "",
    user_id: originalUserId,
    username: originalUsername,
    keys: validKeys,
  };

  return {
    file: payload,
    keyCount: Object.keys(validKeys).length,
    sizeBytes,
    sizeFormatted: formatSize(sizeBytes),
    exportedAt: payload.exported_at,
    originalUserId,
    originalUsername,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Restore                                       */
/* -------------------------------------------------------------------------- */

export interface RestoreResult {
  restored: number;
  skipped: number;
}

export function restoreBackup(
  payload: BackupPayload,
  currentUserId: string,
): RestoreResult {
  const prefix = scopedKey("", currentUserId);
  let restored = 0;
  let skipped = 0;

  for (const [baseKey, value] of Object.entries(payload.keys)) {
    if (!matchesPattern(baseKey)) {
      skipped++;
      continue;
    }
    try {
      localStorage.setItem(prefix + baseKey, value);
      restored++;
    } catch {
      skipped++;
    }
  }

  return { restored, skipped };
}
