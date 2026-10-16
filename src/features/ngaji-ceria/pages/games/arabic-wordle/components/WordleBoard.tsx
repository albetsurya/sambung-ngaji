import type { TileStatus } from "../data/word-list";

const colors: Record<TileStatus, string> = { empty: "border-white/20 bg-white/5", correct: "border-emerald-300 bg-emerald-500/70", present: "border-yellow-300 bg-yellow-500/70", absent: "border-slate-500 bg-slate-700" };
export function WordleBoard({ rows }: { rows: { word: string; statuses: TileStatus[] }[] }) {
  return <div className="mx-auto flex max-w-[270px] flex-col gap-1.5" dir="rtl" aria-label="Papan Arabic Wordle">{rows.map((row, rowIndex) => {
    const judged = row.statuses.some((status) => status !== "empty");
    return <div key={rowIndex} className="grid grid-cols-5 gap-1.5">{Array.from({ length: 5 }, (_, index) => <div key={index} style={judged ? { animationDelay: `${index * 70}ms` } : undefined} className={`flex aspect-square items-center justify-center rounded-lg border-2 text-xl font-black text-white ${colors[row.statuses[index] ?? "empty"]} ${judged ? "wordle-judged" : ""}`}>{[...row.word][index] ?? ""}</div>)}</div>;
  })}</div>;
}
