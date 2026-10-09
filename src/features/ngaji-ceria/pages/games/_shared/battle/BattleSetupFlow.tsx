import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACCENTS, type GameAccent } from "../types";
import { preloadBattleModels } from "./BattleScene";
import {
  BATTLE_ARENAS,
  BATTLE_CHARACTERS,
  getBattleArena,
  getBattleCharacter,
  type BattleArenaId,
  type BattleCharacterId,
  type BattleSetup,
} from "./models";
import { NGAJI_CERIA_ASSETS } from "@/features/ngaji-ceria/data/assets";

type Step = "character" | "arena" | "versus";

const CHARACTER_AVATARS: Record<string, string> = {
  "adventurer-boy": NGAJI_CERIA_ASSETS.avatarBoy,
  qirra: NGAJI_CERIA_ASSETS.avatarQirra,
  astronaut: NGAJI_CERIA_ASSETS.avatarBoy,
  robot: NGAJI_CERIA_ASSETS.avatarBoy,
  "muay-thai": NGAJI_CERIA_ASSETS.avatarBoy,
};

const MONSTER_AVATARS: Record<string, string> = {
  "👾": NGAJI_CERIA_ASSETS.monsterPixel,
  "🟢": NGAJI_CERIA_ASSETS.monsterSlime,
  "🪨": NGAJI_CERIA_ASSETS.monsterGolem,
  "🍄": NGAJI_CERIA_ASSETS.monsterSlime,
  "❄️": NGAJI_CERIA_ASSETS.monsterPixel,
  "👹": NGAJI_CERIA_ASSETS.monsterGolem,
};

const ARENA_GLOW: Record<string, string> = {
  cave: "from-[#17142b] via-[#2b2358] to-[#17142b]",
  sky: "from-[#092b45] via-[#155e75] to-[#092b45]",
  garden: "from-[#102a2a] via-[#1d4d42] to-[#102a2a]",
};

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["character", "arena", "versus"];
  const active = order.indexOf(step);
  return <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
    {order.map((key, index) => <span key={key} className={`h-1.5 rounded-full transition-all ${index === active ? "w-6 bg-white" : index < active ? "w-1.5 bg-white/70" : "w-1.5 bg-white/25"}`} />)}
  </div>;
}

/**
 * Alur persiapan ala game modern: pilih karakter -> pilih arena ->
 * transisi kamera zoom ke arena -> mulai. Menggantikan BattleSetupPanel
 * yang menumpuk semuanya dalam satu layar.
 */
