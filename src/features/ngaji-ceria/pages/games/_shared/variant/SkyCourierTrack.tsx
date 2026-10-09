import { motion } from "framer-motion";

interface SkyCourierTrackProps {
  playerHp: number;
  lightHp: number;
  lightMax?: number;
  courierName: string;
  index: number;
  total: number;
  status?: string | null;
}

/**
 * Konsep Malaikat Mission: Pos Langit (kurir cahaya, bukan fight).
 * Pemain = kurir amanah mengantar "pesan tugas malaikat" dari bintang ke bintang.
 * Jawaban benar = paket terkirim (cahaya misi penuh), salah = sayap lelah (nyawa kurang).
 */
export function SkyCourierTrack({ playerHp, lightHp, lightMax = 100, courierName, index, total, status }: SkyCourierTrackProps) {
  const light = Math.max(0, Math.min(lightMax, lightHp));
  return <motion.section aria-label="Jalur Pos Langit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden rounded-3xl border border-cyan-300/25 bg-gradient-to-b from-sky-950/80 to-slate-950 p-3">
    <p className="text-center text-[10px] font-black uppercase tracking-widest text-cyan-200">Pos Langit · Paket {Math.min(total, index + 1)}/{total} · {courierName}</p>
    <div className="mt-2 flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => <motion.span key={i} layout transition={{ type: "spring", stiffness: 400, damping: 30 }} className={`h-2 flex-1 rounded-full ${i < index ? "bg-amber-300" : i === index ? "bg-cyan-300 animate-pulse" : "bg-white/15"}`} />)}
    </div>
    <div className="mt-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-white">🪽 Sayap Kurir · Kamu</p>
        <div role="progressbar" aria-label="Stamina sayap" aria-valuemin={0} aria-valuemax={100} aria-valuenow={playerHp} className="mt-1 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-300 transition-[width] duration-500" style={{ width: `${playerHp}%` }} />
        </div>
        <p data-testid="battle-player-hp" className="mt-1 text-[10px] font-bold text-white/70">{playerHp} / 100 Stamina</p>
      </div>
      <span className="pt-4 text-lg" aria-hidden="true">✉️</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-white">⭐ Cahaya Paket</p>
        <div role="progressbar" aria-label="Cahaya paket" aria-valuemin={0} aria-valuemax={lightMax} aria-valuenow={light} className="mt-1 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40">
          <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-200 transition-[width] duration-500" style={{ width: `${light / lightMax * 100}%` }} />
        </div>
        <p data-testid="battle-monster-hp" className="mt-1 text-[10px] font-bold text-white/70">{light} / {lightMax} Cahaya</p>
      </div>
    </div>
    {status && <motion.p key={`${index}:${status}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} role="status" className="mt-2 text-center text-[11px] font-bold text-white/75">{status}</motion.p>}
  </motion.section>;
}
