import { ACCENTS, type GameAccent } from "./types";

export function TimerBar({ progress, secondsLeft = 99, accent = "pink" }: { progress: number; secondsLeft?: number; accent?: GameAccent }) {
  return <div role="progressbar" aria-label="Waktu tersisa" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.max(0, Math.min(1, progress)) * 100)} className="h-2 w-full overflow-hidden rounded-full bg-white/10">
    <div className={`h-full transition-[width,background-color] duration-100 ease-linear ${secondsLeft <= 2 ? "bg-red-500" : ACCENTS[accent].button}`} style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
  </div>;
}
