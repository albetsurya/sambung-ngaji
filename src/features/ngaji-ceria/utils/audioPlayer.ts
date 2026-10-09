  // Audio player helper for Ngaji Ceria games & learning
import { HIJAIYAH_AUDIO_MAP, TILAWATI_AUDIO_MAP } from "@/features/ngaji-ceria/data/tilawatiAudioMap";
import { playTilawatiAudio, stopTilawatiAudio } from "../services/tilawatiAudio";
import { soundManager } from "../services/soundManager";

let activeAudio: HTMLAudioElement | null = null;

export function stopAllAudio(): void {
  try {
    stopTilawatiAudio();
    activeAudio = null;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn("stopAllAudio error:", e);
  }
}

// Play opening basmalah/taawudz
export function playOpeningDua(onEnded?: () => void): void {
  const audio = playTilawatiAudio("/audio/tilawati/taawudz_basmalah_v2.ogg", onEnded);
  if (!audio) {
    // If not found, speak it via speech synthesis
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance("A'udzubillahi minasy syaithanir rajim. Bismillahirrahmanirrahim");
      utter.lang = "ar-SA";
      utter.rate = 0.9;
      utter.onend = () => {
        if (onEnded) onEnded();
      };
      utter.onerror = () => {
        if (onEnded) onEnded();
      };
      window.speechSynthesis.speak(utter);
    } else {
      if (onEnded) onEnded();
    }
  }
}


/**
 * Play Tilawati recitation audio for a specific Hijaiyah letter
 */
export function playHijaiyahAudio(letterId: string): void {
  try {
    const url = HIJAIYAH_AUDIO_MAP[letterId];
    if (url) {
      activeAudio = playTilawatiAudio(url, undefined);
      if (activeAudio) {
        activeAudio.play().catch(() => {
          fallbackSpeech(letterId);
        });
      }
      return;
    }
  } catch (e) {
    console.warn("Audio play error:", e);
  }
  fallbackSpeech(letterId);
}

/**
 * Play generic chunk audio from a specific jilid
 */
export function playAudioUrl(url: string, onEnded?: () => void): HTMLAudioElement | null {
  if (!url) {
    onEnded?.();
    return null;
  }
  try {
    activeAudio = playTilawatiAudio(url, onEnded);
    return activeAudio;
  } catch (e) {
    console.warn("Audio url error:", e);
    if (onEnded) onEnded();
    return null;
  }
}

export function playJilidChunkAudio(jilid: string, index: number): void {
  try {
    const list = TILAWATI_AUDIO_MAP[jilid];
    if (list && list[index]) {
      activeAudio = playTilawatiAudio(list[index]);
    }
  } catch (e) {
    console.warn("Audio chunk error:", e);
  }
}

/**
 * Play game SFX (correct pop, wrong buzzer, win chime) using Web Audio API
 */
export function playSoundEffect(type: "pop" | "correct" | "wrong" | "win" | "levelUp"): void {
  soundManager.playSfx(type === "pop" ? "pop" : type === "correct" ? "correct" : type === "wrong" ? "wrong" : "victory");
}

/**
 * Fallback to speech synthesis if audio file not loaded
 */
function fallbackSpeech(text: string): void {
  if (!("speechSynthesis" in window)) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ar-SA";
    utter.rate = 0.85;
    window.speechSynthesis.speak(utter);
  } catch {
    // silent fallback
  }
}
