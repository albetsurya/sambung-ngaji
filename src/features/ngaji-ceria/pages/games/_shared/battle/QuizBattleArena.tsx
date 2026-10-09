import { BattleScene } from "./BattleScene";
import { PLAYER_MAX_HP, type BattleVisualState } from "./types";
import { getBattleArena, getBattleCharacter, type BattleSetup } from "./models";

interface QuizBattleArenaProps extends BattleVisualState {
  monsterMaxHp: number;
  monsterName: string;
  encounter: number;
  theme: "dungeon" | "sky";
  setup?: BattleSetup;
}

function HealthBar({ name, hp, maxHp, side }: { name: string; hp: number; maxHp: number; side: "player" | "monster" }) {
  const value = Math.max(0, Math.min(maxHp, hp));
  return <div className="min-w-0 flex-1">
    <p className="truncate text-xs font-black text-white">{name}</p>
    <div role="progressbar" aria-label={side === "player" ? "HP pemain" : "HP monster"} aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={value} className="mt-1 h-3 overflow-hidden rounded-full border border-white/20 bg-black/40">
      <div className={`h-full transition-[width] duration-500 ${side === "player" ? "bg-gradient-to-r from-emerald-500 to-cyan-300" : "bg-gradient-to-r from-rose-600 to-orange-300"}`} style={{ width: `${value / maxHp * 100}%` }} />
    </div>
    <p data-testid={`battle-${side}-hp`} className="mt-1 text-[10px] font-bold text-white/70">{value} / {maxHp} HP</p>
  </div>;
}

export function QuizBattleArena({ monsterMaxHp, monsterName, encounter, theme, setup, ...visual }: QuizBattleArenaProps) {
  const character = getBattleCharacter(setup?.characterId);
  const arena = getBattleArena(setup?.arenaId ?? (theme === "sky" ? "sky" : "cave"));
  const announcement = visual.outcome === "victory" ? "Victory! Semua monster dikalahkan."
    : visual.outcome === "defeat" ? "Defeat. HP pemain habis."
    : visual.monsterHp === 0 ? "Monster dikalahkan!"
    : visual.attack ? `${visual.attack.attacker === "player" ? "Serangan Qirra" : "Serangan monster"}: −${visual.attack.damage} HP` : "Jawab benar untuk menyerang!";
  return <section aria-label="Arena Quiz Battle" className={`quiz-battle-arena quiz-battle-${arena.theme}`} data-battle-outcome={visual.outcome ?? "battling"} data-battle-attacker={visual.attack?.attacker ?? "none"} data-battle-arena={arena.id} data-battle-character={character.id}>
    <p className="px-3 pt-3 text-center text-[10px] font-black uppercase tracking-wider text-amber-200">{arena.name} · {arena.monsterName}</p>
    <div className="relative z-10 flex items-start gap-3 p-3">
      <HealthBar name={`${character.name} · Kamu`} hp={visual.playerHp} maxHp={PLAYER_MAX_HP} side="player" />
      <span className="pt-4 text-xs font-black italic text-amber-200">VS</span>
      <HealthBar name={`${arena.monsterName} · ${monsterName}`} hp={visual.monsterHp} maxHp={monsterMaxHp} side="monster" />
    </div>
    <BattleScene key={`${arena.id}:${character.id}:${encounter}`} visual={visual} variant={encounter} theme={arena.theme} setup={setup} />
    {visual.attack && <span key={visual.attack.id} aria-hidden="true" className={`quiz-battle-damage quiz-battle-damage-${visual.attack.attacker === "player" ? "monster" : "player"}`} style={{ animationPlayState: visual.paused ? "paused" : "running" }}>−{visual.attack.damage}</span>}
    <p role="status" className="quiz-battle-caption">{announcement}</p>
  </section>;
}