export function BattleSetupFlow({ setup, onCharacter, onArena, onBegin, accent = "violet", footer }: {
  setup: BattleSetup;
  onCharacter: (id: BattleCharacterId) => void;
  onArena: (id: BattleArenaId) => void;
  onBegin: () => void;
  accent?: GameAccent;
  footer?: ReactNode;
}) {
  const [step, setStep] = useState<Step>("character");
  const character = getBattleCharacter(setup.characterId);
  const arena = getBattleArena(setup.arenaId);

  // Pemanasan cache HTTP selagi pemain memilih, agar transisi ke arena mulus.
  useEffect(() => {
    preloadBattleModels(character.modelUrl, arena.monsterModelUrl);
  }, [character.modelUrl, arena.monsterModelUrl]);

  // Transisi VS otomatis lanjut (bisa di-skip dengan tombol).
  useEffect(() => {
    if (step !== "versus") return;
    const timer = window.setTimeout(onBegin, 2400);
    return () => window.clearTimeout(timer);
  }, [step, onBegin]);

  return <div className="w-full max-w-sm text-left" aria-label="Persiapan karakter dan arena">
    <StepDots step={step} />
    <AnimatePresence mode="wait">
      {step === "character" && (
        <motion.section key="character" initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -48 }} transition={{ duration: 0.22 }}>
          <h2 className="mt-3 text-center text-sm font-black text-white">Pilih Karaktermu</h2>
          <p className="mt-1 text-center text-[11px] text-white/60">Jagoan yang akan bertarung bersamamu.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {BATTLE_CHARACTERS.map((item) => {
              const selected = setup.characterId === item.id;
              return <button type="button" key={item.id} disabled={!item.available} aria-pressed={selected}
                onClick={() => item.available && onCharacter(item.id)}
                className={`flex flex-col items-center rounded-2xl border p-3 text-center transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${selected ? "border-cyan-200 bg-cyan-500/25 shadow-[0_0_18px_-4px_rgba(103,232,249,.6)]" : "border-white/15 bg-white/5"}`}>
                <motion.img src={CHARACTER_AVATARS[item.id] || NGAJI_CERIA_ASSETS.avatarAnak} alt={item.name} animate={selected ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.3 }} className="h-12 w-12 object-contain" />
                <span className="mt-2 text-[11px] font-black text-white">{item.name}</span>
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${selected ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white/60"}`}>{selected ? "Dipilih" : "Pilih"}</span>
              </button>;
            })}
          </div>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-white/50">{character.description}</p>
           <button type="button" onClick={onBegin} className="game-button mt-3 w-full border border-white/20 bg-white/10">Mulai</button>
           <button type="button" onClick={() => setStep("arena")} className={`game-button mt-2 w-full ${ACCENTS[accent].button}`}>Lanjut Pilih Arena →</button>
        </motion.section>
      )}

      {step === "arena" && (
        <motion.section key="arena" initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -48 }} transition={{ duration: 0.22 }}>
          <button type="button" onClick={() => setStep("character")} className="mt-3 text-[11px] font-black text-white/60 transition hover:text-white">← Ganti karakter ({character.name})</button>
          <h2 className="mt-1 text-center text-sm font-black text-white">Pilih Arena Tempur</h2>
          <p className="mt-1 text-center text-[11px] text-white/60">Setiap arena punya musuh dan suasana berbeda.</p>
          <div className="mt-3 grid gap-2">
            {BATTLE_ARENAS.map((item) => {
              const selected = setup.arenaId === item.id;
              return <button type="button" key={item.id} aria-pressed={selected} onClick={() => onArena(item.id)}
                className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-r p-3 text-left transition active:scale-[.98] ${ARENA_GLOW[item.id]} ${selected ? "border-amber-200 shadow-[0_0_18px_-4px_rgba(252,211,77,.55)]" : "border-white/15"}`}>
                <motion.img src={MONSTER_AVATARS[item.monsterEmoji] || item.monsterEmoji} alt={item.monsterName} animate={selected ? { scale: [1, 1.3, 1], rotate: [0, -8, 0] } : {}} transition={{ duration: 0.35 }} className="h-12 w-12 object-contain" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black text-white">{item.name}</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-white/65">{item.description}</span>
                  <span className="mt-1 block text-[9px] font-black uppercase tracking-wider text-amber-200">Musuh: {item.monsterName}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${selected ? "bg-amber-300 text-slate-950" : "bg-white/10 text-white/60"}`}>{selected ? "Siap" : "Pilih"}</span>
              </button>;
            })}
          </div>
          <button type="button" onClick={() => setStep("versus")} className={`game-button mt-3 w-full ${ACCENTS[accent].button}`}>Masuk Arena ⚔</button>
        </motion.section>
      )}

      {step === "versus" && (
        <motion.section key="versus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className={`relative mt-3 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b p-5 text-center ${ARENA_GLOW[arena.id]}`}>
          {/* Kamera: dari jauh mendekat */}
          <motion.div initial={{ scale: 0.45, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 90, damping: 15, duration: 0.9 }}
            className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <img src={CHARACTER_AVATARS[character.id] || NGAJI_CERIA_ASSETS.avatarAnak} alt={character.name} className="h-20 w-20 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,.5)]" />
              <span className="mt-2 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black text-white">{character.name}</span>
            </div>
            <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 12 }}
              className="rounded-full bg-red-500 px-3 py-1.5 font-display text-lg font-black text-white shadow-lg shadow-red-950/50">VS</motion.span>
            <motion.div initial={{ scale: 0.45, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 90, damping: 15 }}
              className="flex flex-col items-center">
              <img src={MONSTER_AVATARS[arena.monsterEmoji] || arena.monsterEmoji} alt={arena.monsterName} className="h-20 w-20 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,.5)]" />
              <span className="mt-2 rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-black text-amber-200">{arena.monsterName}</span>
            </motion.div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-3 text-xs font-black uppercase tracking-widest text-white/80">{arena.name}</motion.p>
          <motion.button type="button" onClick={onBegin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className={`game-button mt-4 w-full animate-pulse ${ACCENTS[accent].button}`}>⚔ Mulai Bertarung!</motion.button>
          <button type="button" onClick={() => setStep("arena")} className="mt-2 text-[11px] font-black text-white/60 transition hover:text-white">← Ganti arena</button>
        </motion.section>
      )}
    </AnimatePresence>
    {footer && step !== "versus" && <div className="mt-3">{footer}</div>}
  </div>;
}
