import { BATTLE_ARENAS, BATTLE_CHARACTERS, type BattleArenaId, type BattleCharacterId, type BattleSetup } from "./models";
import { NGAJI_CERIA_ASSETS } from "@/features/ngaji-ceria/data/assets";

const CHARACTER_AVATARS: Record<BattleCharacterId, string> = {
  "adventurer-boy": NGAJI_CERIA_ASSETS.avatarBoy,
  qirra: NGAJI_CERIA_ASSETS.avatarQirra,
  astronaut: NGAJI_CERIA_ASSETS.avatarBoy,
  robot: NGAJI_CERIA_ASSETS.avatarBoy,
  "muay-thai": NGAJI_CERIA_ASSETS.avatarBoy,
};

const MONSTER_ICONS: Record<string, string> = {
  "👾": NGAJI_CERIA_ASSETS.monsterPixel,
  "🟢": NGAJI_CERIA_ASSETS.monsterSlime,
  "🪨": NGAJI_CERIA_ASSETS.monsterGolem,
};

export function BattleSetupPanel({ setup, onCharacter, onArena }: {
  setup: BattleSetup;
  onCharacter: (id: BattleCharacterId) => void;
  onArena: (id: BattleArenaId) => void;
}) {
  return <div className="w-full max-w-sm space-y-4 text-left" aria-label="Persiapan karakter dan arena">
    <div>
      <h2 className="text-sm font-black text-white">1. Pilih karakter</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {BATTLE_CHARACTERS.map((character) => <button type="button" key={character.id} disabled={!character.available} aria-pressed={setup.characterId === character.id} onClick={() => character.available && onCharacter(character.id)} className={`rounded-2xl border p-3 text-left transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${setup.characterId === character.id ? "border-cyan-200 bg-cyan-500/20" : "border-white/15 bg-white/5"}`}>
          <img src={CHARACTER_AVATARS[character.id]} alt={character.name} className="h-10 w-10 object-contain" />
          <span className="mt-2 block text-xs font-black text-white">{character.name}</span>
          <span className="mt-1 block text-[10px] leading-relaxed text-white/60">{character.description}</span>
          <span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-cyan-200">{character.available ? `GLB · ${setup.characterId === character.id ? "Dipilih" : "Pilih"}` : "GLB · Menunggu file diunggah"}</span>
        </button>)}
      </div>
    </div>
    <div>
      <h2 className="text-sm font-black text-white">2. Pilih arena</h2>
      <div className="mt-2 grid gap-2">
        {BATTLE_ARENAS.map((arena) => <button type="button" key={arena.id} aria-pressed={setup.arenaId === arena.id} onClick={() => onArena(arena.id)} className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition active:scale-[.98] ${setup.arenaId === arena.id ? "border-amber-200 bg-amber-500/15" : "border-white/15 bg-white/5"}`}>
          <img src={MONSTER_ICONS[arena.monsterEmoji] || arena.monsterEmoji} alt={arena.monsterName} className="h-10 w-10 object-contain" />
          <span className="min-w-0 flex-1"><span className="block text-xs font-black text-white">{arena.name}</span><span className="mt-1 block text-[10px] leading-relaxed text-white/60">{arena.description}</span><span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-amber-200">Musuh: {arena.monsterName}{setup.arenaId === arena.id ? " · Dipilih" : ""}</span></span>
        </button>)}
      </div>
    </div>
    <p className="text-[10px] leading-relaxed text-white/50">Pilihan tersimpan di perangkat ini. Setiap arena memiliki model musuh, warna lantai, dan cahaya yang berbeda.</p>
  </div>;
}
