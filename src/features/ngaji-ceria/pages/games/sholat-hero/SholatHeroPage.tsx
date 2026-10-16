import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { ComboBadge } from "../_shared/ComboBadge";
import { ScheduleRow } from "./components/ScheduleRow";
import { formatGameTime } from "./data/prayers";
import { useSholatHero } from "./hooks/useSholatHero";
import { ScheduleTimeline } from "../_shared/variant/ScheduleTimeline";

function Game() {
  const game = useSholatHero();
  const navigate = useNavigate();
  return <GameShell title="Sholat Hero" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="emerald">
    {game.phase === "idle" ? <StartScreen title="Sholat Hero" tagline="Atur hari, jaga lima waktu" description="Satu detik nyata berlalu sebagai sepuluh menit dalam permainan. Kerjakan lima sholat di jendela waktunya untuk mengumpulkan skor dan combo." coverImage={NGAJI_CERIA_ASSETS.wudhuFlow} best={game.best} onStart={game.start} accent="emerald" /> : <div className="space-y-3">
      <HUD score={game.score} progressLabel="Hari berjalan" accent="emerald" />
      <ScheduleTimeline current={Object.values(game.statuses).filter((status) => status !== "pending").length} total={5} />
      <div className="rounded-3xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-center"><p className="text-[10px] uppercase tracking-widest text-emerald-200/70">Waktu permainan</p><p className="font-display text-4xl font-black text-white">{formatGameTime(game.gameMinutes)}</p><p className="mt-1 text-xs text-emerald-200">{game.message}</p></div>
      <div className="space-y-2">{game.prayers.map((prayer) => <ScheduleRow key={prayer.id} prayer={prayer} status={game.statuses[prayer.id]} gameMinutes={game.gameMinutes} onPray={() => game.pray(prayer.id)} />)}</div>
      <ComboBadge combo={game.combo} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.maxCombo} best={game.best} isNewRecord={game.isNewRecord} accent="emerald" title="Hari Selesai" description={`Combo tertinggi ${game.maxCombo} · lima waktu sudah dievaluasi`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function SholatHeroPage() { return <GameBoundary><Game /></GameBoundary>; }
