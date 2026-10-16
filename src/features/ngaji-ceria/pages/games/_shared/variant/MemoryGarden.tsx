import { motion } from "framer-motion";

/**
 * Konsep Hijaiyah Match Arena: Taman Memori (kebun kartu, bukan arena tempur).
 * Kartu = bunga di petak kebun; pasangan cocok = bunga mekar.
 * Mode battle vs AI = "berkebun bersama" (giliran menyiram), bukan bertarung.
 */
export function MemoryGarden({ playerPairs, aiPairs, turn, mode }: { playerPairs: number; aiPairs: number; turn?: string; mode?: string }) {
  const total = 8;
  const bloomed = playerPairs + aiPairs;
  return <motion.section aria-label="Taman Memori Hijaiyah" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-emerald-300/25 bg-gradient-to-b from-emerald-950/70 to-slate-950 p-3">
    <p className="text-center text-[10px] font-black uppercase tracking-widest text-emerald-200">
      Taman Memori · {bloomed}/{total} bunga mekar{mode === "battle" ? ` · giliran: ${turn === "ai" ? "Tukang Kebun AI" : "Kamu"}` : ""}
    </p>
    <div className="mt-2 grid grid-cols-8 gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => <motion.span key={`${i}:${i < bloomed}`} initial={i < bloomed ? { scale: 0.4 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 17 }} className={`flex h-8 items-center justify-center rounded-lg border text-base ${i < bloomed ? "border-emerald-200/60 bg-emerald-400/25" : "border-white/10 bg-white/5 opacity-60"}`}>{i < playerPairs ? "🌸" : i < bloomed ? "🌼" : "🌱"}</motion.span>)}
    </div>
    <p className="mt-2 text-center text-[11px] font-bold text-white/70">
      {mode === "battle" ? `Bungamu ${playerPairs} — Kebun AI ${aiPairs}` : `${playerPairs}/${total} pasangan ditemukan`}
    </p>
  </motion.section>;
}
