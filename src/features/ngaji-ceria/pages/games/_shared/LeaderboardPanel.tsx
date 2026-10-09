import type { LeaderboardEntry } from "./progression";

export function LeaderboardPanel({ entries, title = "Papan Skor Lokal" }: { entries: LeaderboardEntry[]; title?: string }) {
  return <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-3 text-left"><p className="text-xs font-black uppercase tracking-widest text-amber-200">{title}</p><ol className="mt-2 space-y-1.5">{entries.slice(0, 5).map((entry, index) => <li key={entry.id} className={`flex items-center justify-between rounded-xl px-2 py-1.5 text-xs ${entry.name === "Kamu" ? "bg-amber-300/15 text-amber-100" : "text-white/75"}`}><span><b className="mr-2 text-amber-300">#{index + 1}</b>{entry.name}</span><b>{entry.score}</b></li>)}</ol><p className="mt-2 text-[10px] text-white/50">Dapat tersambung ke leaderboard server saat backend multiplayer tersedia.</p></div>;
}
