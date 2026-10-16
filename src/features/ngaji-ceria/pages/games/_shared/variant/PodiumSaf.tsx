import { motion } from "framer-motion";

interface PodiumPlayer { name: string; alive: boolean; score: number }

/**
 * Konsep Quran Quiz Royale: Saf Podium Masjid (eliminasi saf, bukan fight).
 * 8 peserta duduk di saf; yang salah langsung "keluar saf", yang bertahan naik podium.
 * Visual: tangga podium + daftar saf, tanpa karakter tempur/3D.
 */
export function PodiumSaf({ players, round }: { players: PodiumPlayer[]; round: number }) {
  const alive = players.filter((p) => p.alive);
  const podium = [...alive].sort((a, b) => b.score - a.score).slice(0, 3);
  return <motion.section aria-label="Saf Podium Masjid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-3xl border border-pink-300/25 bg-gradient-to-b from-[#2A0E2E] to-slate-950 p-3">
    <p className="text-center text-[10px] font-black uppercase tracking-widest text-pink-200">Saf Masjid · Putaran {round} · {alive.length} peserta tersisa</p>
    {podium.length > 0 && <div className="mt-3 flex items-end justify-center gap-2" aria-label="Podium sementara">
      {podium.map((player, i) => {
        const height = ["h-14", "h-10", "h-8"][i] ?? "h-8";
        const medal = ["🥇", "🥈", "🥉"][i];
        return <motion.div key={player.name} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="flex w-20 flex-col items-center">
          <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="inline-block text-lg" aria-hidden="true">{medal}</motion.span>
          <span className="max-w-full truncate text-[9px] font-black text-white">{player.name}</span>
          <span className="text-[9px] text-pink-200">{player.score}</span>
          <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className={`mt-1 w-full rounded-t-lg border border-white/15 bg-white/10 ${height}`} />
        </motion.div>;
      })}
    </div>}
    <p className="mt-2 text-center text-[10px] text-white/60">Pemain tersisa: {alive.map((p) => p.name).join(", ") || "—"}</p>
  </motion.section>;
}
