import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { ComboBadge } from "../_shared/ComboBadge";
import { RunnerField } from "./components/RunnerField";
import { useHijaiyahRush } from "./hooks/useHijaiyahRush";
import { letterRecitation } from "../_shared/recitation";

function Game() {
  const game = useHijaiyahRush();
  const navigate = useNavigate();
  return <GameShell title="Hijaiyah Rush" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan" recitation={letterRecitation(game.target)}>
    {game.phase === "idle" ? <StartScreen title="Hijaiyah Rush" tagline="Lari, lompat, tangkap target" description="Qirra berlari otomatis di tiga jalur. Pindah jalur dan lompat untuk mengambil huruf yang diminta. Kecepatan naik setiap 30 meter, kombo memperbesar skor." coverImage={NGAJI_CERIA_ASSETS.hijaiyahRush} best={game.best} onStart={game.start} accent="cyan" /> : <div className="space-y-3">
      <HUD score={game.score} lives={game.lives} progressLabel={`${Math.floor(game.distance)} m`} accent="cyan" />
      <div className="flex items-center justify-between rounded-2xl border border-cyan-300/25 bg-cyan-500/10 px-4 py-2"><span className="text-xs text-white/80">Tangkap huruf target</span><span dir="rtl" className="game-arabic text-3xl text-cyan-200">{game.target}</span><span className="text-xs font-bold text-cyan-300">{game.targetName}</span></div>
      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-2 text-[10px] font-black uppercase tracking-widest text-cyan-200">Platformer Stage · {Math.floor(game.distance)}m · checkpoint {Math.floor(game.distance / 30) + 1}</div>
      <RunnerField items={game.items} lane={game.lane} jumpTime={game.jumpTime} shake={game.shakeLeft > 0} onLane={game.moveLane} onJump={game.jump} />
      <div className="flex gap-2">{[0, 1, 2].map((lane) => <button type="button" key={lane} aria-pressed={game.lane === lane} onClick={() => game.moveLane(lane)} className={`game-button flex-1 border ${game.lane === lane ? "border-cyan-300 bg-cyan-500/20" : "border-white/20 bg-white/5"}`}>{["Kiri", "Tengah", "Kanan"][lane]}</button>)}</div>
      <ComboBadge combo={game.combo} multiplier={Math.min(1 + game.combo * 0.12, 5)} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={false} score={game.score} maxCombo={game.maxCombo} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" description={`Jarak ${Math.floor(game.distance)} meter · kombo tertinggi ${game.maxCombo}`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function HijaiyahRushPage() { return <GameBoundary><Game /></GameBoundary>; }
