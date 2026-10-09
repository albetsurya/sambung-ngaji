import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Play, Star } from "../../../components/ui/FontAwesomeIcons";
import { useGameAccess } from "../components/GameLockGuard";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { isGameOpenForGuest } from "../data/gameAccess";
import { getBest } from "./games/_shared/storage";

interface GameEntry {
  id: string;
  title: string;
  genre: string;
  description: string;
  cover: string;
  best: number;
  theme: string;
  glow: string;
  modes?: number;
  path: string;
}

const GAMES: GameEntry[] = [
  { id: "ritme-ngaji", title: "Ritme Ngaji", genre: "Hub · Rhythm", description: "Harakat, bentuk huruf, dan makhraj dalam satu arena rhythm.", cover: NGAJI_CERIA_ASSETS.harakatRush, best: Math.max(getBest("harakat-rush"), getBest("makhraj-master"), getBest("hijaiyah-beats")), theme: "from-slate-900 to-slate-800", glow: "shadow-cyan-500/20", modes: 3, path: "/member/ngaji-ceria/games/ritme-ngaji" },
  { id: "quiz-ngaji", title: "Quiz Ngaji", genre: "Hub · Kuis", description: "Speedrun, royale, dan battle practice Juz Amma.", cover: NGAJI_CERIA_ASSETS.quranQuizRoyale, best: Math.max(getBest("juz-amma-speedrun"), getBest("quran-quiz-royale"), getBest("nur-battle")), theme: "from-[#2A0E2E] to-[#4C1D95]", glow: "shadow-pink-500/20", modes: 3, path: "/member/ngaji-ceria/games/quiz-ngaji" },
  { id: "puzzle-huruf", title: "Puzzle Huruf", genre: "Hub · Puzzle", description: "Wordle, scramble, 2048, dan berburu ayat bersama Qirra.", cover: NGAJI_CERIA_ASSETS.ayatScramble, best: Math.max(getBest("arabic-wordle:daily"), getBest("ayat-scramble:normal"), getBest("hijaiyah-2048"), getBest("ayat-hunter")), theme: "from-[#052E2B] to-[#064E3B]", glow: "shadow-emerald-500/20", modes: 4, path: "/member/ngaji-ceria/games/puzzle-huruf" },
  { id: "tajwid-lab", title: "Tajwid Lab", genre: "Hub · Strategi", description: "Duel kartu, pertahanan base, dan puzzle blok tajwid.", cover: NGAJI_CERIA_ASSETS.hijaiyahMatchArena, best: Math.max(getBest("tajwid-arena"), getBest("tajwid-defense"), getBest("tajwid-tetris")), theme: "from-[#1E1B4B] to-[#312E81]", glow: "shadow-violet-500/20", modes: 3, path: "/member/ngaji-ceria/games/tajwid-lab" },
  { id: "hijaiyah-pop", title: "Hijaiyah Pop!", genre: "Arcade · Refleks", description: "Pecahkan balon huruf secepat kilat.", cover: NGAJI_CERIA_ASSETS.hijaiyahPop, best: getBest("hijaiyah-pop"), theme: "from-slate-900 to-slate-800", glow: "shadow-cyan-500/20", path: "/member/ngaji-ceria/games/hijaiyah-pop" },
  { id: "santri-idle", title: "Pesantren Life", genre: "Simulasi · Idle", description: "Bangun pesantren dan kumpulkan resource offline.", cover: NGAJI_CERIA_ASSETS.santriIdle, best: getBest("santri-idle"), theme: "from-[#052E2B] to-[#064E3B]", glow: "shadow-emerald-500/20", path: "/member/ngaji-ceria/games/santri-idle" },
  { id: "adab-rpg", title: "Jejak Santri", genre: "RPG · Cerita", description: "Jelajahi pesantren, selesaikan quest, bentuk ending-mu.", cover: NGAJI_CERIA_ASSETS.adabRpg, best: getBest("adab-rpg"), theme: "from-[#1E1B4B] to-[#312E81]", glow: "shadow-violet-500/20", path: "/member/ngaji-ceria/games/adab-rpg" },
  { id: "doa-dungeon", title: "Doa Dungeon", genre: "Battle · Doa", description: "Enam lantai dungeon menantimu di balik doa yang tepat.", cover: NGAJI_CERIA_ASSETS.doaDungeon, best: getBest("doa-dungeon"), theme: "from-[#1E1B4B] to-[#312E81]", glow: "shadow-violet-500/20", path: "/member/ngaji-ceria/games/doa-dungeon" },
  { id: "nabi-chronicles", title: "Nabi Chronicles", genre: "Cerita · Hikmah", description: "Lima chapter kisah teladan dan pilihan sikap.", cover: NGAJI_CERIA_ASSETS.nabiChronicles, best: getBest("nabi-chronicles"), theme: "from-[#2A0E2E] to-[#4C1D95]", glow: "shadow-pink-500/20", path: "/member/ngaji-ceria/games/nabi-chronicles" },
  { id: "malaikat-mission", title: "Malaikat Mission", genre: "Battle · Misi", description: "Misi kilat mengenal nama dan tugas malaikat.", cover: NGAJI_CERIA_ASSETS.malaikatMission, best: getBest("malaikat-mission"), theme: "from-slate-900 to-slate-800", glow: "shadow-cyan-500/20", path: "/member/ngaji-ceria/games/malaikat-mission" },
];

