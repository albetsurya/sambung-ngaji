import { useCallback, useEffect, useMemo, useState } from "react";
import timelineEdits from "../data/tilawatiTimelineEdits.json";
import type { QuizQuestion } from "../data/tilawatiQuizTypes";
import { getQuestionAudioUrl } from "../data/tilawatiAudioQuestionMap";
import { getFallbackAudioUrl } from "../utils/audioFallback";
import { visibleSegments, type AudioSegment, type PublishedTimeline } from "../utils/pageTimeline";
import { isNgajiCeriaServerAvailable } from "./ngajiCeriaApi";
import { getPublishedTimeline } from "./tilawatiEditorApi";
import { soundManager } from "./soundManager";

const EDITS = timelineEdits as Record<string, { published?: PublishedTimeline }>;
export interface TilawatiAudioRequest {
  question?: QuizQuestion;
  jilid: number;
  pageNumber: number;
  questionIndex: number;
  audioUrl?: string;
  arabic?: string;
  startAt?: number;
  duration?: number;
  allowPageFallback?: boolean;
}
type AudioCandidate = { url: string; segments?: AudioSegment[] };
export interface TilawatiAudioResolution {
  url: string | null;
  source: "timeline" | "question" | "master" | "coming-soon" | "missing";
  isComingSoon: boolean;
  candidates: AudioCandidate[];
}
export const normalizeArabic = (text: string) => text.normalize("NFKD").replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g, "").replace(/[^\u0621-\u064a]/g, "");

/** Pasangan teks→klip dipakai dahulu; satu sumber dapat dipotong menjadi banyak klip. */
export function resolveTilawatiAudio(request: TilawatiAudioRequest, cloud?: PublishedTimeline | null): TilawatiAudioResolution {
  const { question, jilid, pageNumber, questionIndex } = request;
  const timeline = (cloud ?? (!isNgajiCeriaServerAvailable() ? EDITS[`${jilid}:${pageNumber}`]?.published : null))?.timeline;
  const questionUrl = request.audioUrl || (question ? getQuestionAudioUrl(question, jilid, pageNumber, questionIndex, Boolean(question.isOpening)) : "");
  const arabic = normalizeArabic(request.arabic || question?.arabic || "");
  const text = timeline?.texts.find((item) => question && String(item.id) === String(question.id))
    ?? timeline?.texts.find((item) => (request.arabic || question?.arabic) && item.arabic.normalize("NFC").trim() === (request.arabic || question!.arabic).normalize("NFC").trim())
    ?? timeline?.texts.find((item) => arabic && normalizeArabic(item.arabic) === arabic);
  const clip = timeline?.clips.find((item) => item.id === text?.clipId)
    ?? timeline?.clips.find((item) => item.outputUrl === questionUrl)
    ?? (!question && !request.arabic ? timeline?.clips.find((item) => item.segments.some((segment) => segment.sourceUrl === questionUrl))
      ?? timeline?.clips.find((item) => item.kind === "isi" || item.kind === "baris") : undefined);
  const segments = clip ? visibleSegments(clip) : request.duration && request.duration > 0 ? [{ sourceUrl: questionUrl || `/audio/tilawati/jilid_${jilid}/hal${pageNumber}/hal${pageNumber}_isi_full.ogg`, start: request.startAt ?? 0, end: (request.startAt ?? 0) + request.duration }] : undefined;
  const candidates: AudioCandidate[] = [];
  if (clip?.outputUrl) candidates.push({ url: clip.outputUrl });
  if (questionUrl && !clip) candidates.push({ url: questionUrl, segments: request.duration ? segments : undefined });
  // Untuk timeline yang gagal dimuat, slicing selalu memakai offset sumber, bukan offset klip hasil.
  if (segments?.length) candidates.push({ url: segments[0].sourceUrl, segments });
  if (request.allowPageFallback !== false) {
    const master = `/audio/tilawati/jilid_${jilid}/hal${pageNumber}/hal${pageNumber}_isi_full.ogg`;
    candidates.push({ url: master, segments: request.duration && request.duration > 0 ? [{ sourceUrl: master, start: request.startAt ?? 0, end: (request.startAt ?? 0) + request.duration }] : undefined });
  }
  const fallback = getFallbackAudioUrl(jilid, pageNumber);
  if (fallback && request.allowPageFallback !== false) candidates.push({ url: fallback });
  const unique = candidates.filter((item, index) => candidates.findIndex((other) => other.url === item.url && Boolean(other.segments) === Boolean(item.segments)) === index);
  return { url: unique[0]?.url ?? null, source: clip ? "timeline" : questionUrl ? "question" : fallback ? "master" : "missing", isComingSoon: false, candidates: unique };
}

let activeAudio: HTMLAudioElement | null = null;
let activeSources: AudioBufferSourceNode[] = [];
let cancelPlayback: (() => void) | null = null;
let generation = 0;
let context: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer>>();
export function stopTilawatiAudio() {
  generation++;
  activeAudio?.pause();
  activeAudio = null;
  activeSources.forEach((source) => { try { source.stop(); } catch { /* Already ended. */ } });
  activeSources = [];
  cancelPlayback?.();
  cancelPlayback = null;
  soundManager.duckBgm(false);
}
soundManager.subscribe(() => { if (soundManager.muted) stopTilawatiAudio(); });

