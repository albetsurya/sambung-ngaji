import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { Balloon } from "./components/Balloon";
import { TargetBanner } from "./components/TargetBanner";
import { useBalloonGame } from "./hooks/useBalloonGame";
import { letterRecitation } from "../_shared/recitation";

function Game() {
  const game = useBalloonGame();
  const navigate = useNavigate();
  return <GameShell title="Hijaiyah Pop!" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan" tutorialGameId="hijaiyah-pop" recitation={letterRecitation(game.target)}>
    {game.phase === "idle" ? <StartScreen title="Hijaiyah Pop!" tagline="Fokus target, pecahkan rekor" description="Tap balon dengan huruf yang diminta. Tiga nyawa, 60 detik. Target berganti tiap lima detik atau tiga balon benar. Dua target terlewat bikin kombo putus." coverImage={NGAJI_CERIA_ASSETS.hijaiyahPop} best={game.best} onStart={game.start} accent="cyan" /> : <div className="space-y-2">
      <HUD score={game.score} lives={game.lives} timeLeft={game.timeLeft} accent="cyan" />
      <TimerBar progress={game.timeLeft / 60} secondsLeft={game.timeLeft} accent="cyan" />
      <TargetBanner target={game.target} name={game.targetName} />
      <div ref={game.fieldRef} aria-label="Arena balon" className={`relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-cyan-950/20 to-slate-950 ${game.shakeLeft > 0 ? "game-shake" : ""}`} style={{ height: "clamp(240px, calc(100dvh - 310px), 570px)" }}>
        <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(#22d3ee 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {game.balloons.map((balloon) => <Balloon key={balloon.id} balloon={balloon} disabled={game.phase !== "playing"} onPop={() => game.pop(balloon.id)} />)}
      </div>
      <ComboBadge combo={game.combo} multiplier={Math.min(1 + game.combo * 0.1, 5)} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.maxCombo} victory={game.lives > 0} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" description={`${game.lives <= 0 ? "Nyawa habis" : "Waktu habis"} · kombo tertinggi ${game.maxCombo}`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function HijaiyahPopPage() { return <GameBoundary><Game /></GameBoundary>; }
