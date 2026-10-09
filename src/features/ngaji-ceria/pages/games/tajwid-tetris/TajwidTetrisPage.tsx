import { useEffect } from "react";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameOverModal } from "../_shared/GameOverModal";
import { GameShell } from "../_shared/GameShell";
import { HUD } from "../_shared/HUD";
import { StartScreen } from "../_shared/StartScreen";
import { useTajwidTetris, TETRIS_HEIGHT, TETRIS_WIDTH, type ActiveTetromino, type TetrisCell } from "./hooks/useTajwidTetris";
import { LeaderboardPanel } from "../_shared/LeaderboardPanel";
import { ProgressPanel } from "../_shared/ProgressPanel";
import { useGameExit } from "../_shared/hooks";

function Board({ board, piece }: { board: (TetrisCell | null)[][]; piece: ActiveTetromino | null }) {
  const cells = board.map((row) => [...row]);
  const active = new Set<string>();
  if (piece) {
    piece.shape.forEach((row, rowIndex) => row.forEach((filled, columnIndex) => {
      const y = piece.y + rowIndex;
      const x = piece.x + columnIndex;
      if (filled && y >= 0 && y < TETRIS_HEIGHT && x >= 0 && x < TETRIS_WIDTH) { cells[y][x] = { label: piece.label, color: piece.color }; active.add(`${y}:${x}`); }
    }));
  }
  return <div aria-label="Papan Tajwid Tetris" role="grid" className="mx-auto grid w-full max-w-[360px] overflow-hidden rounded-2xl border border-cyan-300/25 bg-slate-950 p-1" style={{ gridTemplateColumns: `repeat(${TETRIS_WIDTH}, minmax(0, 1fr))` }}>{cells.flatMap((row, rowIndex) => row.map((cell, columnIndex) => <div role="gridcell" key={`${rowIndex}:${columnIndex}`} className={`flex aspect-square min-w-0 items-center justify-center border border-white/[0.035] p-0.5 text-center text-[8px] font-black leading-none sm:text-[10px] ${active.has(`${rowIndex}:${columnIndex}`) ? "tetris-active" : ""}`} style={cell ? { backgroundColor: `${cell.color}cc`, color: "#07111f", boxShadow: `inset 0 0 0 1px ${cell.color}` } : undefined}>{cell?.label}</div>))}</div>;
}

function Game() {
  const game = useTajwidTetris();
  const exit = useGameExit();
  const { phase, move, rotate, drop } = game;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (phase !== "playing") return;
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowUp") { event.preventDefault(); rotate(); }
      if (event.key === "ArrowDown") { event.preventDefault(); drop(false); }
      if (event.key === " ") { event.preventDefault(); drop(true); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drop, move, phase, rotate]);

  return <GameShell title="Tajwid Tetris" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan">
    {game.phase === "idle" ? <StartScreen title="Tajwid Tetris" tagline="Susun blok, pahami hukum" description="Jatuhkan blok hukum tajwid, bersihkan baris, dan baca ringkasan hukum setiap kali blok terkunci. Gunakan tombol atau keyboard untuk bermain." coverImage={NGAJI_CERIA_ASSETS.tajwidTetris} best={game.best} onStart={game.start} accent="cyan" /> : <div className="space-y-3">
      <HUD score={game.score} progressLabel={`Level ${game.level} · ${game.lines} baris`} accent="cyan" />
      <Board board={game.board} piece={game.piece} />
      <div className="rounded-2xl border border-cyan-300/20 bg-white/5 px-3 py-2 text-center"><p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Pelajaran blok aktif</p><p aria-live="polite" className="mt-1 text-xs leading-relaxed text-white/80">{game.feedback}</p></div>
      <div className="grid grid-cols-4 gap-2"><button type="button" aria-label="Geser kiri" onClick={() => game.move(-1)} className="game-button bg-cyan-600">←</button><button type="button" aria-label="Putar blok" onClick={game.rotate} className="game-button bg-violet-600">↻</button><button type="button" aria-label="Geser kanan" onClick={() => game.move(1)} className="game-button bg-cyan-600">→</button><button type="button" aria-label="Jatuhkan blok" onClick={() => game.drop(true)} className="game-button bg-pink-600">↓</button></div>
      <p className="text-center text-[11px] text-white/55">Keyboard: ← → untuk geser · ↑ untuk putar · ↓ untuk turun · Spasi untuk jatuhkan</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={false} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" title="Papan Selesai" description={`${game.lines} baris tajwid berhasil dibersihkan.`} onRetry={game.start} onExit={exit}><div className="space-y-3"><ProgressPanel progress={game.progress} /><LeaderboardPanel entries={game.leaderboard} /></div></GameOverModal>
  </GameShell>;
}

export default function TajwidTetrisPage() { return <GameBoundary><Game /></GameBoundary>; }
