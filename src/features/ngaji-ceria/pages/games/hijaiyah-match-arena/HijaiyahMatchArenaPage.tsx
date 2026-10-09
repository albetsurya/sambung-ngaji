import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { Board } from "./components/Board";
import { ModeSelector } from "./components/ModeSelector";
import { ScorePanel } from "./components/ScorePanel";
import { useMatchGame } from "./hooks/useMatchGame";
import { TacticalBoard } from "../_shared/variant/TacticalBoard";
import { MemoryGarden } from "../_shared/variant/MemoryGarden";
import { letterRecitation } from "../_shared/recitation";

function Game() {
  const game = useMatchGame();
  const navigate = useNavigate();
  const flippedCard = game.cards.find((card) => card.id === game.flippedIds[game.flippedIds.length - 1]);
  const arabicCard = game.cards.find((card) => card.pairId === flippedCard?.pairId && card.type === "arabic");
  const won = game.mode === "solo" ? game.playerPairs === 8 : game.playerPairs > game.aiPairs;
  return <GameShell title="Hijaiyah Match Arena" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="violet" recitation={letterRecitation(arabicCard?.content)} recitationKey={flippedCard?.id}>
    {game.phase === "idle" ? <StartScreen title="Hijaiyah Match Arena" tagline="Taman memori hijaiyah" description="Buka kartu huruf Arab dan nama Latinnya di petak kebun. Mekarkan delapan pasang dalam 90 detik, sendiri atau berkebun bersama AI." coverImage={NGAJI_CERIA_ASSETS.hijaiyahMatchArena} best={game.best} onStart={game.start} accent="violet"><ModeSelector mode={game.mode} difficulty={game.difficulty} onMode={game.setMode} onDifficulty={game.setDifficulty} /></StartScreen> : <div className="space-y-3">
      <HUD score={game.score} progressLabel={`${game.playerPairs + game.aiPairs}/8 pasang`} timeLeft={game.timeLeft} accent="violet" />
      <TimerBar progress={game.timeLeft / 90} secondsLeft={game.timeLeft} accent="violet" />
      <MemoryGarden playerPairs={game.playerPairs} aiPairs={game.aiPairs} turn={game.currentTurn} mode={game.mode} />{game.mode === "battle" && <ScorePanel playerScore={game.score} aiScore={game.aiScore} playerPairs={game.playerPairs} aiPairs={game.aiPairs} turn={game.currentTurn} />}
      <TacticalBoard playerPairs={game.playerPairs} aiPairs={game.aiPairs} turn={game.currentTurn} />
      <Board cards={game.cards} disabled={game.phase !== "playing" || game.currentTurn === "ai" || game.flippedIds.length >= 2} onFlip={game.flipPlayer} />
      <p aria-live="polite" className="text-center text-xs text-white/80">{game.message}</p>
      <ComboBadge combo={game.streak} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={won} maxCombo={game.maxCombo} title={game.resultTitle} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="violet" description={game.mode === "battle" ? `Pasangan kamu ${game.playerPairs} — AI ${game.aiPairs}. Skor AI: ${game.aiScore}.` : `${game.playerPairs}/8 pasangan ditemukan.`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games")} />
  </GameShell>;
}
export default function HijaiyahMatchArenaPage() { return <GameBoundary><Game /></GameBoundary>; }
