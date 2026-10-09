import { motion } from "framer-motion";
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { NgajiCeriaLayout } from "../../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../../data/assets";
import { Play } from "../../../../components/ui/FontAwesomeIcons";
import { useGameAccess } from "../../components/GameLockGuard";
import { LoginPromptModal } from "../../components/LoginPromptModal";
import { canonicalGameId, isGameOpenForGuest } from "../../data/gameAccess";
import { getBest } from "./_shared/storage";

interface HubMode { title: string; description: string; path: string; cover: string; bestKey: string }
const HUBS: Record<string, { title: string; tagline: string; description: string; theme: string; glow: string; modes: HubMode[] }> = {
  "ritme-ngaji": {
    title: "Ritme Ngaji", tagline: "Hub · Rhythm", description: "Satu arena untuk melatih harakat, bentuk huruf, dan makhraj. Pilih fokusmu.",
    theme: "from-slate-900 to-slate-800", glow: "shadow-cyan-500/20",
    modes: [
      { title: "Harakat Rush", description: "Runner tiga lane dengan target harakat dan power-up.", path: "/member/ngaji-ceria/games/harakat-rush", cover: NGAJI_CERIA_ASSETS.harakatRush, bestKey: "harakat-rush" },
      { title: "Makhraj Master", description: "Empat lane rhythm dengan judgement Perfect dan Good.", path: "/member/ngaji-ceria/games/makhraj-master", cover: NGAJI_CERIA_ASSETS.hijaiyahRush, bestKey: "makhraj-master" },
      { title: "Hijaiyah Beats", description: "Mode normal atau endless untuk mengikuti bentuk huruf.", path: "/member/ngaji-ceria/games/hijaiyah-beats", cover: NGAJI_CERIA_ASSETS.hijaiyahPop, bestKey: "hijaiyah-beats" },
    ],
  },
  "quiz-ngaji": {
    title: "Quiz Ngaji", tagline: "Hub · Kuis", description: "Pilih format tantangan: speedrun kilat, saf podium, atau panjat menara lentera.",
    theme: "from-[#2A0E2E] to-[#4C1D95]", glow: "shadow-pink-500/20",
    modes: [
      { title: "Juz Amma Speedrun", description: "Sepuluh soal, lima detik per jawaban.", path: "/member/ngaji-ceria/games/juz-amma-speedrun", cover: NGAJI_CERIA_ASSETS.juzAmmaSpeedrun, bestKey: "juz-amma-speedrun" },
      { title: "Quran Quiz Royale", description: "Duduk di saf, bertahan sampai podium masjid.", path: "/member/ngaji-ceria/games/quran-quiz-royale", cover: NGAJI_CERIA_ASSETS.quranQuizRoyale, bestKey: "quran-quiz-royale" },
      { title: "Nur Battle", description: "Nyalakan tiga lantai menara lentera.", path: "/member/ngaji-ceria/games/nur-battle", cover: NGAJI_CERIA_ASSETS.quranQuizRoyale, bestKey: "nur-battle" },
    ],
  },
  "puzzle-huruf": {
    title: "Puzzle Huruf", tagline: "Hub · Puzzle", description: "Asah kosakata, susun ayat, dan jelajahi peta dalam empat mode tantangan.",
    theme: "from-[#052E2B] to-[#064E3B]", glow: "shadow-emerald-500/20",
    modes: [
      { title: "Arabic Wordle", description: "Tebak kata Arab lima huruf.", path: "/member/ngaji-ceria/games/arabic-wordle", cover: NGAJI_CERIA_ASSETS.arabicWordle, bestKey: "arabic-wordle:daily" },
      { title: "Ayat Scramble", description: "Susun potongan ayat menjadi urutan yang benar.", path: "/member/ngaji-ceria/games/ayat-scramble", cover: NGAJI_CERIA_ASSETS.ayatScramble, bestKey: "ayat-scramble:normal" },
      { title: "Hijaiyah 2048", description: "Gabungkan tile huruf ke level berikutnya.", path: "/member/ngaji-ceria/games/hijaiyah-2048", cover: NGAJI_CERIA_ASSETS.hijaiyah2048, bestKey: "hijaiyah-2048" },
      { title: "Ayat Hunter", description: "Gerakkan Qirra di peta dan kumpulkan kata sesuai urutan ayat.", path: "/member/ngaji-ceria/games/ayat-hunter", cover: NGAJI_CERIA_ASSETS.ayatHunter, bestKey: "ayat-hunter" },
    ],
  },
  "tajwid-lab": {
    title: "Tajwid Lab", tagline: "Hub · Strategi", description: "Belajar hukum bacaan lewat meja majelis, strategi pertahanan, dan puzzle blok.",
    theme: "from-[#1E1B4B] to-[#312E81]", glow: "shadow-violet-500/20",
    modes: [
      { title: "Tajwid Arena", description: "Jawab soal dan mainkan kartu di meja majelis.", path: "/member/ngaji-ceria/games/tajwid-arena", cover: NGAJI_CERIA_ASSETS.hijaiyahMatchArena, bestKey: "tajwid-arena" },
      { title: "Tajwid Defense", description: "Pasang menara hukum tajwid dan tahan wave musuh.", path: "/member/ngaji-ceria/games/tajwid-defense", cover: NGAJI_CERIA_ASSETS.harakatRush, bestKey: "tajwid-defense" },
      { title: "Tajwid Tetris", description: "Susun blok hukum bacaan dan bersihkan baris untuk naik level.", path: "/member/ngaji-ceria/games/tajwid-tetris", cover: NGAJI_CERIA_ASSETS.tajwidTetris, bestKey: "tajwid-tetris" },
    ],
  },
};

