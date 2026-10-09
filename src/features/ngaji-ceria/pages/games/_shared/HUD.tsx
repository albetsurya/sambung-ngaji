import { Heart } from "@/components/ui/FontAwesomeIcons";
import { ACCENTS, type GameAccent } from "./types";

export function HUD({ score, lives, progressLabel, timeLeft, accent = "pink" }: { score: number; lives?: number; progressLabel?: string; timeLeft?: number; accent?: GameAccent }) {
  return <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
    <div><p className="text-[10px] uppercase tracking-wider text-white/60">Skor</p><p data-testid="score" className={`font-display text-xl font-black ${ACCENTS[accent].text}`}>{score}</p></div>
    <div className="text-center text-xs font-bold text-white/75">{progressLabel}{timeLeft !== undefined && <p data-testid="timer" className={timeLeft <= 2 ? "text-red-300" : "text-white"}>{Math.ceil(timeLeft)} detik</p>}</div>
    {lives !== undefined && <div aria-label={`${lives} nyawa tersisa`} className="flex gap-1">{[0, 1, 2].map((i) => <Heart key={i} size={14} className={i < lives ? "text-pink-400" : "text-white/20"} />)}</div>}
  </div>;
}
