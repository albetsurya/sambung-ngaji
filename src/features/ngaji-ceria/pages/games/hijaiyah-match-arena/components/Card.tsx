import { motion } from "framer-motion";
import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";
import type { Card as CardData } from "../data/match-pairs";

export function Card({ card, index, disabled, onFlip }: { card: CardData; index: number; disabled: boolean; onFlip: () => void }) {
  const open = card.isFlipped || card.isMatched;
  return <button onClick={onFlip} disabled={disabled || open} aria-label={open ? `${card.content}${card.isMatched ? ", cocok" : ""}` : `Kartu ${index + 1}, tertutup`} data-card-id={card.id} className="relative min-h-16 w-full rounded-xl active:scale-[0.97]" style={{ perspective: 600, aspectRatio: "1 / 1.15" }}>
    <motion.div animate={{ rotateY: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center rounded-xl border border-violet-300/30 bg-violet-950" style={{ backfaceVisibility: "hidden" }}><img src={NGAJI_CERIA_ASSETS.kartuBelakang} alt="" className="h-full w-full rounded-xl object-cover opacity-80" /></div>
      <div aria-hidden={!open} className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 p-1 ${card.isMatched ? "border-emerald-400 bg-emerald-950 text-emerald-100" : "border-violet-300 bg-violet-100 text-violet-950"} ${card.type === "arabic" ? "game-arabic text-3xl" : "text-[11px] font-black leading-tight"}`} style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>{card.content}</div>
    </motion.div>
  </button>;
}
