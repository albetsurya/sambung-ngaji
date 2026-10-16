import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { preloadBattleModels } from "../_shared/battle/BattleScene";
import { ComboBadge } from "../_shared/ComboBadge";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameOverModal } from "../_shared/GameOverModal";
import { GameShell } from "../_shared/GameShell";
import { HUD } from "../_shared/HUD";
import { StartScreen } from "../_shared/StartScreen";
import { TimerBar } from "../_shared/TimerBar";
import { Hunter3DScene } from "./components/Hunter3DScene";
import { LeaderboardPanel } from "../_shared/LeaderboardPanel";
import { ProgressPanel } from "../_shared/ProgressPanel";
import { HUNTER_ROUNDS, HUNTER_SECONDS } from "./data/hunter-missions";
import { useAyatHunter, type HunterDirection } from "./hooks/useAyatHunter";
import { verseRecitation } from "../_shared/recitation";

const KEY_DIRECTIONS: Record<string, HunterDirection> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
};

function Game() {
  const game = useAyatHunter();
  const navigate = useNavigate();
  const { phase, status, move, collect } = game;
  const mission = game.currentMission;
  const disabled = phase !== "playing" || status !== "hunting";

  useEffect(() => {
    if (phase !== "playing" || status !== "hunting") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      const direction = KEY_DIRECTIONS[event.key];
      if (direction) { event.preventDefault(); move(direction); }
      else if (event.code === "Space" && !(event.target instanceof HTMLElement && event.target.closest("button"))) {
        event.preventDefault(); collect();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, status, move, collect]);

  // Pemanasan cache HTTP selagi di layar mulai agar scene 3D langsung tampil.
  useEffect(() => {
    if (phase !== "idle") return;
    preloadBattleModels(
      "/models/ngaji-ceria/desert-roblox.glb",
      "/models/ngaji-ceria/props/nature-tree.glb",
      "/models/ngaji-ceria/props/nature-rock.glb",
    );
  }, [phase]);

  const endTitle = game.endReason === "complete" ? "Perburuan Selesai!" : "Pencarian Berakhir";  const endDescription = game.endReason === "complete"
    ? `Semua ${HUNTER_ROUNDS} ayat ditemukan · kombo tertinggi ${game.maxCombo}.`
    : `${game.endReason === "timeout" ? "Waktu habis" : "Nyawa habis"} · ${game.solved}/${HUNTER_ROUNDS} ayat ditemukan.`;

  return <GameShell title="Ayat Hunter" phase={phase} onPause={game.pause} onResume={game.resume} accent="emerald" fitViewport recitation={verseRecitation(mission)}>
    {phase === "idle" ? <StartScreen
      title="Ayat Hunter"
      tagline="Jelajah kebun 3D, temukan ayat"
      description="Bantu Qirra 3D mengumpulkan kata sesuai urutan ayat di kebun tiga dimensi. Ketuk petak di sebelah Qirra atau gunakan panah, lalu tekan Ambil kata. Lima misi, 60 detik per ayat, dan tiga nyawa."
      coverImage={NGAJI_CERIA_ASSETS.ayatHunter}
      best={game.best}
      onStart={game.start}
      accent="emerald"
    /> : mission && <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <HUD score={game.score} lives={game.lives} progressLabel={`Misi ${game.missionIndex + 1}/${HUNTER_ROUNDS}`} timeLeft={game.timeLeft} accent="emerald" />
      <TimerBar progress={game.timeLeft / HUNTER_SECONDS} secondsLeft={game.timeLeft} accent="emerald" />
       <div data-testid="hunter-scene" className="relative -mx-3 min-h-0 flex-1 border-y border-emerald-300/20 sm:-mx-4">
        <div className="absolute inset-0">
          <Hunter3DScene
            tokens={game.tokens}
            playerCell={game.playerCell}
            targetWord={status === "cleared" ? "" : mission.words[game.collected] ?? ""}
            collected={game.collected}
            disabled={disabled}
            active={phase === "playing"}
            onMove={game.moveTo}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-3 top-2 text-center">
          <div className="mx-auto max-w-xs rounded-2xl border border-amber-300/30 bg-black/55 px-3 py-2 backdrop-blur-sm">
            <p className="text-[11px] font-bold text-emerald-200">{mission.surahName} · ayat {mission.ayahNumber} · {status === "cleared" ? "ditemukan" : `${game.collected}/${mission.words.length} kata`}</p>
            <p data-testid="hunter-target" lang="ar" dir="rtl" className="game-arabic mt-0.5 text-3xl leading-relaxed text-amber-200">{status === "cleared" ? "✓" : mission.words[game.collected]}</p>
          </div>
        </div>
      </div>
      <div data-testid="hunter-controls" className="relative z-20 shrink-0 space-y-2 rounded-2xl border border-slate-950/40 bg-slate-950/80 p-2 backdrop-blur-md">
        {status === "hunting" ? <>
          <button type="button" disabled={disabled || !game.standingToken} onClick={collect} className="game-button min-h-14 w-full bg-amber-600 px-2 text-base">
            <span>Ambil kata</span>
            {game.standingToken && <span lang="ar" dir="rtl" className="game-arabic text-2xl leading-relaxed">{game.standingToken.text}</span>}
          </button>
          <div aria-label="Kata yang ditemukan" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-center">
            <p lang="ar" dir="rtl" className="game-arabic min-h-7 text-xl leading-relaxed text-white">{mission.words.slice(0, game.collected).join(" ") || "…"}</p>
          </div>
        </> : <div className="max-h-[24dvh] overflow-y-auto rounded-2xl border border-emerald-300/30 bg-emerald-800/30 p-3 text-center">
          <p className="text-sm leading-relaxed text-white/85">{mission.translation}</p>
          {phase === "playing" && <button type="button" onClick={game.nextMission} className="game-button mt-3 w-full bg-emerald-600">Misi Berikutnya</button>}
        </div>}
      </div>
      <div className="shrink-0">
        <p aria-live="polite" className="text-center text-xs leading-relaxed text-white/75">{game.feedback}</p>
        <ComboBadge combo={game.combo} />
      </div>
    </div>}
    <GameOverModal
      visible={phase === "gameover"} title={endTitle} description={endDescription}
      score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="emerald"
      maxCombo={game.maxCombo} victory={game.endReason === "complete"}
      onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games/puzzle-huruf")}
    >
      {mission && <div className="space-y-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-bold text-emerald-200">{mission.surahName} · ayat {mission.ayahNumber}</p>
        <p lang="ar" dir="rtl" className="game-arabic mt-2 text-xl leading-relaxed text-white">{mission.arabic}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/75">{mission.translation}</p>
      </div><ProgressPanel progress={game.progress} /><LeaderboardPanel entries={game.leaderboard} /></div>}
    </GameOverModal>
  </GameShell>;
}

export default function AyatHunterPage() { return <GameBoundary><Game /></GameBoundary>; }
