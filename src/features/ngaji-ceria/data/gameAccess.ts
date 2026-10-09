/**
 * Akses Ngaji Ceria berbasis peran (kebijakan baru).
 *
 * - Tamu / publik (tanpa login): Jilid 1–2, serta game Hijaiyah Pop,
 *   hub Ritme Ngaji, hub Quiz Ngaji, dan Arabic Wordle.
 * - Member (sudah login, peran apa pun): seluruh Jilid 1–5 dan seluruh game.
 * - Super Admin: semua terbuka (termasuk konten pratinjau).
 * - Jilid 6 selalu "Segera Hadir" (lencana, bukan konten).
 */

/** Alias route -> id kanonis (beberapa route lama menunjuk game yang sama). */
const GAME_ALIASES: Record<string, string> = {
  "hijaiyah-burst": "hijaiyah-pop",
  "hijaiyah-match": "hijaiyah-match-arena",
  "verse-quest": "juz-amma-speedrun",
  "word-builder": "ayat-scramble",
};

export function canonicalGameId(routeId: string): string {
  return GAME_ALIASES[routeId] ?? routeId;
}

export type AccessTier = "guest" | "member" | "superadmin";

export function tierForRole(role: string | undefined | null): AccessTier {
  if (role === "SUPER_ADMIN") return "superadmin";
  if (role) return "member";
  return "guest";
}

/** Id game/hub yang terbuka untuk tamu (selain itu perlu login). */
export const GUEST_OPEN_GAME_IDS: ReadonlySet<string> = new Set([
  "ritme-ngaji", "harakat-rush", "makhraj-master", "hijaiyah-beats",
  "quiz-ngaji", "juz-amma-speedrun", "quran-quiz-royale", "nur-battle",
  "hijaiyah-pop",
  // Hub Puzzle Huruf terbuka sebagai rumah Arabic Wordle;
  // 3 mode lain di dalamnya tetap terkunci untuk tamu (per-mode).
  "puzzle-huruf", "arabic-wordle",
]);

/** Daftar hub yang terbuka untuk tamu (cangkang hub, isi mengikuti per-mode). */
export const OPEN_HUB_IDS: ReadonlySet<string> = new Set([
  "ritme-ngaji", "quiz-ngaji", "puzzle-huruf",
]);

export function isGameOpenForGuest(routeId: string): boolean {
  return GUEST_OPEN_GAME_IDS.has(canonicalGameId(routeId));
}

/** Kompat: nama lama — kini berarti "terbuka untuk tamu". */
export const OPEN_GAME_IDS: ReadonlySet<string> = GUEST_OPEN_GAME_IDS;
export function isGameOpenForMember(routeId: string): boolean {
  return isGameOpenForGuest(routeId);
}

export function isGameOpen(routeId: string, tier: AccessTier): boolean {
  if (tier !== "guest") return true;
  return isGameOpenForGuest(routeId);
}

/** Jilid maksimum berdasarkan tier (Jilid 6 selalu segera-hadir). */
export function maxJilidForTier(tier: AccessTier): number {
  if (tier === "guest") return 2;
  return 5;
}

export function isComingSoonJilid(jilidId: number): boolean {
  return jilidId >= 6;
}

/** "jilid-3" -> 3 (0 bila tak dikenali). */
export function parseJilidNumber(jilidId: string): number {
  const match = /(\d+)\s*$/.exec(jilidId);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export function isJilidOpen(jilidId: number, tier: AccessTier): boolean {
  if (isComingSoonJilid(jilidId)) return false;
  return jilidId <= maxJilidForTier(tier);
}
