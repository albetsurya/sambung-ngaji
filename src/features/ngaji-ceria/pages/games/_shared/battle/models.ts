export type BattleModelActor = "player" | "monster";
export type BattleCharacterId =
  | "qirra"
  | "adventurer-boy"
  | "astronaut"
  | "robot"
  | "muay-thai";
export type BattleArenaId = "cave" | "sky" | "garden" | "forest" | "dojo";

export interface BattleSetup {
  characterId: BattleCharacterId;
  arenaId: BattleArenaId;
}

export interface BattleCharacterConfig {
  id: BattleCharacterId;
  name: string;
  description: string;
  modelUrl: string;
  modelHeight: number;
  rotationY: number;
  tint: number;
  accent: string;
  available: boolean;
}

export interface BattlePropConfig {
  url: string;
  position: [number, number, number];
  targetHeight: number;
  rotationY?: number;
}

export interface BattleArenaConfig {
  id: BattleArenaId;
  name: string;
  description: string;
  theme: "dungeon" | "sky";
  background: number;
  floor: number;
  rim: number;
  monsterName: string;
  monsterEmoji: string;
  monsterModelUrl: string;
  monsterHeight: number;
  monsterRotationY: number;
  monsterTint?: number;
  props: BattlePropConfig[];
}

const PLAYER_MODEL_URL = import.meta.env.VITE_NGAJI_CERIA_PLAYER_MODEL?.trim() || "/models/ngaji-ceria/qirra.glb";
const KENNEY = "/models/ngaji-ceria/kenney";
const KENNEY_FOREST = `${KENNEY}/mini-forest`;
const KENNEY_DUNGEON = `${KENNEY}/mini-dungeon`;
const KENNEY_CAVE = `${KENNEY}/modular-cave`;
const KENNEY_NATURE = `${KENNEY}/nature`;
const NATURE_PACK = "/models/ngaji-ceria/props";
const MONSTERS_PACK = "/models/ngaji-ceria/monsters";

export const BATTLE_CHARACTERS: BattleCharacterConfig[] = [
  {
    id: "qirra",
    name: "Qirra",
    description: "Santri penjaga cahaya",
    modelUrl: PLAYER_MODEL_URL,
    modelHeight: 2.1,
    rotationY: 0.4,
    tint: 0x14b8a6,
    accent: "teal",
    available: true,
  },
  {
    id: "adventurer-boy",
    name: "Adventurer Boy",
    description: "Anak penjelajah 3D berbusana santri",
    modelUrl: "/models/ngaji-ceria/adventurer-boy.glb",
    modelHeight: 2.1,
    rotationY: 0.4,
    tint: 0xf59e0b,
    accent: "amber",
    available: true,
  },
  {
    id: "astronaut",
    name: "Astronot Ilmu",
    description: "Penjelajah angkasa dengan jurus tinju cepat",
    modelUrl: "/models/ngaji-ceria/characters/astronaut.glb",
    modelHeight: 2.1,
    rotationY: 0.4,
    tint: 0xe2e8f0,
    accent: "slate",
    available: true,
  },
  {
    id: "robot",
    name: "Robot Cerdas",
    description: "Robot penolong dengan pukulan presisi",
    modelUrl: "/models/ngaji-ceria/characters/robot.glb",
    modelHeight: 1.8,
    rotationY: 0.4,
    tint: 0x22d3ee,
    accent: "cyan",
    available: true,
  },
  {
    id: "muay-thai",
    name: "Pendekar Muay",
    description: "Ahli bela diri tangan kosong yang tangguh",
    modelUrl: "/models/ngaji-ceria/characters/muay-thai.glb",
    modelHeight: 2.1,
    rotationY: 0.4,
    tint: 0xef4444,
    accent: "red",
    available: true,
  },
];