/** Pemutar URL umum tetap tersedia untuk audio pembuka dan pemeriksaan manual. */
export function playTilawatiAudio(url: string | null, onEnded?: () => void): HTMLAudioElement | null {
  stopTilawatiAudio();
  if (!url || soundManager.muted) { onEnded?.(); return null; }
  const audio = new Audio(url);
  activeAudio = audio;
  audio.volume = 0.9;
  soundManager.duckBgm(true);
  const finish = () => { if (activeAudio !== audio) return; activeAudio = null; soundManager.duckBgm(false); onEnded?.(); };
  audio.onended = finish;
  audio.onerror = finish;
  void audio.play().catch(finish);
  return audio;
}

async function playCandidate(candidate: AudioCandidate, token: number): Promise<boolean> {
  if (candidate.segments?.length) {
    context ??= new AudioContext();
    const ctx = context;
    await ctx.resume();
    const decoded = await Promise.all(candidate.segments.map((segment) => {
      if (!buffers.has(segment.sourceUrl)) {
        const job = fetch(segment.sourceUrl).then(async (response) => {
          if (!response.ok) throw new Error("Audio sumber tidak tersedia.");
          return ctx.decodeAudioData(await response.arrayBuffer());
        });
        buffers.set(segment.sourceUrl, job);
        void job.catch(() => buffers.delete(segment.sourceUrl));
      }
      return buffers.get(segment.sourceUrl)!;
    }));
    if (token !== generation) return false;
    return new Promise((resolve) => {
      cancelPlayback = () => resolve(false);
      let offset = 0;
      const start = ctx.currentTime + 0.02;
      candidate.segments!.forEach((segment, index) => {
        const buffer = decoded[index];
        const duration = Math.min(segment.end, buffer.duration) - Math.max(0, segment.start);
        if (!(duration > 0)) return;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(start + offset, Math.max(0, segment.start), duration);
        offset += duration;
        activeSources.push(source);
      });
      const last = activeSources[activeSources.length - 1];
      if (!last) { resolve(false); return; }
      last.onended = () => resolve(token === generation);
    });
  }
  return new Promise((resolve, reject) => {
    const audio = new Audio(candidate.url);
    activeAudio = audio;
    audio.volume = 0.9;
    cancelPlayback = () => resolve(false);
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    void audio.play().catch((error: DOMException) => error.name === "NotAllowedError" ? reject(error) : resolve(false));
  });
}

export function usePublishedTilawati(jilid: number, page: number) {
  const [value, setValue] = useState<{ key: string; published: PublishedTimeline | null }>({ key: "", published: null });
  useEffect(() => {
    if (page < 1) return;
    let alive = true;
    const load = () => { void getPublishedTimeline(jilid, page).then((published) => { if (alive) setValue({ key: `${jilid}:${page}`, published }); }).catch(() => { if (alive) setValue({ key: `${jilid}:${page}`, published: null }); }); };
    load();
    window.addEventListener("ngajiceria:timeline-published", load);
    return () => { alive = false; window.removeEventListener("ngajiceria:timeline-published", load); };
  }, [jilid, page]);
  return value.key === `${jilid}:${page}` ? value.published : null;
}

export function useTilawatiAudio(request: TilawatiAudioRequest) {
  const published = usePublishedTilawati(request.jilid, request.pageNumber);
  const resolution = useMemo(() => resolveTilawatiAudio(request, published), [request.question, request.jilid, request.pageNumber, request.questionIndex, request.audioUrl, request.arabic, request.startAt, request.duration, request.allowPageFallback, published]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const stop = useCallback(() => { stopTilawatiAudio(); setIsPlaying(false); }, []);
  const play = useCallback(async () => {
    stopTilawatiAudio();
    if (soundManager.muted) return;
    const token = generation;
    setIsPlaying(true); setError(""); soundManager.duckBgm(true);
    let success = false;
    let blocked = false;
    for (const candidate of resolution.candidates) {
      try { success = await playCandidate(candidate, token); }
      catch (error) { success = false; blocked = error instanceof DOMException && error.name === "NotAllowedError"; }
      if (blocked) break;
      if (success || token !== generation) break;
    }
    if (token === generation) {
      activeAudio = null; activeSources = []; cancelPlayback = null;
      soundManager.duckBgm(false);
      setIsPlaying(false);
      if (!success) setError(blocked ? "Ketuk Baca untuk memutar audio." : "Audio belum tersedia. Coba lagi saat koneksi pulih.");
    }
  }, [resolution]);
  useEffect(() => {
    setIsPlaying(false);
    return () => stopTilawatiAudio();
  }, [resolution]);
  useEffect(() => soundManager.subscribe(() => { if (soundManager.muted) setIsPlaying(false); }), []);
  return { ...resolution, published, isPlaying, error, play, stop };
}
