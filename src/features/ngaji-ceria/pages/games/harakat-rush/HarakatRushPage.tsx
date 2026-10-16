import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { ComboBadge } from "../_shared/ComboBadge";
import { useGameExit } from "../_shared/hooks";
import { HUD } from "./components/HUD";
import { usePhaserBridge } from "./hooks/usePhaserBridge";
import { letterRecitation } from "../_shared/recitation";
import { HARAKAT_LIST } from "./data/harakat-list";

function Game() {
  const game = usePhaserBridge();
  const exit = useGameExit();
  if (game.failed) throw new Error("Arena Harakat Rush tidak tersedia");
  return <GameShell title="Harakat Rush" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan" tutorialGameId="harakat-rush" recitation={letterRecitation(HARAKAT_LIST.find((item) => item.id === game.target)?.symbol)}>
    {game.phase === "idle" && <StartScreen title="Harakat Rush" tagline="Pindah jalur, tangkap target" description="Tap jalur, geser, atau pakai panah kiri/kanan untuk menggerakkan Qirra. Ambil harakat target, hindari yang salah. Ada magnet, gerak lambat, dan perisai tiap 2.000 skor." coverImage={NGAJI_CERIA_ASSETS.harakatRush} best={game.best} onStart={game.start} accent="cyan" />}
    <div className={game.phase === "idle" ? "hidden" : "flex flex-col flex-1 gap-2 min-h-0 justify-between"}>
      <HUD game={game} />
      <div ref={game.hostRef} role="application" aria-label="Arena Qirra tiga jalur. Gunakan panah kiri dan kanan atau tombol jalur." className="relative flex-1 min-h-[360px] overflow-hidden rounded-3xl border border-cyan-400/30" style={{ height: "calc(100dvh - 220px)", touchAction: "none" }} />
      {!game.ready && game.phase !== "idle" && <p className="text-center text-xs text-white/70">Menyiapkan arena…</p>}
      <div className="flex gap-2">{[0, 1, 2].map((lane) => <button key={lane} onClick={() => game.moveLane(lane)} disabled={game.phase !== "playing" || !game.ready} aria-pressed={game.lane === lane} className={`min-h-11 flex-1 rounded-xl border text-xs font-bold ${game.lane === lane ? "border-cyan-300 bg-cyan-500/20" : "border-white/20 bg-white/5"}`}>{["Kiri", "Tengah", "Kanan"][lane]}</button>)}</div>
      <ComboBadge combo={game.combo} multiplier={Math.min(1 + game.combo * 0.1, 6)} />
    </div>
    <GameOverModal visible={game.phase === "gameover"} victory={false} score={game.score} maxCombo={game.maxCombo} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" description={`Qirra menempuh ${Math.floor(game.distance)} meter. Coba lagi untuk melewati rekor!`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function HarakatRushPage() { return <GameBoundary><Game /></GameBoundary>; }
