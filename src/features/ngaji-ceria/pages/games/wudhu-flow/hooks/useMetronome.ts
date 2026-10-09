import { useEffect, useRef, useState } from "react";
import { useGameAudio } from "../../_shared/audio";

type BeatCallback = (beat: number) => void;

function createTick(context: AudioContext, time: number): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.08, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.055);
}

export function useMetronome(active: boolean, bpm: number, onBeat?: BeatCallback) {
  const [beatProgress, setBeatProgress] = useState(0);
  const [beatCount, setBeatCount] = useState(0);
  const callbackRef = useRef(onBeat);
  const bpmRef = useRef(bpm);
  const audioRef = useRef<AudioContext | null>(null);
  callbackRef.current = onBeat;
  bpmRef.current = bpm;

  useEffect(() => {
    if (!active) { setBeatProgress(0); return; }
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    const context = audioRef.current ?? (AudioContextClass ? new AudioContextClass() : null);
    audioRef.current = context;
    void context?.resume();
    let animation = 0;
    let beat = 0;
    let beatStartedAt = context?.currentTime ?? performance.now() / 1000;
    let nextBeatAt = beatStartedAt;
    const frame = () => {
      const now = context?.currentTime ?? performance.now() / 1000;
      const duration = 60 / Math.max(60, bpmRef.current);
      if (now >= nextBeatAt) {
        while (now >= nextBeatAt) {
          if (!useGameAudio.getState().muted && context) createTick(context, nextBeatAt);
          beat++;
          callbackRef.current?.(beat);
          nextBeatAt += duration;
          beatStartedAt = nextBeatAt - duration;
        }
        setBeatCount(beat);
      }
      setBeatProgress(Math.max(0, Math.min(1, (now - beatStartedAt) / duration)));
      animation = requestAnimationFrame(frame);
    };
    animation = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animation);
  }, [active]);

  useEffect(() => () => { void audioRef.current?.close(); audioRef.current = null; }, []);
  return { beatProgress, beatCount };
}
