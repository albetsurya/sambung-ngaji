import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { QuestionCard } from "../juz-amma-speedrun/components/QuestionCard";
import { RoyalePanel } from "./components/RoyalePanel";
import { useQuizRoyale } from "./hooks/useQuizRoyale";
import { RoyaleStage } from "../_shared/variant/RoyaleStage";
import { PodiumSaf } from "../_shared/variant/PodiumSaf";
import { useGameExit } from "../_shared/hooks";
import { verseRecitation } from "../_shared/recitation";

function Game() {
  const game = useQuizRoyale();
  const exit = useGameExit();
  const resultTitle = game.eliminated ? "Kamu Tereliminasi" : game.phase === "gameover" && game.rank === 1 ? "Juara Royale!" : "Ronde Selesai";
  return <GameShell title="Quran Quiz Royale" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="pink" recitation={verseRecitation(game.currentQuestion)}>
    {game.phase === "idle" ? <StartScreen title="Quran Quiz Royale" tagline="Duduk di saf, naik podium" description="Bertahan dalam sepuluh soal Juz Amma. Yang salah keluar saf, yang konsisten naik podium masjid." coverImage={NGAJI_CERIA_ASSETS.quranQuizRoyale} best={game.best} onStart={game.start} accent="pink" /> : game.currentQuestion && <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={`Ronde ${game.currentIndex + 1}/10`} timeLeft={game.timeLeft} accent="pink" />
      <TimerBar progress={game.timeLeft / 8} secondsLeft={game.timeLeft} accent="pink" />
      <PodiumSaf players={game.players} round={Math.floor(game.currentIndex / 3) + 1} /><RoyaleStage players={game.players} round={Math.floor(game.currentIndex / 3) + 1} />
      <RoyalePanel players={game.players} />
      <QuestionCard question={game.currentQuestion} selectedIndex={game.selectedIndex} answerState={game.answerState === "timeout" ? "timeout" : game.answerState} onSelect={game.answer} />
      <p aria-live="polite" className="min-h-5 text-center text-xs font-bold text-white/80">{game.answerState === "correct" ? "Tepat! Kamu bertahan di ronde ini." : game.answerState === "wrong" ? "Jawaban salah. Kamu tereliminasi." : game.answerState === "timeout" ? "Waktu habis. Kamu tereliminasi." : "Satu kesalahan dan ronde berakhir untukmu."}</p>
      <ComboBadge combo={Math.min(game.currentIndex + 1, 10)} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={!game.eliminated} title={resultTitle} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="pink" description={`Peringkat ${game.rank} dari 8 pemain · ${game.alivePlayers} pemain tersisa`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function QuranQuizRoyalePage() { return <GameBoundary><Game /></GameBoundary>; }
