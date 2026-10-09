import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { ComboBadge } from "../_shared/ComboBadge";
import { BeatIndicator } from "./components/BeatIndicator";
import { NodeChip } from "./components/NodeChip";
import { useWudhuFlow } from "./hooks/useWudhuFlow";
import { WaterPipeBoard } from "./components/WaterPipeBoard";

function Game() {
  const game = useWudhuFlow();
  const navigate = useNavigate();
  return <GameShell title="Wudhu Flow" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="emerald" tutorialGameId="wudhu-flow">
    {game.phase === "idle" ? <StartScreen title="Wudhu Flow" tagline="Sambung pipa, jaga urutan" description="Putar pipa untuk mengalirkan air melalui sepuluh langkah wudhu. Pilih santai, air terbatas, atau mode ritme." coverImage={NGAJI_CERIA_ASSETS.wudhuFlow} best={game.best} onStart={game.start} accent="emerald"><div className="flex flex-wrap justify-center gap-2">{(["pipes", "challenge", "rhythm"] as const).map((mode, i) => <button key={mode} onClick={() => game.setMode(mode)} aria-pressed={game.mode === mode} className="game-button border border-cyan-300/30 bg-cyan-500/20">{["Pipa Santai", "Air Terbatas", "Ritme"][i]}</button>)}</div></StartScreen> : <div className="space-y-3">
      <HUD score={game.score} progressLabel={`${game.completed}/10 langkah`} accent="emerald" />
      {game.mode === "rhythm" ? <><BeatIndicator progress={game.beatProgress} bpm={game.bpm} beat={game.beatCount} /><div className="grid grid-cols-2 gap-2">{game.steps.map((step, index) => <NodeChip key={step.id} step={step} index={index} active={index === game.currentIndex} completed={index < game.completed} disabled={game.phase !== "playing"} onTap={() => game.tapStep(index)} />)}</div></> : <>
        <p className="text-xs text-cyan-100">Sumber → pipa 1 · tujuan setelah pipa 10 {game.mode === "challenge" && `· ${game.water} percobaan air`}</p>
        <WaterPipeBoard steps={game.steps} rotations={game.rotations} wet={game.completed} disabled={game.phase !== "playing"} onRotate={game.rotatePipe} />
        <button disabled={game.phase !== "playing"} onClick={game.openWater} className="game-button w-full bg-cyan-600">Alirkan Air</button>
        <p className="text-xs text-white/70">{game.steps[Math.min(game.completed, 9)].instruction}</p>
      </>}
      <ComboBadge combo={game.combo} />
      <p aria-live="polite" className={`min-h-5 text-center text-xs font-bold ${game.judgement === "wrong" ? "text-red-300" : "text-emerald-200"}`}>{game.message}</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.maxCombo} victory={game.completed === 10} best={game.best} isNewRecord={game.isNewRecord} accent="emerald" title={game.completed === 10 ? "Wudhu Selesai" : "Air Habis"} description={`${game.completed}/10 langkah · ${game.mode === "rhythm" ? `kombo ${game.maxCombo}` : `${game.turns} putaran pipa`}`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function WudhuFlowPage() { return <GameBoundary><Game /></GameBoundary>; }
