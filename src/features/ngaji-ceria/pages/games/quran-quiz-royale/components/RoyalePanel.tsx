import type { RoyalePlayer } from "../hooks/useQuizRoyale";

export function RoyalePanel({ players }: { players: RoyalePlayer[] }) {
  return <div className="rounded-2xl border border-pink-300/20 bg-white/5 p-3"><div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold text-pink-200">Pemain tersisa</span><span className="font-black text-white">{players.filter((player) => player.alive).length}/{players.length}</span></div><div className="grid grid-cols-4 gap-1.5">{players.map((player) => <div key={player.id} className={`rounded-lg px-1 py-1.5 text-center text-[10px] ${player.alive ? "bg-white/10 text-white" : "bg-slate-900/70 text-white/30 line-through"}`} title={`${player.name}: ${player.score}`}><span className="block truncate">{player.name}</span><span className="text-[9px] opacity-70">{player.alive ? `${player.score} pts` : "keluar"}</span></div>)}</div></div>;
}
