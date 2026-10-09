import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TOWER_DEFINITIONS } from "./data/towers";
import { useTajwidDefense } from "./hooks/useTajwidDefense";
import { useGameExit } from "../_shared/hooks";

function Game() {
  const game = useTajwidDefense();
  const exit = useGameExit();
  const navigate = useNavigate();
  return <GameShell title="Tajwid Defense" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="emerald">
    {game.phase === "idle" ? <StartScreen title="Tajwid Defense" tagline="Pasang hukum, jaga base" description="Musuh dengan tajwid yang salah berjalan menuju base. Pasang menara hukum bacaan yang tepat untuk mengalahkan sepuluh wave." coverImage={NGAJI_CERIA_ASSETS.harakatRush} best={game.best} onStart={game.start} accent="emerald" /> : <div className="space-y-3"><HUD score={game.score} progressLabel={`Wave ${Math.min(game.wave, 10)}/10`} lives={Math.min(3, Math.ceil(game.hp / 7))} accent="emerald" /><div className="grid grid-cols-5 gap-2">{TOWER_DEFINITIONS.map((tower) => <button type="button" key={tower.id} onClick={() => game.selectTower(tower.id)} className={`rounded-xl border p-2 text-center ${game.selectedTower === tower.id ? "border-emerald-300 bg-emerald-500/25" : "border-white/15 bg-white/5"}`}><span className="game-arabic text-2xl text-emerald-200">{tower.icon}</span><span className="block text-[9px] text-white">{tower.cost}g</span></button>)}</div><div className="grid grid-cols-5 gap-2 rounded-3xl border border-emerald-300/20 bg-slate-950 p-3">{Array.from({ length: 20 }, (_, slot) => { const tower = game.towers.find((item) => item.slot === slot); return <button type="button" key={slot} onClick={() => game.placeTower(slot)} className={`flex aspect-square items-center justify-center rounded-xl border text-xl ${tower ? "border-emerald-300 bg-emerald-500/30" : "border-white/10 bg-white/5 text-white/20"}`}>{tower?.definition.icon ?? "+"}</button>; })}</div><div className="space-y-1">{game.enemies.map((enemy) => <div key={enemy.id} className="flex items-center gap-2 text-xs"><span className="text-red-300">Musuh {enemy.weakness}</span><div className="h-2 flex-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-red-400" style={{ width: `${Math.max(0, enemy.hp)}%` }} /></div></div>)}</div></div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.hp > 0} title={game.hp > 0 ? "Base Selamat!" : "Base Jebol"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="emerald" description={`Bertahan ${Math.min(game.wave, 10)}/10 wave`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function TajwidDefensePage() { return <GameBoundary><Game /></GameBoundary>; }
