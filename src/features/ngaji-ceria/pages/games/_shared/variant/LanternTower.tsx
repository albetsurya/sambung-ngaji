import { motion } from "framer-motion";

/**
 * Konsep Nur Battle: Menara Lentera (panjat cahaya 3 lantai, bukan fight).
 * Tiap ronde = satu lantai menara. Jawaban benar menyalakan lentera,
 * jawaban salah memadamkan satu sumbu (nyawa).
 */
export function LanternTower({ round, lives, score }: { round: number; lives: number; score: number }) {
  const floors = [1, 2, 3];
  return <motion.section aria-label="Menara Lentera Nur" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-violet-300/25 bg-gradient-to-b from-indigo-950/80 to-slate-950 p-3 text-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-violet-200">Menara Lentera · Lantai {round}/3 · {score} cahaya</p>
    <div className="mx-auto mt-3 flex max-w-[220px] flex-col-reverse gap-1.5" aria-hidden="true">
      {floors.map((floor) => {
        const lit = floor < round || (floor === round && lives > 0);
        const current = floor === round;
        return <motion.div key={floor} initial={false} animate={lit ? { scale: [1, 1.06, 1], opacity: 1 } : { scale: 1, opacity: 0.6 }} transition={{ duration: 0.35 }} className={`rounded-xl border px-3 py-2 text-xl ${lit ? "border-amber-200/60 bg-amber-400/20 shadow-[0_0_18px_rgba(251,191,36,.35)]" : "border-white/10 bg-white/5"} ${current ? "ring-2 ring-amber-300/60" : ""}`}>
          <motion.span key={lit ? `lit-${floor}-${round}` : `dark-${floor}`} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="inline-block">{lit ? "🏮" : "🌑"}</motion.span>
          <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-white/60">Lantai {floor}{current ? " · kamu di sini" : ""}</span>
        </motion.div>;
      })}
    </div>
    <motion.p key={lives} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-2 text-[11px] font-bold text-white/70">Sumbu tersisa: {"🕯️".repeat(Math.max(0, lives)) || "—"} ({lives} nyawa)</motion.p>
  </motion.section>;
}
