import React, { useEffect, useRef, useState } from "react";
import type { TimelineAudioClip } from "../../utils/pageTimeline";
import { visibleSegments } from "../../utils/pageTimeline";

const PEAK_BUCKETS = 120;

/** Cache buffer per URL agar tiap file audio hanya di-fetch + decode sekali. */
const bufferCache = new Map<string, Promise<AudioBuffer | null>>();
let sharedCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new AudioContext();
  return sharedCtx;
}

function getAudioBuffer(sourceUrl: string): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(sourceUrl);
  if (cached) return cached;
  const promise = fetch(sourceUrl)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.arrayBuffer();
      // decodeAudioData butuh copy karena buffer bisa di-detach.
      return getContext().decodeAudioData(raw.slice(0));
    })
    .catch(() => null);
  bufferCache.set(sourceUrl, promise);
  // Kalau gagal, izinkan coba lagi di lain waktu.
  promise.then((buf) => {
    if (!buf) bufferCache.delete(sourceUrl);
  });
  return promise;
}

function peaksOfSlice(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
  buckets: number,
): Float32Array {
  const out = new Float32Array(Math.max(1, buckets));
  const duration = buffer.duration;
  if (duration <= 0 || endSec <= startSec) return out;
  const clampedStart = Math.max(0, Math.min(duration, startSec));
  const clampedEnd = Math.max(0, Math.min(duration, endSec));
  if (clampedEnd <= clampedStart) return out;

  const channel = buffer.getChannelData(0);
  const totalSamples = channel.length;
  const startIdx = Math.floor((clampedStart / duration) * totalSamples);
  const endIdx = Math.min(totalSamples, Math.ceil((clampedEnd / duration) * totalSamples));
  const span = Math.max(1, endIdx - startIdx);
  for (let b = 0; b < out.length; b++) {
    const from = startIdx + Math.floor((b / out.length) * span);
    const to = Math.max(from + 1, startIdx + Math.floor(((b + 1) / out.length) * span));
    let peak = 0;
    // Sampling tiap N sample agar cepat untuk file panjang.
    const step = Math.max(1, Math.floor((to - from) / 32));
    for (let i = from; i < to; i += step) {
      const v = Math.abs(channel[i]);
      if (v > peak) peak = v;
    }
    out[b] = peak;
  }
  // Normalisasi per klip agar grafik selalu terlihat jelas.
  let max = 0;
  for (let b = 0; b < out.length; b++) if (out[b] > max) max = out[b];
  if (max > 0.01) {
    for (let b = 0; b < out.length; b++) out[b] = Math.min(1, out[b] / max);
  }
  return out;
}

interface Props {
  clip: TimelineAudioClip;
  /** Warna batang waveform. */
  color?: string;
}

/**
 * Grafik audio (waveform) di dalam klip timeline.
 * Dihitung client-side via Web Audio API, jadi bekerja untuk
 * editor lokal maupun cloud tanpa perubahan backend.
 */
export const ClipWaveform: React.FC<Props> = ({ clip, color = "rgba(255,255,255,0.75)" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);
  const segmentsKey = JSON.stringify(visibleSegments(clip));

  useEffect(() => {
    let cancelled = false;
    setPeaks(null);
    const segments = visibleSegments(clip);
    if (!segments.length) return;
    // Bagi bucket proporsional ke durasi tiap segmen lalu gabung.
    const totalDur = segments.reduce((sum, s) => sum + (s.end - s.start), 0);
    if (totalDur <= 0) return;

    Promise.all(segments.map((s) => getAudioBuffer(s.sourceUrl))).then((buffers) => {
      if (cancelled) return;
      const merged = new Float32Array(PEAK_BUCKETS);
      let offset = 0;
      segments.forEach((segment, index) => {
        const buffer = buffers[index];
        const share = (segment.end - segment.start) / totalDur;
        const count = index === segments.length - 1 ? PEAK_BUCKETS - offset : Math.max(1, Math.round(share * PEAK_BUCKETS));
        if (!buffer) return;
        const slice = peaksOfSlice(buffer, segment.start, segment.end, count);
        merged.set(slice.subarray(0, Math.min(count, PEAK_BUCKETS - offset)), offset);
        offset += count;
      });
      setPeaks(merged);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = PEAK_BUCKETS;
    const h = 40;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    const barW = Math.max(1, w / peaks.length - 0.5);
    peaks.forEach((peak, i) => {
      const barH = Math.max(2, peak * (h - 6));
      const x = i * (w / peaks.length);
      const y = (h - barH) / 2;
      // Bar dengan sudut sedikit membulat (fallback ke fillRect).
      if (typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 1);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barW, barH);
      }
    });
  }, [peaks, color]);

  if (!peaks) return <div className="te-wave te-wave-loading" aria-hidden="true" />;
  return <canvas ref={canvasRef} className="te-wave" aria-hidden="true" style={{ width: "100%", height: 40 }} />;
};
