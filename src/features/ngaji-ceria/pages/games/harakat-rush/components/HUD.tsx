import { HUD as SharedHUD } from "../../_shared/HUD";
import { HARAKAT_LIST, POWER_UP_LABELS } from "../data/harakat-list";
import type { RushSnapshot } from "../phaser/HarakatRushScene";

export function HUD({ game }: { game: RushSnapshot }) {
  const target = HARAKAT_LIST.find((item) => item.id === game.target)!;
  return <div className="space-y-2">
    <SharedHUD score={game.score} lives={game.lives} progressLabel={`${Math.floor(game.distance)} m`} accent="cyan" />
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-2"><div className="text-xs text-white/80">Tangkap <b className="text-cyan-300">{target.name}</b><p className="text-[10px] text-white/60">Bunyi {target.sound} · {game.speed} px/detik</p></div><span dir="rtl" className="game-arabic text-3xl text-cyan-100">{target.symbol}</span></div>
    {game.activePowerUp !== "none" && <p aria-live="polite" className="text-center text-xs font-bold text-yellow-300">{POWER_UP_LABELS[game.activePowerUp]} aktif{game.activePowerUp === "shield" ? " · tahan satu hit" : ` · ${Math.ceil(game.powerUpTimeLeft)} detik`}</p>}
  </div>;
}
