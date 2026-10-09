import { AnimatePresence, motion } from "framer-motion";

export function ComboBadge({ combo, multiplier }: { combo: number; multiplier?: number }) {
  return <div className="flex min-h-7 items-center justify-center"><AnimatePresence>{combo >= 2 && <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="rounded-full border border-yellow-300/30 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">Kombo {combo}{multiplier !== undefined && ` · ${multiplier.toFixed(1)}×`}</motion.span>}</AnimatePresence></div>;
}
