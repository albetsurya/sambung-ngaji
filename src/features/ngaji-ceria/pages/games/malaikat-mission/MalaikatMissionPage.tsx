import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { ComboBadge } from "../_shared/ComboBadge";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameOverModal } from "../_shared/GameOverModal";
import { GameShell } from "../_shared/GameShell";
import { HUD } from "../_shared/HUD";
import { StartScreen } from "../_shared/StartScreen";
import { TimerBar } from "../_shared/TimerBar";
import { useMalaikatMission } from "./hooks/useMalaikatMission";
import { LeaderboardPanel } from "../_shared/LeaderboardPanel";
import { ProgressPanel } from "../_shared/ProgressPanel";
import { SkyCourierTrack } from "../_shared/variant/SkyCourierTrack";

function Game() {
  const game = useMalaikatMission();
  const navigate = useNavigate();
  const mission = game.mission;
  const courierStatus = game.status === "correct" ? `Paket terkirim! ${mission?.clue ?? ""}`
    : game.status === "wrong" ? `Paket nyasar. ${mission?.clue ?? ""}`
    : game.status === "timeout" ? `Kurir kehabisan waktu. ${mission?.clue ?? ""}` : null;
  return <GameShell title="Malaikat Mission" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="cyan">
    {game.phase === "idle" ? <StartScreen title="Malaikat Mission" tagline="Kurir pos langit" description="Jadilah kurir amanah: antar 9 paket ke tujuannya dengan memilih malaikat yang tepat. Sepuluh detik per paket, combo untuk antar cepat." coverImage={NGAJI_CERIA_ASSETS.malaikatMission} best={game.best} onStart={game.start} accent="cyan" /> : mission && <div className="space-y-3">
      <HUD score={game.score} progressLabel={`Paket ${game.index + 1}/${game.missions.length}`} timeLeft={game.timeLeft} accent="cyan" />
      <TimerBar progress={game.timeLeft / 10} secondsLeft={game.timeLeft} accent="cyan" />
      <SkyCourierTrack playerHp={game.playerHp} lightHp={game.monsterHp} lightMax={100} courierName={mission.monster} index={game.index} total={game.missions.length} status={courierStatus} />
      <div className="rounded-3xl border border-cyan-300/25 bg-slate-950/60 p-4 text-center"><p className="text-xs font-black uppercase tracking-widest text-cyan-300">Mission Brief · Tujuan: {mission.monster}</p><p className="mt-2 text-sm font-black text-white">{mission.prompt}</p><p className="mt-2 text-xs text-white/60">Fokus pada tugas: {mission.task}</p></div>
      <div className="grid gap-2">{mission.options.map((option, index) => <button type="button" key={option} data-option-index={index} data-option-correct={index === mission.correctIndex} disabled={game.status !== "idle"} onClick={() => game.answer(index)} className={`rounded-2xl border p-3 text-left text-sm font-black transition active:scale-[.98] ${game.selected === index ? game.status === "correct" ? "quiz-option-correct border-emerald-300 bg-emerald-500/20" : "game-shake border-red-300 bg-red-500/20" : "border-white/15 bg-white/5"}`}>{option}</button>)}</div>
      <p aria-live="polite" className="text-center text-xs leading-relaxed text-white/75">{game.status === "correct" ? `Benar. ${mission.clue}` : game.status === "wrong" ? `Belum tepat. ${mission.clue}` : game.status === "timeout" ? `Waktu habis. ${mission.clue}` : "Pilih jawaban yang paling tepat."}</p><ComboBadge combo={game.combo} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.outcome === "victory"} title={game.outcome === "victory" ? "Victory!" : "Defeat"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="cyan" description={game.outcome === "victory" ? "Semua 9 paket pos langit terkirim." : "Sayap kurir lelah. Latih kembali tugas malaikat."} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games/quiz-ngaji")}><div className="space-y-3"><ProgressPanel progress={game.progress} /><LeaderboardPanel entries={game.leaderboard} /></div></GameOverModal>
  </GameShell>;
}

export default function MalaikatMissionPage() { return <GameBoundary><Game /></GameBoundary>; }
