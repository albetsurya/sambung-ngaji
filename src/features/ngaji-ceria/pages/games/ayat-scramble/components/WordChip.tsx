import { useSortable } from "@dnd-kit/sortable";
import type { Word } from "../hooks/useScrambleGame";

export function WordChip({ word, onTap, locked = false, disabled = false }: { word: Word; onTap: () => void; locked?: boolean; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: word.id, disabled: disabled || locked });
  return <button ref={setNodeRef} {...attributes} {...listeners} onClick={onTap} disabled={disabled || locked} aria-label={`${word.text}, ${locked ? "dikunci oleh hint" : "pindahkan kata"}`} className={`game-arabic min-h-12 shrink-0 touch-none rounded-xl border px-3 py-2 text-xl text-white ${locked ? "border-emerald-300 bg-emerald-500/25" : "border-white/25 bg-slate-800"} ${isDragging ? "z-20 opacity-40" : ""}`} style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0) scale(${transform.scaleX},${transform.scaleY})` : undefined, transition }}>{word.text}{locked && <span className="ml-1 text-xs text-emerald-300">✓</span>}</button>;
}