export const BATTLE_ARENAS: BattleArenaConfig[] = [
  {
    id: "cave",
    name: "Gua Kristal",
    description: "Pilar kristal bercahaya dan penjaga Orc yang menguji ketelitian hafalan.",
    theme: "dungeon",
    background: 0x17142b,
    floor: 0x34455b,
    rim: 0xc4b5fd,
    monsterName: "Monster Orc Guard",
    monsterEmoji: "👾",
    monsterModelUrl: "/models/ngaji-ceria/nurling.glb",
    monsterHeight: 2.35,
    monsterRotationY: -0.4,
    monsterTint: 0xa78bfa,
    props: [
      { url: `${KENNEY_CAVE}/room-small.glb`, position: [0, -0.12, -3.3], targetHeight: 5.2 },
      { url: `${NATURE_PACK}/nature-rock.glb`, position: [-2.65, -0.05, 0.35], targetHeight: 1.2, rotationY: 0.4 },
      { url: `${NATURE_PACK}/nature-rock.glb`, position: [2.65, -0.05, 0.35], targetHeight: 1.0, rotationY: -0.7 },
    ],
  },
  {
    id: "sky",
    name: "Langit Awan",
    description: "Arena terbuka bertema fajar melawan Katak Astronot yang lincah.",
    theme: "sky",
    background: 0x092b45,
    floor: 0x2e6475,
    rim: 0x67e8f9,
    monsterName: "Katak Astronot",
    monsterEmoji: "🟢",
    monsterModelUrl: "/models/ngaji-ceria/monsters/frog-astronaut.glb",
    monsterHeight: 2.1,
    monsterRotationY: -0.4,
    monsterTint: 0x34d399,
    props: [
      { url: `${NATURE_PACK}/nature-tree.glb`, position: [-3.1, -0.05, -2.2], targetHeight: 3.6, rotationY: 0.35 },
      { url: `${NATURE_PACK}/nature-tree.glb`, position: [3.1, -0.05, -2.35], targetHeight: 3.4, rotationY: -0.45 },
      { url: `${KENNEY_NATURE}/bridge_center_wood.glb`, position: [0, -0.13, -2.9], targetHeight: 1.3, rotationY: 0 },
    ],
  },
  {
    id: "garden",
    name: "Taman Alam",
    description: "Taman alam 3D nan asri tempat pepohonan dan bebatuan mengelilingi pertarungan.",
    theme: "dungeon",
    background: 0x102a2a,
    floor: 0x315b50,
    rim: 0xfde68a,
    monsterName: "Raja Jamur",
    monsterEmoji: "🍄",
    monsterModelUrl: `${MONSTERS_PACK}/mushroom-king.glb`,
    monsterHeight: 2.2,
    monsterRotationY: -0.4,
    monsterTint: 0x4ade80,
    props: [
      { url: `${NATURE_PACK}/nature-tree.glb`, position: [-3.15, -0.05, -2.15], targetHeight: 3.7, rotationY: 0.2 },
      { url: `${NATURE_PACK}/nature-plant.glb`, position: [3.15, -0.05, -2.2], targetHeight: 1.6, rotationY: -0.4 },
      { url: `${NATURE_PACK}/nature-rock.glb`, position: [0, -0.08, -1.7], targetHeight: 0.85, rotationY: 0.5 },
    ],
  },
  {
    id: "forest",
    name: "Hutan Pinus",
    description: "Arena hutan pinus Quaternius melawan Raksasa Hutan yang ganas.",
    theme: "dungeon",
    background: 0x0b2420,
    floor: 0x1f4d3a,
    rim: 0x86efac,
    monsterName: "Raksasa Yeti",
    monsterEmoji: "❄️",
    monsterModelUrl: `${MONSTERS_PACK}/yeti.glb`,
    monsterHeight: 2.4,
    monsterRotationY: -0.4,
    monsterTint: 0x86efac,
    props: [
      { url: `${NATURE_PACK}/nature-pine.glb`, position: [-3.2, -0.05, -2.2], targetHeight: 3.8, rotationY: 0.3 },
      { url: `${NATURE_PACK}/nature-pine.glb`, position: [3.2, -0.05, -2.3], targetHeight: 3.5, rotationY: -0.4 },
      { url: `${NATURE_PACK}/nature-rock.glb`, position: [0, -0.1, -2.9], targetHeight: 1.1, rotationY: 0 },
    ],
  },
  {
    id: "dojo",
    name: "Dojo Batu",
    description: "Arena latihan batu melawan Raksasa Batu dengan props Quaternius.",
    theme: "sky",
    background: 0x1c1917,
    floor: 0x78716c,
    rim: 0xfdba74,
    monsterName: "Orc Dojo",
    monsterEmoji: "👹",
    monsterModelUrl: `${MONSTERS_PACK}/orc.glb`,
    monsterHeight: 2.3,
    monsterRotationY: -0.4,
    monsterTint: 0xfb923c,
    props: [
      { url: `/models/ngaji-ceria/props/dead-tree.glb`, position: [-3.1, -0.05, -2.2], targetHeight: 3.4, rotationY: 0.2 },
      { url: `/models/ngaji-ceria/props/rock-path.glb`, position: [0, -0.14, -2.7], targetHeight: 0.6, rotationY: 0 },
      { url: `${NATURE_PACK}/nature-rock.glb`, position: [2.8, -0.05, -1.5], targetHeight: 1.3, rotationY: -0.5 },
    ],
  },
];

export const DEFAULT_BATTLE_SETUP: BattleSetup = { characterId: "qirra", arenaId: "cave" };

export function getBattleCharacter(id: BattleCharacterId = DEFAULT_BATTLE_SETUP.characterId) {
  return BATTLE_CHARACTERS.find((character) => character.id === id) || BATTLE_CHARACTERS[0];
}

export function getBattleArena(id: BattleArenaId = DEFAULT_BATTLE_SETUP.arenaId) {
  return BATTLE_ARENAS.find((arena) => arena.id === id) || BATTLE_ARENAS[0];
}

export const BATTLE_MODEL_URLS: Record<BattleModelActor, string> = {
  player: getBattleCharacter().modelUrl,
  monster: getBattleArena("sky").monsterModelUrl,
};

export const BATTLE_MODEL_HEIGHTS: Record<BattleModelActor, number> = {
  player: getBattleCharacter().modelHeight,
  monster: getBattleArena("sky").monsterHeight,
};

export const BATTLE_MODEL_ROTATIONS: Record<BattleModelActor, number> = {
  player: getBattleCharacter().rotationY,
  monster: getBattleArena("sky").monsterRotationY,
};

// Animasi tangan kosong yang lebih realistis
export const BATTLE_ANIMATION_NAMES = [
  "idle", 
  "attack",    // Pukulan tangan kosong
  "hit",       // Terkena pukulan
  "defeat",    // Terjatuh (kalah)
  "dodge",     // Menghindar
  "block",     // Menangkis
] as const;
export type BattleAnimationName = (typeof BATTLE_ANIMATION_NAMES)[number];
