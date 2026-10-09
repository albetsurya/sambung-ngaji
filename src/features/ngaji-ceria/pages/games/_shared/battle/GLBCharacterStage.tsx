import { BattleScene } from "./BattleScene";
import { getBattleArena, type BattleSetup } from "./models";
import type { BattleVisualState } from "./types";

const SHOWCASE_VISUAL: BattleVisualState = {
  attack: null,
  outcome: null,
  paused: false,
  playerHp: 100,
  monsterHp: 100,
};

export function GLBCharacterStage({ setup, label = "Karakter dan arena GLB" }: { setup: BattleSetup; label?: string }) {
  const arena = getBattleArena(setup.arenaId);
  return <section className="glb-character-stage" aria-label={label} data-battle-arena={arena.id}>
    <p className="px-3 pt-2 text-center text-[10px] font-black uppercase tracking-wider text-white/70">{arena.name} · {arena.monsterName}</p>
    <BattleScene visual={SHOWCASE_VISUAL} variant={0} theme={arena.theme} setup={setup} />
  </section>;
}
