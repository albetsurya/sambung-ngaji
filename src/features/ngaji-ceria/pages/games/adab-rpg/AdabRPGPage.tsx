import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { SceneView } from "./components/SceneView";
import { AdventureMap } from "./components/AdventureMap";
import { useAdabRPG } from "./hooks/useAdabRPG";

function Game() {
  const game = useAdabRPG();
  const navigate = useNavigate();
  return <GameShell title="Jejak Santri" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="violet">
    {game.phase === "idle" ? <StartScreen title="Jejak Santri" tagline="Petualangan kecil, adab besar" description="Jelajahi lokasi pesantren, selesaikan quest, dan ambil keputusan yang mengubah Akhlak, Ilmu, dan Sosial. Temukan satu dari empat ending." coverImage={NGAJI_CERIA_ASSETS.hijaiyahMatchArena} best={game.best} onStart={game.start} accent="violet" /> : <div className="space-y-3"><HUD score={game.score} progressLabel={`${game.choices}/9 quest`} accent="violet" /><AdventureMap progress={game.choices} /><SceneView node={game.node} stats={game.stats} disabled={game.phase !== "playing"} onChoice={game.choose} /></div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.ending !== "buruk"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="violet" title={game.endingData?.title ?? "Cerita Selesai"} description={game.endingData?.text} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function AdabRPGPage() { return <GameBoundary><Game /></GameBoundary>; }
