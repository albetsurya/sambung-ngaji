import { useState } from "react";
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

const letters = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د"];
function Game() {
  const [mode, setMode] = useState<"normal" | "endless">("normal");
  const game = useRhythmGame({ gameId: "hijaiyah-beats", lanes: 3, duration: 90, endless: mode === "endless", letters });
  const exit = useGameExit();
  return <GameShell title="Hijaiyah Beats" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="pink" recitation={letterRecitation(game.recitationNote?.letter)} recitationKey={game.recitationNote?.id}>
    {game.phase === "idle" ? <StartScreen title="Hijaiyah Beats" tagline="Bentuk huruf, ikuti suara" description="Tap tiga lane mengikuti huruf dan ketukan. Mode normal berlangsung 90 detik; mode endless berhenti setelah tiga miss." coverImage={NGAJI_CERIA_ASSETS.hijaiyahPop} best={game.best} onStart={game.start} accent="pink"><div className="flex gap-2">{(["normal", "endless"] as const).map((value) => <button type="button" key={value} onClick={() => setMode(value)} aria-pressed={mode === value} className={`game-button flex-1 border ${mode === value ? "border-pink-300 bg-pink-500/25" : "border-white/20 bg-white/5"}`}>{value === "normal" ? "Normal" : "Endless"}</button>)}</div></StartScreen> : <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={game.endless ? `${game.misses}/3 miss` : `${Math.floor(game.elapsed)}/90 detik`} accent="pink" />
      <TimerBar progress={game.endless ? 1 : 1 - game.elapsed / 90} secondsLeft={90 - game.elapsed} accent="pink" />
      <div className="relative grid flex-1 min-h-[300px] grid-cols-3 gap-1 overflow-hidden rounded-3xl border border-pink-300/25 bg-slate-950">{game.notes.map((note) => <div key={note.id} className="game-arabic absolute flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-2xl text-slate-950" style={{ left: `calc(${(note.lane + 0.5) * 33.333}% - 24px)`, top: `${note.y}%` }}>{note.letter}</div>)}<div className="absolute bottom-[18%] left-0 right-0 h-1 bg-white" /></div>
      <div className="grid grid-cols-3 gap-2 shrink-0">{[0, 1, 2].map((lane) => <button type="button" key={lane} onClick={() => game.hitLane(lane)} className="game-button bg-pink-500">{lane + 1}</button>)}</div>
      <ComboBadge combo={game.combo} multiplier={Math.min(1 + game.combo * 0.05, 4)} />
      <p aria-live="polite" className="text-center text-xs text-white/75 shrink-0">{game.judgement === "perfect" ? "Perfect!" : game.judgement === "good" ? "Good!" : game.judgement === "miss" ? "Miss" : "Ikuti irama dan tap tombol lane."}</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={!game.endless} score={game.score} maxCombo={game.maxCombo} best={game.best} isNewRecord={game.isNewRecord} accent="pink" description={`Mode ${mode === "endless" ? "Endless" : "Normal"} · kombo ${game.maxCombo}`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function HijaiyahBeatsPage() { return <GameBoundary><Game /></GameBoundary>; }
