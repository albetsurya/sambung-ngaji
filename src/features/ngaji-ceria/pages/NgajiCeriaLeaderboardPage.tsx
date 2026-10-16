import { useEffect, useState } from "react";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { getLeaderboard, LEADERBOARD_GAME_IDS, type LeaderboardEntry } from "./games/_shared/progression";
import { LeaderboardPanel } from "./games/_shared/LeaderboardPanel";
import { getToken } from "../../../services/api";
import { isNgajiCeriaServerAvailable, ngajiCeriaApi } from "../services/ngajiCeriaApi";

const TITLES: Record<string, string> = { "ayat-hunter": "Ayat Hunter", "doa-dungeon": "Doa Dungeon", "nabi-chronicles": "Nabi Chronicles", "malaikat-mission": "Malaikat Mission", "tajwid-tetris": "Tajwid Tetris" };

export default function NgajiCeriaLeaderboardPage() {
  const [version, setVersion] = useState(0);
  const [serverEntries, setServerEntries] = useState<Record<string, LeaderboardEntry[]>>({});
  const [period, setPeriod] = useState<"daily" | "weekly">("weekly");
  useEffect(() => { const refresh = () => setVersion((current) => current + 1); window.addEventListener("ngajiceria:leaderboard-updated", refresh); return () => window.removeEventListener("ngajiceria:leaderboard-updated", refresh); }, []);
  useEffect(() => {
    if (!isNgajiCeriaServerAvailable() || !getToken()) return;
    let cancelled = false;
    Promise.all(LEADERBOARD_GAME_IDS.map(async (gameId) => {
      try {
        const response = await ngajiCeriaApi.getLeaderboard(gameId, period);
        return [gameId, response.entries.map((entry) => ({ ...entry, updatedAt: Date.parse(entry.updatedAt) || 0 }))] as const;
      } catch { return null; }
    })).then((items) => {
      if (cancelled) return;
      setServerEntries(Object.fromEntries(items.filter((item): item is readonly [string, LeaderboardEntry[]] => Boolean(item))));
    });
    return () => { cancelled = true; };
  }, [period, version]);
  void version;
  return <NgajiCeriaLayout title="Papan Skor" showBack><div className="space-y-3 rounded-t-3xl bg-[#FBF8F1] px-4 py-4"><div className="flex gap-2">{(["daily", "weekly"] as const).map((value) => <button key={value} type="button" aria-pressed={period === value} className="min-h-14 flex-1 rounded-2xl border border-[#E2D4C0] bg-white font-bold" onClick={() => setPeriod(value)}>{value === "daily" ? "Harian" : "Mingguan"}</button>)}</div><p className="text-center text-xs text-[#5A3A2A]/70">Skor akun tersimpan di server saat tersedia; perangkat offline memakai papan lokal.</p>{LEADERBOARD_GAME_IDS.map((gameId) => <div key={gameId} className="rounded-3xl bg-[#0F0A1F] p-3"><LeaderboardPanel entries={serverEntries[gameId] ?? getLeaderboard(gameId)} title={TITLES[gameId]} /></div>)}</div></NgajiCeriaLayout>;
}
