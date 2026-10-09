import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Play } from "@/components/ui/FontAwesomeIcons";
import { ModalPanel } from "./ModalPanel";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { ACCENTS, type GameOverModalProps } from "./types";
import { awardProgress, getProgress, recordLeaderboard } from "./progression";
import { soundManager } from "../../../services/soundManager";
import { canonicalGameId } from "../../../data/gameAccess";

export interface SecondChanceConfig {
  onSuccess: () => void;
  question?: string;
  options?: string[];
  correctIndex?: number;
}

export function GameOverModal({ visible, score, best, isNewRecord, onRetry, onExit, accent = "pink", title = "Sesi Selesai", description, children, secondChance, maxCombo = 0, victory = score > 0, achievementIds = [] }: GameOverModalProps & { secondChance?: SecondChanceConfig }) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const committed = useRef(false);
  const [xpGained, setXpGained] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(false);
  useEffect(() => {
    if (!visible) { committed.current = false; setSelected(null); setSkipped(false); setXpGained(0); return; }
    if ((secondChance && !skipped) || committed.current) return;
    committed.current = true;
    const gameId = canonicalGameId(location.pathname.split("/").pop() || "game");
    const before = getProgress().xp;
    const achievements = [...achievementIds];
    if (maxCombo >= 5) achievements.push("qari-cepat");
    if (victory && gameId.startsWith("tajwid-")) achievements.push("pejuang-tajwid");
    if (victory && ["ayat-hunter", "doa-dungeon"].includes(gameId)) achievements.push(`${gameId}-clear`);
    if (victory && gameId === "nabi-chronicles") achievements.push("nabi-chronicles-complete");
    if (victory && gameId === "malaikat-mission") achievements.push("malaikat-master");
    if (score > 0 && gameId === "tajwid-tetris") achievements.push("tetris-lines");
    const progress = awardProgress(gameId, score, 25 + Math.min(20, maxCombo * 2), achievements);
    setXpGained(progress.xp - before);
    recordLeaderboard(gameId, score);
    soundManager.playSfx(victory ? "victory" : "defeat");
  }, [visible, secondChance, skipped, score, maxCombo, victory, location.pathname, achievementIds]);
  if (!visible) return null;
  const options = secondChance?.options ?? ["Bismillah", "Alhamdulillah", "MasyaAllah"];
  const correctIndex = secondChance?.correctIndex ?? 0;
  if (secondChance && !skipped) return <ModalPanel title="Jangan Menyerah!">
    <p className="mb-1 mt-2 text-sm font-bold text-amber-200">Kesempatan Kedua</p>
    <p className="mb-4 text-sm text-white/70">Jawab 1 soal bonus ini untuk bangkit kembali.</p>
    <p className="mb-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-sm font-bold text-amber-100">{secondChance.question ?? "Apa ucapan pembuka yang baik sebelum belajar?"}</p>
    <div className="grid gap-2">{options.map((option, index) => <button key={option} type="button" disabled={selected !== null} onClick={() => {
      setSelected(index);
      soundManager.playSfx(index === correctIndex ? "correct" : "wrong");
      if (index === correctIndex) secondChance.onSuccess();
      else window.setTimeout(() => setSelected(null), 450);
    }} className={`game-button w-full border ${selected === index ? index === correctIndex ? "border-emerald-300 bg-emerald-500" : "border-amber-300 bg-amber-500/30" : "border-white/15 bg-white/5"}`}>{option}</button>)}</div>
    <button type="button" onClick={() => setSkipped(true)} className="mt-3 text-xs font-bold text-white/50 underline">Lewati dulu</button>
  </ModalPanel>;
  return <ModalPanel title={title}>
    <motion.p data-testid="xp-gained" role="status" initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-3 rounded-2xl bg-amber-400/15 p-3 text-xl font-black text-amber-200">+{xpGained} XP</motion.p>
    {description && <p className="mt-2 text-sm text-white/75">{description}</p>}
    {isNewRecord && <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-black text-yellow-300"><img src={NGAJI_CERIA_ASSETS.konfeti} alt="" aria-hidden="true" draggable={false} className="h-4 w-4 object-contain" />REKOR BARU<img src={NGAJI_CERIA_ASSETS.konfeti} alt="" aria-hidden="true" draggable={false} className="h-4 w-4 object-contain" /></p>}
    {children}
    <div className="my-6 grid grid-cols-2 divide-x divide-white/15">
      <div><p className="text-xs text-white/60">Skor kamu</p><p data-testid="game-over-score" className={`font-display text-3xl font-black ${ACCENTS[accent].text}`}>{score}</p></div>
      <div><p className="text-xs text-white/60">Terbaik</p><p data-testid="game-over-best" className="flex items-center justify-center gap-1 font-display text-3xl font-black text-yellow-300"><Star size={17} />{best}</p></div>
    </div>
    <button onClick={onRetry} className={`game-button w-full ${ACCENTS[accent].button}`}><Play size={15} />Main Lagi</button>
    <button onClick={onExit} className="game-button mt-2 w-full border border-white/20 bg-white/5">Keluar</button>
  </ModalPanel>;
}
