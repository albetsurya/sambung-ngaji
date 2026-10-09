import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { HUD } from "../_shared/HUD";
import { GameOverModal } from "../_shared/GameOverModal";
import { soundManager } from "../../../services/soundManager";
import { useSantriIdle } from "./hooks/useSantriIdle";
import { SANTRI_BUILDINGS, formatIdleNumber } from "./data/buildings";
import { BuildingCard } from "./components/BuildingCard";
import { OfflineModal } from "./components/OfflineModal";
import { CampusMap } from "./components/CampusMap";
import { useState } from "react";

function Game() {
  const game = useSantriIdle();
  const navigate = useNavigate();
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const exit = () => navigate("/member/ngaji-ceria/games");
  return <GameShell title="Santri Idle" phase={ended ? "gameover" : paused ? "paused" : "playing"} onPause={() => setPaused(true)} onResume={() => setPaused(false)} accent="pink">
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-pink-300/20 bg-gradient-to-br from-pink-950/70 to-amber-950/60 p-4"><img src={NGAJI_CERIA_ASSETS.quranQuizRoyale} alt="" className="h-16 w-16 object-contain" /><div><p className="text-[10px] uppercase tracking-wider text-pink-200/70">Kas pesantren</p><p className="font-display text-3xl font-black text-white">{formatIdleNumber(game.coins)}</p><p className="text-xs text-pink-200">+{formatIdleNumber(game.rate)} santri/detik</p></div></div>
      <HUD score={Math.floor(game.coins)} progressLabel="Bangun pesantren" accent="pink" />
      <CampusMap buildings={SANTRI_BUILDINGS.map((building) => ({ definition: building, owned: game.owned[building.id] ?? 0 }))} activityIndex={game.activityIndex} />
       <div className="grid gap-2">{SANTRI_BUILDINGS.map((building) => <BuildingCard key={building.id} building={building} owned={game.owned[building.id] ?? 0} cost={game.costs[building.id]} canBuy={game.coins >= game.costs[building.id] && !paused && !ended} onBuy={() => { if (game.buy(building.id)) { soundManager.playSfx("correct"); setSessionScore((score) => score + 100); } }} />)}</div>
       <button type="button" disabled={sessionScore === 0} onClick={() => setEnded(true)} className="game-button w-full bg-pink-600">Selesai Sesi</button>
      <button type="button" onClick={() => { if (window.confirm("Reset semua kemajuan pesantren?")) game.reset(); }} className="w-full py-2 text-xs font-bold text-white/45">Reset kemajuan</button>
    </div>
    <GameOverModal visible={ended} score={sessionScore} best={sessionScore} isNewRecord={false} victory={sessionScore > 0} title="Pesantren Bertumbuh" onRetry={() => { setEnded(false); setSessionScore(0); }} onExit={exit} />
    <OfflineModal gain={game.offlineGain} onClose={game.dismissOffline} />
  </GameShell>;
}
export default function SantriIdlePage() { return <GameBoundary><Game /></GameBoundary>; }
