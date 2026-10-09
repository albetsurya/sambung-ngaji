import { Share2 } from "@/components/ui/FontAwesomeIcons";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { WordleBoard } from "./components/WordleBoard";
import { ArabicKeyboard } from "./components/ArabicKeyboard";
import { useArabicWordle } from "./hooks/useArabicWordle";
import { AlchemyPanel } from "../_shared/variant/AlchemyPanel";
import { useGameExit } from "../_shared/hooks";

function Game() {
  const game = useArabicWordle();
  const exit = useGameExit();
  return <GameShell title="Arabic Wordle" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="emerald">
    {game.phase === "idle" ? <StartScreen title="Arabic Wordle" tagline="Satu kata, enam percobaan" description="Tebak kata Arab lima huruf. Hijau berarti posisi tepat, kuning hurufnya ada, abu-abu tidak dipakai. Tantangan harian memakai kata yang sama sepanjang hari." coverImage={NGAJI_CERIA_ASSETS.arabicWordle} best={game.best} onStart={game.start} accent="emerald"><div className="flex w-full max-w-xs gap-2">{(["daily", "normal"] as const).map((mode) => <button type="button" key={mode} aria-pressed={game.mode === mode} onClick={() => game.setMode(mode)} className={`game-button flex-1 border ${game.mode === mode ? "border-emerald-300 bg-emerald-500/25" : "border-white/20 bg-white/5"}`}>{mode === "daily" ? "Harian" : "Latihan"}</button>)}</div></StartScreen> : <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={`${game.guesses.length}/6 percobaan`} accent="emerald" />
      <AlchemyPanel targetLength={5} guesses={game.guesses.length} />
      <WordleBoard rows={game.board} />
      <p aria-live="polite" className="min-h-5 text-center text-xs font-bold text-white/80">{game.message}</p>
      <ArabicKeyboard keyStatuses={game.keyStatuses} onKey={game.input} onBackspace={game.backspace} onSubmit={game.submit} disabled={game.phase !== "playing"} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.solved} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="emerald" title={game.solved ? "Kata Terpecahkan!" : "Kesempatan Habis"} description={`Jawaban: ${game.target} · ${game.guesses.length}/6 percobaan`} onRetry={game.start} onExit={exit}><button type="button" onClick={game.share} className="game-button mx-auto mb-4 mt-4 border border-emerald-300/30 bg-emerald-500/15"><Share2 size={14} />Bagikan Hasil</button></GameOverModal>
  </GameShell>;
}
export default function ArabicWordlePage() { return <GameBoundary><Game /></GameBoundary>; }
