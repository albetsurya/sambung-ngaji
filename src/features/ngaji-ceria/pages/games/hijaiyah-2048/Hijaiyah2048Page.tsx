import { useRef } from "react";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TileBoard } from "./components/TileBoard";
import { useHijaiyah2048, type Direction } from "./hooks/useHijaiyah2048";
import { useGameExit } from "../_shared/hooks";
import { letterRecitation } from "../_shared/recitation";

function Game() {
  const game = useHijaiyah2048();
  const exit = useGameExit();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipe = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const dx = event.clientX - touchStart.current.x;
    const dy = event.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    const direction: Direction = Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up";
    game.move(direction);
  };
  return <GameShell title="Hijaiyah 2048" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan" recitation={letterRecitation(game.letters[game.highest]?.arabic)}>
    {game.phase === "idle" ? <StartScreen title="Hijaiyah 2048" tagline="Gabungkan huruf, buka level" description="Geser papan seperti 2048. Dua huruf pada level yang sama bergabung menjadi huruf berikutnya. Gunakan tombol arah, keyboard, atau swipe." coverImage={NGAJI_CERIA_ASSETS.hijaiyah2048} best={game.best} onStart={game.start} accent="cyan" /> : <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={`Gerakan ${game.moves}`} accent="cyan" />
      <div className="flex items-center justify-between rounded-2xl border border-cyan-300/20 bg-white/5 px-3 py-2 text-xs"><span className="text-white/70">Huruf tertinggi</span>{game.letters[game.highest]?.arabic ? <span dir="rtl" className="game-arabic text-2xl font-bold text-cyan-200">{game.letters[game.highest]?.arabic}</span> : <img src={NGAJI_CERIA_ASSETS.bintang} alt="Level max" draggable={false} className="h-7 w-7 object-contain" />}</div>
      <div
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          touchStart.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={swipe}
        onPointerCancel={() => { touchStart.current = null; }}
        className="touch-none select-none flex-1 flex flex-col justify-center"
      >
        <TileBoard grid={game.grid} moveId={game.moveId} mergedIds={game.mergedIds} spawnedId={game.spawnedId} ghosts={game.ghosts} />
      </div>
      <p className="text-center text-[11px] text-white/55">Tekan lalu geser papan ke kiri, kanan, atas, atau bawah.</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={false} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" title="Papan Berhenti" description={`Gerakan ${game.moves} · huruf tertinggi ${game.letters[game.highest]?.name ?? "bonus"}`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function Hijaiyah2048Page() { return <GameBoundary><Game /></GameBoundary>; }
