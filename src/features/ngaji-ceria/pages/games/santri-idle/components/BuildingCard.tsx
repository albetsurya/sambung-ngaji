import type { BuildingDefinition } from "../data/buildings";
import { formatIdleNumber } from "../data/buildings";

export function BuildingCard({ building, owned, cost, canBuy, onBuy }: { building: BuildingDefinition; owned: number; cost: number; canBuy: boolean; onBuy: () => void }) {
  return <div className="rounded-2xl border border-pink-300/20 bg-white/5 p-3"><div className="flex items-start gap-2"><img src={building.icon} alt={building.name} draggable={false} className="h-10 w-10 shrink-0 object-contain" /><div className="min-w-0 flex-1"><p className="text-sm font-black text-white">{building.name} <span className="text-xs text-pink-200/70">Lv.{owned}</span></p><p className="mt-1 text-[11px] leading-snug text-white/60">{building.description}</p><p className="mt-1 text-[10px] font-bold text-pink-200">+{formatIdleNumber(building.baseRate)}/detik tiap level</p></div></div><button type="button" disabled={!canBuy} onClick={onBuy} className="game-button mt-3 w-full bg-pink-500">Bangun · {formatIdleNumber(cost)}</button></div>;
}
