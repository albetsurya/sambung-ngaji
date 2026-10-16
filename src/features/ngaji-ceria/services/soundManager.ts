/**
 * Manajer audio terpusat Ngaji Ceria (item roadmap 7–8).
 *
 * - SFX: file Kenney CC0 di public/audio/ngaji-ceria/sfx/*.ogg,
 *   dimainkan instan via Web Audio API (pool buffer di memori).
 *   punch/block disintesis prosedural (tidak ada di pack Kenney).
 * - BGM: loop HTMLAudio per trek (menu/quiz/battle) dengan cross-fade
 *   dan auto-ducking saat audio Tilawati berbunyi. File BGM ditaruh di
 *   public/audio/ngaji-ceria/bgm/{menu,quiz,battle}.ogg — bila belum ada,
 *   pemutaran diam-diam dilewati (tanpa error).
 * - Mute persisten di localStorage, dipakai toggle suara global & in-game.
 */

export type SfxName =
  | "tap" | "pop" | "correct" | "wrong" | "streak"
  | "powerup" | "victory" | "defeat" | "gameover"
  | "punch" | "block";

export type BgmTrack = "menu" | "quiz" | "battle";

const SFX_FILES: Record<SfxName, string | null> = {
  tap: "tap.ogg",
  pop: "pop.ogg",
  correct: "correct.ogg",
  wrong: "wrong.ogg",
  streak: "streak.ogg",
  powerup: "powerup.ogg",
  victory: "victory.ogg",
  defeat: "defeat.ogg",
  gameover: "gameover.ogg",
  // Disintesis prosedural (lihat synthPunch/synthBlock).
  punch: null,
  block: null,
};

const BGM_FILES: Record<BgmTrack, string> = {
  menu: "menu.ogg",
  quiz: "quiz.ogg",
  battle: "battle.ogg",
};

const MUTE_KEY = "ngajiceria:sound:muted";
const BASE = `${import.meta.env.BASE_URL}audio/ngaji-ceria`;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

