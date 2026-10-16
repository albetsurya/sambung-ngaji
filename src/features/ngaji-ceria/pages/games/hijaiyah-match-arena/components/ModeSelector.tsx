import type { Difficulty } from "../hooks/useAIOpponent";

export function ModeSelector({ mode, difficulty, onMode, onDifficulty }: { mode: "solo" | "battle"; difficulty: Difficulty; onMode: (mode: "solo" | "battle") => void; onDifficulty: (difficulty: Difficulty) => void }) {
  return <div className="w-full max-w-xs space-y-3">
    <div className="flex gap-2">{(["solo", "battle"] as const).map((value) => <button key={value} aria-pressed={mode === value} onClick={() => onMode(value)} className={`game-button flex-1 border ${mode === value ? "border-violet-300 bg-violet-500/30" : "border-white/20"}`}>{value === "solo" ? "Solo" : "Lawan AI"}</button>)}</div>
    {mode === "battle" && <div><p className="mb-2 text-xs text-white/75">Ingatan AI</p><div className="flex gap-2">{(["easy", "normal", "hard"] as const).map((value, index) => <button key={value} aria-pressed={difficulty === value} onClick={() => onDifficulty(value)} className={`min-h-11 flex-1 rounded-xl border px-2 text-xs font-bold ${difficulty === value ? "border-violet-300 bg-violet-500/30" : "border-white/20"}`}>{["Santai", "Normal", "Tantang"][index]}</button>)}</div><p className="mt-2 text-[11px] text-white/60">AI mengingat {difficulty === "easy" ? 1 : difficulty === "normal" ? 3 : 5} kartu terakhir yang dibuka.</p></div>}
  </div>;
}