function GameCard({ game, index, locked, onOpen }: { game: GameEntry; index: number; locked: boolean; onOpen: () => void }) {
  return <motion.button
    type="button"
    onClick={onOpen}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.25 }}
    whileTap={{ scale: 0.96 }}
    className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b text-left shadow-xl ${game.theme} ${game.glow}`}>
    <div className="relative flex h-28 items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,.14),transparent_65%)]" />
      <motion.img src={game.cover} alt="" aria-hidden="true"
        className={`h-20 w-20 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,.45)] transition-transform duration-300 group-active:scale-110 ${locked ? "grayscale" : ""}`}
        draggable={false} />
      {game.modes && <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-sm">{game.modes} mode</span>}
      {locked && <span data-testid={`game-lock-${game.id}`} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] font-black text-amber-300 backdrop-blur-sm">🔒 Masuk untuk Akses Penuh</span>}
      {!locked && game.best > 0 && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#FFCB45] px-2 py-0.5 text-[9px] font-black text-[#5A3A2A]"><Star size={10} />{game.best}</span>}
    </div>
    <div className="flex flex-1 flex-col p-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{game.genre}</p>
      <h3 className="mt-0.5 font-display text-sm font-black leading-tight text-white">{game.title}</h3>
      <p className="mb-3 mt-1 line-clamp-2 text-[11px] leading-snug text-white/60">{game.description}</p>
      <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-black text-white backdrop-blur-sm transition group-active:bg-white/25">
        {locked ? "🔒 Terkunci" : <><Play size={12} />Main</>}
      </span>
    </div>
  </motion.button>;
}

export default function NgajiCeriaGamesPage() {
  const navigate = useNavigate();
  const { tier } = useGameAccess("games");
  const [promptOpen, setPromptOpen] = useState(false);
  const openGame = (path: string, locked: boolean) => {
    if (locked && tier === "guest") {
      setPromptOpen(true);
      return;
    }
    navigate(path);
  };
  return <NgajiCeriaLayout title="Mini Games" showBack><div className="space-y-4 rounded-t-3xl bg-[#FBF8F1] px-4 py-4">
    <div className="text-center">
      <h2 className="flex items-center justify-center gap-2 font-display text-lg font-black text-[#5A3A2A]">Pilih Duniamu <img src={NGAJI_CERIA_ASSETS.iconGames} alt="" aria-hidden="true" draggable={false} className="h-6 w-6 object-contain" /></h2>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#5A3A2A]/70">Hub berisi beberapa mode sekaligus — buka satu pintu untuk banyak permainan.</p>
    </div>
    <button type="button" onClick={() => navigate("/member/ngaji-ceria/leaderboard")} className="mx-auto flex items-center justify-center gap-1.5 rounded-full border-2 border-[#E2D4C0] bg-white px-4 py-2 text-xs font-black text-[#5A3A2A] shadow-sm transition active:scale-95"><Star size={12} className="text-[#F58A3A]" />Progres &amp; papan skor</button>
    <div className="grid grid-cols-2 gap-3">
      {GAMES.map((game, index) => {
        const locked = tier === "guest" && !isGameOpenForGuest(game.id);
        return <GameCard key={game.path} game={game} index={index} locked={locked} onOpen={() => openGame(game.path, locked)} />;
      })}
    </div>
    <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
  </div></NgajiCeriaLayout>;
}
