import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { QuestionCard } from "../juz-amma-speedrun/components/QuestionCard";
import { RoyalePanel } from "../quran-quiz-royale/components/RoyalePanel";
import { useNurBattle } from "./hooks/useNurBattle";
import { useNurBattleSocket } from "./hooks/useNurBattleSocket";
import { RoyaleStage } from "../_shared/variant/RoyaleStage";
import { LanternTower } from "../_shared/variant/LanternTower";
import { useGameExit } from "../_shared/hooks";
import { verseRecitation } from "../_shared/recitation";

function Game() {
  const game = useNurBattle();
  const multiplayer = useNurBattleSocket();
  const exit = useGameExit();
  return <GameShell title="Nur Battle" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="violet" recitation={verseRecitation(game.currentQuestion)}>
    {game.phase === "idle" ? <StartScreen title="Nur Battle" tagline="Panjat menara lentera" description="Nyalakan tiga lantai menara lewat pilihan ganda, isian, dan susun ayat. Jawaban salah memadamkan satu sumbu." coverImage={NGAJI_CERIA_ASSETS.quranQuizRoyale} best={game.best} onStart={() => { game.start(); multiplayer.ready(); }} accent="violet">
      <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/5 p-3 text-left"><p className="text-xs font-black text-violet-200">Mode multiplayer opsional</p><p className="mt-1 text-[11px] leading-relaxed text-white/60">Practice tetap offline. Jika server Colyseus aktif, cari room untuk mengirim jawaban secara realtime.</p><button type="button" onClick={() => multiplayer.join("nur-battle-lobby")} className="game-button mt-2 w-full border border-violet-300/30 bg-violet-500/20">{multiplayer.connected ? "Terhubung ke room" : "Cari room online"}</button>{multiplayer.error && <p className="mt-2 text-[10px] text-amber-200">Offline fallback aktif.</p>}</div>
    </StartScreen> : game.currentQuestion && <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} lives={game.lives} progressLabel={`Ronde ${game.round} · ${game.currentIndex + 1}/10`} timeLeft={game.timeLeft} accent="violet" />
      <TimerBar progress={game.timeLeft / 10} secondsLeft={game.timeLeft} accent="violet" />
      <LanternTower round={game.round} lives={game.lives} score={game.score} />
      <RoyaleStage players={game.players} round={game.round} />
      <RoyalePanel players={game.players} />
      <QuestionCard question={game.currentQuestion} selectedIndex={game.selected} answerState={game.status} onSelect={(index) => { game.answer(index); multiplayer.answer(game.currentQuestion?.id ?? "", String(index)); }} />
      <p aria-live="polite" className="text-center text-xs text-white/75">{game.status === "correct" ? "Benar, kamu bertahan." : game.status === "wrong" ? "Jawaban salah, satu nyawa berkurang." : game.status === "timeout" ? "Waktu habis, satu nyawa berkurang." : "Pilih jawaban sebelum waktu habis."}</p>
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.lives > 0} title={game.lives > 0 ? "Menara Terang" : "Tereliminasi"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="violet" description={`Peringkat ${game.rank} · ${game.alivePlayers} pemain tersisa`} onRetry={game.start} onExit={exit} secondChance={game.canSecondChance ? { onSuccess: game.revive, question: "Apa yang dibaca sebelum memulai belajar?", options: ["Bismillah", "Selamat malam", "Terima kasih"], correctIndex: 0 } : undefined} />
  </GameShell>;
}

export default function NurBattlePage() { return <GameBoundary><Game /></GameBoundary>; }