class SoundManager {
  muted = readMuted();
  private listeners = new Set<() => void>();
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmTrack: BgmTrack | null = null;
  private bgmVolume = 0.25;
  private ducked = false;
  private bgmSynthGain: GainNode | null = null;
  private bgmSynthTimer: number | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", () => this.unlock(), { passive: true });
      window.addEventListener("keydown", () => this.unlock());
    }
  }

  /** Browser mengizinkan autoplay setelah gesture pertama, termasuk sesudah unmute. */
  unlock() {
    if (this.muted) return;
    this.ensureCtx();
    if (this.bgmAudio?.paused) void this.bgmAudio.play().catch(() => {});
    else if (!this.bgmAudio && this.bgmTrack) this.playBgm(this.bgmTrack, this.bgmVolume);
  }

  private get targetBgmVolume() { return this.muted ? 0 : this.bgmVolume * (this.ducked ? 0.1 : 1); }

  get isMuted() { return this.muted; }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch { /* abaikan */ }
    if (this.bgmAudio) this.bgmAudio.muted = muted;
    if (this.bgmSynthGain) this.bgmSynthGain.gain.value = this.targetBgmVolume;
    if (!muted) this.unlock();
    this.emit();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  private ensureCtx(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private loadBuffer(name: SfxName): Promise<AudioBuffer | null> {
    const file = SFX_FILES[name];
    if (!file) return Promise.resolve(null);
    const cached = this.buffers.get(file);
    if (cached) return Promise.resolve(cached);
    const pending = this.loading.get(file);
    if (pending) return pending;
    const job = (async () => {
      try {
        const ctx = this.ensureCtx();
        if (!ctx) return null;
        const response = await fetch(`${BASE}/sfx/${file}`);
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(data);
        this.buffers.set(file, buffer);
        return buffer;
      } catch {
        return null;
      } finally {
        this.loading.delete(file);
      }
    })();
    this.loading.set(file, job);
    return job;
  }

  /** Pemanasan cache agar SFX pertama tanpa jeda (panggil saat layar mulai). */
  preload(names: SfxName[] = ["tap", "pop", "correct", "wrong"]) {
    names.forEach((name) => { void this.loadBuffer(name); });
  }

  /** Mainkan SFX instan; fallback ke sintesis bila file hilang. */
  playSfx(name: SfxName, volume = 1) {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (name === "punch") {
      this.synthPunch(ctx, volume);
      return;
    }
    if (name === "block") {
      this.synthBlock(ctx, volume);
      return;
    }
    void this.loadBuffer(name).then((buffer) => {
      if (this.muted) return;
      if (!buffer) {
        this.synthBlip(ctx, name, volume);
        return;
      }
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain).connect(ctx.destination);
        source.start();
      } catch { /* abaikan */ }
    });
  }

  private synthBlip(ctx: AudioContext, name: SfxName, volume: number) {
    // Nada darurat bila file SFX belum tersedia.
    const freq = name === "wrong" || name === "defeat" || name === "gameover" ? 196 : 660;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch { /* abaikan */ }
  }

  /** Pukulan kartun: whoosh-thud dari noise + sinus rendah. */
  private synthPunch(ctx: AudioContext, volume: number) {
    try {
      const duration = 0.22;
      const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const source = ctx.createBufferSource();
      source.buffer = noise;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start();
    } catch { /* abaikan */ }
  }

  /** Tangkisan: ketukan tumpul pendek. */
  private synthBlock(ctx: AudioContext, volume: number) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.3 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch { /* abaikan */ }
  }

  /** Putar BGM loop dengan cross-fade halus. File hilang -> diam tanpa error. */
  playBgm(track: BgmTrack, volume = 0.25) {
    if (this.muted) {
      this.bgmTrack = track;
      this.bgmVolume = volume;
      return;
    }
    if (this.bgmTrack === track && this.bgmAudio) { this.unlock(); return; }
    if (this.bgmSynthTimer !== null) window.clearInterval(this.bgmSynthTimer);
    this.bgmSynthTimer = null;
    this.bgmSynthGain?.disconnect();
    this.bgmSynthGain = null;
    this.bgmTrack = track;
    this.bgmVolume = volume;
    const previous = this.bgmAudio;
    if (previous) {
      const fade = setInterval(() => {
        previous.volume = Math.max(0, previous.volume - 0.05);
        if (previous.volume <= 0) {
          clearInterval(fade);
          previous.pause();
        }
      }, 60);
    }
    try {
      const audio = new Audio(`${BASE}/bgm/${BGM_FILES[track]}`);
      audio.loop = true;
      audio.muted = this.muted;
      audio.volume = 0;
      audio.play().then(() => {
        const fadeIn = setInterval(() => {
          if (!this.bgmAudio || this.bgmAudio !== audio) {
            clearInterval(fadeIn);
            return;
          }
           const target = this.targetBgmVolume;
          audio.volume = Math.min(target, audio.volume + 0.03);
          if (audio.volume >= target) clearInterval(fadeIn);
        }, 80);
      }).catch((error: DOMException) => {
        // Paket deployment boleh tidak membawa loop BGM; bunyikan pola pendek
        // prosedural yang ringan sebagai fallback agar game tetap terasa hidup.
        if (error.name !== "NotAllowedError" && this.bgmAudio === audio && !this.muted) this.playSynthBgm(track);
      });
      audio.onplay = () => { audio.volume = this.targetBgmVolume; };
      this.bgmAudio = audio;
    } catch { this.playSynthBgm(track); }
  }

  private playSynthBgm(track: BgmTrack) {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    if (this.bgmSynthTimer !== null) window.clearInterval(this.bgmSynthTimer);
    this.bgmSynthGain?.disconnect();
    const gain = ctx.createGain();
    gain.gain.value = this.targetBgmVolume;
    gain.connect(ctx.destination);
    this.bgmSynthGain = gain;
    const patterns: Record<BgmTrack, number[]> = {
      menu: [261.63, 329.63, 392, 329.63],
      quiz: [293.66, 349.23, 440, 349.23],
      battle: [220, 277.18, 329.63, 277.18],
    };
    const notes = patterns[track];
    let index = 0;
    const playNote = () => {
      if (!this.bgmSynthGain || this.muted) return;
      try {
        const oscillator = ctx.createOscillator();
        const noteGain = ctx.createGain();
        oscillator.type = track === "battle" ? "triangle" : "sine";
        oscillator.frequency.value = notes[index++ % notes.length];
        noteGain.gain.setValueAtTime(0.08, ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.34);
        oscillator.connect(noteGain).connect(gain);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.36);
      } catch { /* Web Audio opsional */ }
    };
    playNote();
    this.bgmSynthTimer = window.setInterval(playNote, 420);
  }

  stopBgm() {
    this.bgmTrack = null;
    this.bgmAudio?.pause();
    this.bgmAudio = null;
    if (this.bgmSynthTimer !== null) window.clearInterval(this.bgmSynthTimer);
    this.bgmSynthTimer = null;
    this.bgmSynthGain?.disconnect();
    this.bgmSynthGain = null;
  }

  /** Kecilkan BGM otomatis saat audio qari Tilawati berbunyi. */
  duckBgm(duck: boolean) {
    this.ducked = duck;
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.volume = this.targetBgmVolume;
    }
    if (this.bgmSynthGain) this.bgmSynthGain.gain.value = this.targetBgmVolume;
  }
}

export const soundManager = new SoundManager();
