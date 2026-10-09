import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { DeckRunMap } from "../_shared/variant/DeckRunMap";
import { MajelisScoreBoard } from "../_shared/variant/MajelisScoreBoard";
import { useTajwidArena } from "./hooks/useTajwidArena";
import { TAJWID_CARDS } from "./data/cards";
import { useGameExit } from "../_shared/hooks";
import { Card } from "./components/Card";
import { LogFeed } from "./components/LogFeed";
import { QuestionModal } from "./components/QuestionModal";

function Game() {
  const game = useTajwidArena();
  const exit = useGameExit();
  const navigate = useNavigate();
  return <GameShell title="Tajwid Arena" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="violet">
    {game.phase === "idle" ? <StartScreen title="Tajwid Arena" tagline="Majelis kartu · tiga sesi" description="Susun minimal tiga kartu ilmu. Jawab soal untuk fokus, mainkan kartu di meja majelis, ambil kartu baru, lalu pilih istirahat, khazanah, atau sesi pendalaman sebelum sesi akhir." coverImage={NGAJI_CERIA_ASSETS.hijaiyahMatchArena} best={game.best} onStart={game.start} accent="violet">
       <div className="mt-2 flex w-full max-w-sm flex-col gap-2 text-left"><p className="text-center text-[11px] font-black uppercase tracking-wider text-white/60">Kartu bawaanku (min. 3)</p><div className="flex flex-wrap justify-center gap-2">{TAJWID_CARDS.map((card) => <button type="button" key={card.id} aria-pressed={game.deck.some((item) => item.id === card.id)} onClick={() => game.toggleCard(card.id)} className="game-button border border-violet-300/30 bg-violet-500/20">{card.name}</button>)}</div><div className="flex flex-wrap justify-center gap-2">{(["easy", "normal", "hard"] as const).map((difficulty, i) => <button type="button" key={difficulty} aria-pressed={game.difficulty === difficulty} onClick={() => game.setDifficulty(difficulty)} className="game-button border border-white/20">{["Santai", "Normal", "Sulit"][i]}</button>)}</div></div>
    </StartScreen> : <div className="space-y-3">
      <HUD score={game.score} progressLabel={`Sesi ${Math.min(3, game.wins + 1)}/3 · ${game.deck.length} kartu`} accent="violet" />
      <DeckRunMap energy={game.energy} handSize={game.hand.length} turn={game.turn} />
       <MajelisScoreBoard playerHp={game.playerHp} rivalHp={game.aiHp} rivalMaxHp={game.aiMaxHp} rivalName={game.wins === 2 ? "Sesi Akhir Majelis" : game.elite ? "Sesi Pendalaman" : "Dewan Ustadz"} roundLabel={`Sesi ${Math.min(3, game.wins + 1)}/3`} />
      {game.turn === "question" && <QuestionModal question={game.currentQuestion} selected={game.selectedAnswer} status={game.answerStatus} onAnswer={game.answer} />}
      {game.turn === "reward" ? <div><h2 className="text-sm font-bold">Pilih kartu ilmu baru</h2><div className="flex flex-wrap gap-2">{game.rewards.map((card) => <button key={card.id} onClick={() => game.claimReward(card.id)} className="game-button bg-violet-600">Ambil {card.name}</button>)}</div></div>
        : game.turn === "path" ? <div aria-label="Jalur majelis" className="grid gap-2"><button onClick={() => game.choosePath("rest")} className="game-button bg-emerald-700">Istirahat · pulihkan 30 fokus</button><button onClick={() => game.choosePath("treasure")} className="game-button bg-amber-700">Khazanah · kartu tambahan</button><button onClick={() => game.choosePath("elite")} className="game-button bg-rose-700">Pendalaman · bahan 130</button></div>
        : <><p className="text-xs text-white/70">Hand kamu · {game.hand.length}/7 · shield {game.shield}{game.double ? " · serangan berikutnya ×2" : ""}</p><div className="flex gap-2 overflow-x-auto pb-1">{game.hand.map((card, index) => <Card key={`${card.id}:${index}`} card={card} active={game.turn === "card"} disabled={game.phase !== "playing" || game.turn !== "card" || game.energy < card.energy} onPlay={() => game.playCard(card.id)} />)}</div>{game.turn === "card" && <button onClick={game.endTurn} className="game-button w-full bg-violet-700">Akhiri Giliran</button>}</>}
      <LogFeed entries={game.log} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.playerHp > 0} title={game.playerHp > 0 ? "Majelis Tuntas!" : "Majelis Berakhir"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="violet" description={`${game.wins}/3 sesi diselesaikan · ${game.deck.length} kartu`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function TajwidArenaPage() { return <GameBoundary><Game /></GameBoundary>; }