export default function GameModeHubPage({ hubOverride }: { hubOverride?: string }) {
  const { hub: routeHub } = useParams<{ hub: string }>();
  const navigate = useNavigate();
  const hub = hubOverride ?? routeHub;
  const config = hub ? HUBS[hub] : undefined;
  const { tier } = useGameAccess(hub ?? "");
  const [promptOpen, setPromptOpen] = useState(false);
  if (!config) return <Navigate to="/member/ngaji-ceria/games" replace />;
  const openMode = (path: string, locked: boolean) => {
    if (locked && tier === "guest") {
      setPromptOpen(true);
      return;
    }
    navigate(path);
  };
  return <NgajiCeriaLayout title={config.title} showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
    <div className="min-h-full px-4 py-4">
      {/* Hero ala modern game launcher */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
        className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-4 text-white shadow-xl ${config.theme} ${config.glow}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_130%,rgba(255,255,255,.14),transparent_65%)]" />
        <p className="relative text-[10px] font-black uppercase tracking-widest text-white/55">{config.tagline}</p>
        <h2 className="relative mt-0.5 font-display text-2xl font-black leading-tight">{config.title}</h2>
        <p className="relative mt-1 max-w-xs text-xs leading-relaxed text-white/70">{config.description}</p>
        <div className="relative mt-2 flex items-center gap-1.5">
          {config.modes.map((mode, index) => <span key={mode.path} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[10px] font-black text-white backdrop-blur-sm">{index + 1}</span>)}
          <span className="ml-1 text-[10px] font-black uppercase tracking-wider text-white/60">{config.modes.length} mode tersedia</span>
        </div>
      </motion.div>

      {/* Grid mode */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {config.modes.map((mode, index) => {
          const best = getBest(mode.bestKey);
          const modeId = canonicalGameId(mode.path.split("/").pop() ?? "");
          const locked = tier === "guest" && !isGameOpenForGuest(modeId);
          return <motion.button
            type="button"
            key={mode.path}
            onClick={() => openMode(mode.path, locked)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + Math.min(index * 0.05, 0.3), duration: 0.25 }}
            whileTap={{ scale: 0.96 }}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b text-left shadow-xl ${config.theme} ${config.glow}`}>
            <div className="relative flex h-24 items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,.14),transparent_65%)]" />
              <img src={mode.cover} alt="" aria-hidden="true" draggable={false}
                className={`h-16 w-16 object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,.45)] transition-transform duration-300 group-active:scale-110 ${locked ? "grayscale" : ""}`} />
              <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-[10px] font-black text-white backdrop-blur-sm">{locked ? "🔒" : index + 1}</span>
              {locked
                ? <span data-testid={`hub-lock-${modeId}`} className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] font-black text-amber-300">🔒 Masuk</span>
                : best > 0 && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#FFCB45] px-2 py-0.5 text-[9px] font-black text-[#5A3A2A]"><img src={NGAJI_CERIA_ASSETS.bintang} alt="" aria-hidden="true" draggable={false} className="h-3 w-3 object-contain" />{best}</span>}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h3 className="font-display text-sm font-black leading-tight text-white">{mode.title}</h3>
              <p className="mb-3 mt-1 line-clamp-2 text-[11px] leading-snug text-white/60">{mode.description}</p>
              <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-xs font-black text-white backdrop-blur-sm transition group-active:bg-white/25">
                {locked ? "🔒 Masuk untuk Main" : <><Play size={12} />Main</>}
              </span>
            </div>
          </motion.button>;
        })}
      </div>
      <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
    </div>
  </NgajiCeriaLayout>;
}
