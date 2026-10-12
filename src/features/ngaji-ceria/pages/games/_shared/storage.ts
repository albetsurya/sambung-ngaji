import { getNgajiCeriaScope } from "../../../hooks/useNgajiCeriaStore";

const KEY = (gameId: string) => `ngajiceria:best:${gameId}`;

function scopedKey(gameId: string): string {
  const scope = getNgajiCeriaScope();
  return scope === "guest"
    ? KEY(gameId)
    : `ngajiceria:best:${encodeURIComponent(scope)}:${gameId}`;
}

export function getBest(gameId: string): number {
  try {
    const value = Number(window.localStorage.getItem(scopedKey(gameId)) ?? 0);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function setBest(gameId: string, score: number): boolean {
  if (!Number.isFinite(score) || score <= getBest(gameId)) return false;
  try {
    window.localStorage.setItem(scopedKey(gameId), String(score));
    return true;
  } catch {
    // Skor sesi tetap ditampilkan jika storage diblokir browser.
    return false;
  }
}

export function clearBest(gameId: string): void {
  try { window.localStorage.removeItem(scopedKey(gameId)); } catch { /* Storage opsional. */ }
}
