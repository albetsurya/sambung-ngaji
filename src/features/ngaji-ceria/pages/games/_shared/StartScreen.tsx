import { motion } from "framer-motion";
import { Play, Star } from "@/components/ui/FontAwesomeIcons";
import { ACCENTS, type GameAccent } from "./types";
import type { ReactNode } from "react";

export function StartScreen({ title, tagline, description, coverImage, best = 0, onStart, accent = "pink", hideStartButton = false, children }: { title: string; tagline: string; description: string; coverImage?: string; best?: number; onStart: () => void; accent?: GameAccent; hideStartButton?: boolean; children?: ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex flex-col items-center gap-3 py-5 text-center">
    {coverImage && <img src={coverImage} alt="" className="h-24 w-28 object-contain drop-shadow-xl sm:h-32 sm:w-36" />}
    <div><p className={`mb-2 text-[11px] font-black uppercase tracking-wider ${ACCENTS[accent].text}`}>{tagline}</p><h1 className="font-display text-3xl font-black leading-tight text-white">{title}</h1></div>
    <p className="max-w-xs text-sm leading-relaxed text-white/75">{description}</p>
    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-300/25 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300"><Star size={12} />Terbaik: {best}</span>
    {children}
    {!hideStartButton && <button onClick={onStart} className={`game-button mt-2 w-full max-w-xs ${ACCENTS[accent].button}`}><Play size={16} />Mulai</button>}
  </motion.div>;
}
