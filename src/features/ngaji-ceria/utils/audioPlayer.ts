  // Audio player helper for Ngaji Ceria games & learning
import { HIJAIYAH_AUDIO_MAP, TILAWATI_AUDIO_MAP } from "@/features/ngaji-ceria/data/tilawatiAudioMap";

let activeAudio: HTMLAudioElement | null = null;

// Play opening basmalah/taawudz
export function playOpeningDua(onEnded?: () => void): void {
  // If there is an opening audio file, play it. Otherwise, use speech synthesis or return.
  const openingAudio = new Audio("/audio/tilawati/taawudz_basmalah.ogg");
  openingAudio.play().then(() => {
    openingAudio.onended = () => {
      if (onEnded) onEnded();
    };
  }).catch(() => {
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
  });
}


/**
 * Play Tilawati recitation audio for a specific Hijaiyah letter
 */
export function playHijaiyahAudio(letterId: string): void {
  try {
    const url = HIJAIYAH_AUDIO_MAP[letterId];
    if (url) {
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = new Audio(url);
      activeAudio.volume = 0.9;
      activeAudio.play().catch((err) => {
        console.warn("Failed to play audio:", err);
        fallbackSpeech(letterId);
      });
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
  try {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    activeAudio = new Audio(url);
    activeAudio.volume = 0.9;
    if (onEnded) {
      activeAudio.onended = onEnded;
      activeAudio.onerror = onEnded;
    }
    activeAudio.play().catch((err) => {
      console.warn("Failed to play audio url:", err);
      if (onEnded) onEnded();
    });
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
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
      }
      activeAudio = new Audio(list[index]);
      activeAudio.volume = 0.9;
      activeAudio.play().catch((err) => {
        console.warn("Failed to play audio chunk:", err);
      });
    }
  } catch (e) {
    console.warn("Audio chunk error:", e);
  }
}

/**
 * Play game SFX (correct pop, wrong buzzer, win chime) using Web Audio API
 */
export function playSoundEffect(type: "pop" | "correct" | "wrong" | "win" | "levelUp"): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "correct") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "win" || type === "levelUp") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn("Sound effect error:", e);
  }
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
