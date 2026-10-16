import { motion, useReducedMotion } from "framer-motion";
import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";
import type { Grid, MergeGhost, Tile } from "../hooks/useHijaiyah2048";
import { HIJAIYAH_LIST } from "../../../../data/hijaiyah";

const tileColors = ["bg-sky-950", "bg-cyan-900", "bg-teal-800", "bg-emerald-700", "bg-lime-700", "bg-yellow-600", "bg-orange-600", "bg-pink-600"];
function label(tile: Tile | null): string | null { return !tile ? null : HIJAIYAH_LIST[tile.level]?.arabic ?? null; }
function face(level: number) {
  const text = HIJAIYAH_LIST[level]?.arabic;
  return text ?? null;
}

function TileFace({ tile, merged, spawned }: { tile: Tile; merged: boolean; spawned: boolean }) {
  const text = face(tile.level);
  return <motion.div
    initial={merged || spawned ? { scale: 0.4, opacity: 0.6 } : false}
    animate={merged ? { scale: [0.4, 1.28, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
    transition={merged ? { duration: 0.3, delay: 0.1, ease: "easeOut" } : { type: "spring", stiffness: 500, damping: 24 }}
    className={`flex h-full w-full items-center justify-center rounded-2xl border text-3xl font-black text-white ${merged ? "border-amber-200/70 shadow-[0_0_18px_rgba(251,191,36,.55)]" : "border-white/10"} ${tileColors[Math.min(tile.level, tileColors.length - 1)]}`}
    dir="rtl"
  >
    {text ?? <img src={NGAJI_CERIA_ASSETS.bintang} alt="Level max" draggable={false} className="h-8 w-8 object-contain" />}
  </motion.div>;
}

export function TileBoard({ grid, moveId, mergedIds = [], spawnedId = null, ghosts = [] }: { grid: Grid; moveId: number; mergedIds?: string[]; spawnedId?: string | null; ghosts?: MergeGhost[] }) {
  const reduceMotion = useReducedMotion();
  const tiles: { tile: Tile; row: number; col: number }[] = [];
  grid.forEach((row, rowIndex) => row.forEach((tile, colIndex) => { if (tile) tiles.push({ tile, row: rowIndex, col: colIndex }); }));
  const slide = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 550, damping: 42, mass: 0.9 };
  return <div className="relative aspect-square w-full rounded-3xl border border-cyan-300/20 bg-slate-950/60 p-2" aria-label="Papan Hijaiyah 2048" role="application">
    <div className="absolute inset-2 grid grid-cols-4 gap-2" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, index) => <div key={index} className="rounded-2xl bg-white/5" />)}
    </div>
    <div className="absolute inset-2" aria-hidden="false">
      {ghosts.map((ghost) => <motion.div
        key={`${moveId}:${ghost.id}`}
        className="pointer-events-none absolute z-0 p-1"
        style={{ width: "25%", height: "25%" }}
        initial={{ left: `${ghost.fromCol * 25}%`, top: `${ghost.fromRow * 25}%`, opacity: 1, scale: 1 }}
        animate={{ left: `${ghost.toCol * 25}%`, top: `${ghost.toRow * 25}%`, opacity: 0, scale: 0.85 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: "easeIn" }}
      >
        <div className={`flex h-full w-full items-center justify-center rounded-2xl border border-white/10 text-3xl font-black text-white ${tileColors[Math.min(ghost.level, tileColors.length - 1)]}`} dir="rtl">
          {label({ id: ghost.id, level: ghost.level }) ?? <img src={NGAJI_CERIA_ASSETS.bintang} alt="" aria-hidden="true" draggable={false} className="h-8 w-8 object-contain" />}
        </div>
      </motion.div>)}
      {tiles.map(({ tile, row, col }) => <motion.div
        key={tile.id}
        className="absolute z-10 p-1"
        style={{ width: "25%", height: "25%" }}
        initial={false}
        animate={{ left: `${col * 25}%`, top: `${row * 25}%` }}
        transition={slide}
      >
        <TileFace tile={tile} merged={mergedIds.includes(tile.id)} spawned={spawnedId === tile.id} />
      </motion.div>)}
    </div>
  </div>;
}
