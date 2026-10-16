import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { useRhythmGame } from "../_shared/hooks/useRhythmGame";
import { useGameExit } from "../_shared/hooks";
import { letterRecitation } from "../_shared/recitation";

const letters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر"];
function Game() {
  const game = useRhythmGame({ gameId: "makhraj-master", lanes: 4, duration: 90, letters });
  const exit = useGameExit();
  return <GameShell title="Makhraj Master" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan" recitation={letterRecitation(game.recitationNote?.letter)} recitationKey={game.recitationNote?.id}>
    {game.phase === "idle" ? <StartScreen title="Makhraj Master" tagline="Dengar makhraj, tap tepat waktu" description="Huruf jatuh di empat lane. Tap saat menyentuh garis bawah untuk Perfect atau Good. Latency bisa dikalibrasi sebelum mulai." coverImage={NGAJI_CERIA_ASSETS.hijaiyahRush} best={game.best} onStart={game.start} accent="cyan"><label className="flex items-center gap-2 text-xs text-white/70">Latency <input type="range" min={-100} max={100} step={10} value={game.latency} onChange={(event) => game.setLatency(Number(event.target.value))} /><span>{game.latency}ms</span></label></StartScreen> : <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={`${Math.floor(game.elapsed)}/90 detik`} accent="cyan" />
      <TimerBar progress={1 - game.elapsed / 90} secondsLeft={90 - game.elapsed} accent="cyan" />
      <div className="relative grid flex-1 min-h-[300px] grid-cols-4 gap-1 overflow-hidden rounded-3xl border border-cyan-300/25 bg-slate-950">{game.notes.map((note) => <div key={note.id} className="game-arabic absolute flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-2xl text-slate-950" style={{ left: `calc(${(note.lane + 0.5) * 25}% - 24px)`, top: `${note.y}%` }}>{note.letter}</div>)}<div className="absolute bottom-[18%] left-0 right-0 h-1 bg-white" /></div>
      <div className="grid grid-cols-4 gap-2 shrink-0">{[0, 1, 2, 3].map((lane) => <button type="button" key={lane} onClick={() => game.hitLane(lane)} className="game-button bg-cyan-500">{lane + 1}</button>)}</div>
      <ComboBadge combo={game.combo} multiplier={Math.min(1 + game.combo * 0.05, 4)} />
      <p aria-live="polite" className="text-center text-xs text-white/75 shrink-0">{game.judgement === "perfect" ? "Perfect!" : game.judgement === "good" ? "Good!" : game.judgement === "miss" ? "Miss" : "Tap angka jalur saat huruf tiba di garis."}</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.maxCombo} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" description={`Kombo tertinggi: ${game.maxCombo}`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function MakhrajMasterPage() { return <GameBoundary><Game /></GameBoundary>; }
