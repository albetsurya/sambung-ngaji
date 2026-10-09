import { useDroppable } from "@dnd-kit/core";
import { WordChip } from "./WordChip";
import type { Word } from "../hooks/useScrambleGame";

export function AnswerSlot({ index, word, locked, disabled, onTap }: { index: number; word: Word | null; locked: boolean; disabled: boolean; onTap: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${index}`, disabled: disabled || locked });
  return <div ref={setNodeRef} className={`flex min-h-16 min-w-14 shrink-0 flex-col items-center gap-1 rounded-xl p-1 ${isOver ? "bg-emerald-500/25" : "bg-white/5"}`}><span className="text-[10px] text-white/50">{index + 1}</span>{word ? <WordChip word={word} locked={locked} disabled={disabled} onTap={onTap} /> : <span className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-dashed border-white/30 text-white/30">…</span>}</div>;
}
