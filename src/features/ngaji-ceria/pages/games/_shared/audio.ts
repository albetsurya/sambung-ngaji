import { create } from "zustand";
import { soundManager, type SfxName } from "../../../services/soundManager";

function readMuted(): boolean {
  try {
    // Migrasi kunci lama bila ada.
    const legacy = localStorage.getItem("ngajiceria:games:muted");
    if (legacy !== null) return legacy === "true";
  } catch { /* Storage opsional. */ }
  return soundManager.muted;
}

if (typeof window !== "undefined" && readMuted() !== soundManager.muted) {
  soundManager.setMuted(readMuted());
}

export const useGameAudio = create<{ muted: boolean; toggle: () => void }>((set) => ({
  muted: soundManager.muted,
  toggle: () => {
    soundManager.toggleMuted();
    set({ muted: soundManager.muted });
  },
}));

// Keep every in-game toggle synchronized when a Tilawati page or another game
// changes the global setting.
soundManager.subscribe(() => useGameAudio.setState({ muted: soundManager.muted }));

type Sound = "pop" | "correct" | "wrong" | "combo" | "gameover" | "powerup";
const FORWARD: Record<Sound, SfxName> = {
  pop: "pop",
  correct: "correct",
  wrong: "wrong",
  combo: "streak",
  gameover: "gameover",
  powerup: "powerup",
};

/** SFX game — diteruskan ke soundManager terpusat (file Kenney CC0 + fallback sintesis). */
export function playSfx(sound: Sound): void {
  if (typeof window === "undefined") return;
  try {
    soundManager.playSfx(FORWARD[sound]);
  } catch { /* Permainan tetap berjalan jika audio tidak tersedia. */ }
}
