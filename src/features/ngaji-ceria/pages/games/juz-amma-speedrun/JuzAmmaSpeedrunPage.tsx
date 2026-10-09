import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { QuestionCard } from "./components/QuestionCard";
import { useQuizGame } from "./hooks/useQuizGame";
import { TimeAttackTrack } from "../_shared/variant/TimeAttackTrack";
import { useGameExit } from "../_shared/hooks";
import { verseRecitation } from "../_shared/recitation";

function Game() {
  const game = useQuizGame();
  const exit = useGameExit();
  return <GameShell title="Juz Amma Speedrun" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="pink" recitation={verseRecitation(game.currentQuestion)}>
    {game.phase === "idle" ? <StartScreen title="Juz Amma Speedrun" tagline="Cepat, tepat, naikkan kombo" description="Sepuluh soal Juz Amma: lanjutan ayat, nama surah, dan arti. Lima detik per soal, tiga nyawa. Jawab di bawah dua detik untuk bonus!" coverImage={NGAJI_CERIA_ASSETS.juzAmmaSpeedrun} best={game.best} onStart={game.start} /> : game.currentQuestion && <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} lives={game.lives} progressLabel={`Soal ${game.currentIndex + 1}/10`} timeLeft={game.timeLeft} />
      <TimerBar progress={game.timeLeft / 5} secondsLeft={game.timeLeft} />
      <TimeAttackTrack current={game.currentIndex} total={10} label="Rute Time Attack Juz Amma" />
      <ComboBadge combo={game.combo} multiplier={game.comboMultiplier} />
      <QuestionCard question={game.currentQuestion} selectedIndex={game.selectedIndex} answerState={game.answerState} onSelect={game.answer} />
      <p aria-live="polite" className="min-h-5 text-center text-xs font-bold text-white/80">{game.answerState === "correct" ? game.perfect ? "Tepat & cepat! Bonus +50." : "Tepat! Kombo naik." : game.answerState === "wrong" ? "Belum tepat. Jawaban benar ditandai hijau." : game.answerState === "timeout" ? "Waktu habis. Lihat jawaban yang hijau." : ""}</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.maxCombo} victory={game.lives > 0} best={game.best} isNewRecord={game.isNewRecord} onRetry={game.start} onExit={exit} description={`Kombo tertinggi: ${game.maxCombo} · ${game.currentIndex + 1} soal dimainkan`} />
  </GameShell>;
}
export default function JuzAmmaSpeedrunPage() { return <GameBoundary><Game /></GameBoundary>; }
