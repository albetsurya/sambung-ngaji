import { useState } from "react";
import { DEFAULT_BATTLE_SETUP, getBattleArena, getBattleCharacter, type BattleArenaId, type BattleCharacterId, type BattleSetup } from "./models";

const STORAGE_KEY = "ngajiceria:battle-setup:v1";

function readSetup(defaultArena: BattleArenaId): BattleSetup {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as BattleSetup | null;
    if (saved) return {
      characterId: getBattleCharacter(saved.characterId).id,
      arenaId: getBattleArena(saved.arenaId).id,
    };
  } catch { /* Storage is optional. */ }
  return { ...DEFAULT_BATTLE_SETUP, arenaId: defaultArena };
}

export function useBattleSetup(defaultArena: BattleArenaId = "cave") {
  const [setup, setSetup] = useState<BattleSetup>(() => readSetup(defaultArena));
  const change = (next: BattleSetup) => {
    setSetup(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage is optional. */ }
  };
  return {
    setup,
    character: getBattleCharacter(setup.characterId),
    arena: getBattleArena(setup.arenaId),
    selectCharacter: (characterId: BattleCharacterId) => change({ ...setup, characterId }),
    selectArena: (arenaId: BattleArenaId) => change({ ...setup, arenaId }),
  };
}
