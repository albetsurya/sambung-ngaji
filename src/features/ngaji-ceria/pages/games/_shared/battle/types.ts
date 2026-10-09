export const PLAYER_MAX_HP = 100;
export const ANSWER_DAMAGE = 25;
export const ATTACK_SECONDS = 1.1;

export type BattleOutcome = "victory" | "defeat" | null;
export interface BattleAttack {
  id: number;
  attacker: "player" | "monster";
  damage: number;
}

export interface BattleVisualState {
  attack: BattleAttack | null;
  outcome: BattleOutcome;
  paused: boolean;
  playerHp: number;
  monsterHp: number;
}
