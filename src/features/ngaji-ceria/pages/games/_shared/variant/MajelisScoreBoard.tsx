import { motion } from "framer-motion";

interface MajelisScoreBoardProps {
  playerHp: number;
  rivalHp: number;
  rivalMaxHp: number;
  rivalName: string;
  roundLabel: string;
  status?: string | null;
}

/**
 * Konsep Tajwid Arena: Meja Majelis Ilmu (bukan fight).
 * Santri vs Dewan Ustadz — adu ketepatan hukum bacaan di meja musyawarah.
 * HP = "Fokus Santri" dan "Skor Majelis" (progress diskusi), tanpa monster/serangan.
 */
export function MajelisScoreBoard({ playerHp, rivalHp, rivalMaxHp, rivalName, roundLabel, status }: MajelisScoreBoardProps) {
  const rival = Math.max(0, Math.min(rivalMaxHp, rivalHp));
  return <motion.section aria-label="Meja Majelis Tajwid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-3xl border border-violet-300/25 bg-gradient-to-b from-violet-950/80 to-slate-950 p-3">
    <p className="text-center text-[10px] font-black uppercase tracking-widest text-violet-200">Majelis Ilmu · {roundLabel}</p>
    <div className="mt-2 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-white">📖 Santri · Kamu</p>
        <div role="progressbar" aria-label="Fokus santri" aria-valuemin={0} aria-valuemax={100} aria-valuenow={playerHp} className="mt-1 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-300 transition-[width] duration-500" style={{ width: `${playerHp}%` }} />
        </div>
        <p data-testid="battle-player-hp" className="mt-1 text-[10px] font-bold text-white/70">{playerHp} / 100 Fokus</p>
      </div>
      <span className="pt-4 text-xs font-black italic text-violet-200">◆</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-white">🕌 {rivalName}</p>
        <div role="progressbar" aria-label="Skor majelis" aria-valuemin={0} aria-valuemax={rivalMaxHp} aria-valuenow={rival} className="mt-1 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40">
          <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-300 transition-[width] duration-500" style={{ width: `${rival / rivalMaxHp * 100}%` }} />
        </div>
        <p data-testid="battle-monster-hp" className="mt-1 text-[10px] font-bold text-white/70">{rival} / {rivalMaxHp} Bahan</p>
      </div>
    </div>
    <motion.p key={status ?? roundLabel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} role="status" className="mt-2 text-center text-[11px] font-bold text-white/75">
      {status ?? "Jawab soal tajwid untuk mengisi kartu, lalu mainkan kartumu di meja."}
    </motion.p>
  </motion.section>;
}
