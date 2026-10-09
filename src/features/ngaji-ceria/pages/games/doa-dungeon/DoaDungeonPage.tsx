import { useNavigate } from "react-router-dom";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameOverModal } from "../_shared/GameOverModal";
import { GameShell } from "../_shared/GameShell";
import { HUD } from "../_shared/HUD";
import { StartScreen } from "../_shared/StartScreen";
import { ComboBadge } from "../_shared/ComboBadge";
import { LeaderboardPanel } from "../_shared/LeaderboardPanel";
import { ProgressPanel } from "../_shared/ProgressPanel";
import { DungeonMap } from "./components/DungeonMap";
import { useDoaDungeon } from "./hooks/useDoaDungeon";
import { QuizBattleArena } from "../_shared/battle/QuizBattleArena";
import { BattleSetupFlow } from "../_shared/battle/BattleSetupFlow";
import { useBattleSetup } from "../_shared/battle/useBattleSetup";

// KONSEP EKSKLUSIF: Doa Dungeon adalah satu-satunya game yang memakai
// konsep 3D fight (QuizBattleArena + BattleSetupFlow). Game quiz lain
// memakai konsep tematik masing-masing (majelis, pos langit, lentera,
// podium, taman) — jangan pakai komponen battle di luar file ini.

function Game() {
  const game = useDoaDungeon();
  const navigate = useNavigate();
  const battle = useBattleSetup("cave");
  const room = game.room;
  return <GameShell title="Doa Dungeon" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="violet">
    {game.phase === "idle" ? <StartScreen title="Doa Dungeon" tagline="Doa tepat, buka gerbang" description="Pilih karakter dan arena, lalu jelajahi enam lantai dungeon. Pilih doa yang sesuai dengan situasi penjaga, baca teks dan artinya, lalu lanjutkan perjalanan." coverImage={NGAJI_CERIA_ASSETS.doaDungeon} best={game.best} onStart={game.start} accent="violet" hideStartButton><BattleSetupFlow setup={battle.setup} onCharacter={battle.selectCharacter} onArena={battle.selectArena} onBegin={game.start} accent="violet" /></StartScreen> : room && <div className="space-y-3">
      <HUD score={game.score} progressLabel={`Lantai ${room.floor}/${game.rooms.length}`} accent="violet" />
      <DungeonMap total={game.rooms.length} current={game.roomIndex} cleared={game.roomIndex + (game.status === "cleared" ? 1 : 0)} />
      <QuizBattleArena playerHp={game.playerHp} monsterHp={game.monsterHp} monsterMaxHp={room.monsterMaxHp} monsterName={room.enemy} attack={game.attack} outcome={game.outcome} paused={game.phase === "paused"} encounter={game.roomIndex} theme="dungeon" setup={battle.setup} />
      <div className="rounded-3xl border border-violet-300/25 bg-black/25 p-4 text-center"><p className="text-xs font-black uppercase tracking-widest text-violet-200">Monster · {room.enemy}</p><p className="mt-2 text-sm text-white/80">Pilih jawaban benar untuk memukul monster.</p><div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-white/60">Situasi yang harus diingat</p><p className="mt-1 text-sm font-black text-amber-200">{room.target.judul}</p></div></div>
      {game.status === "idle" ? <div className="grid gap-2">{room.options.map((entry) => <button type="button" key={entry.id} data-option-correct={entry.id === room.target.id} onClick={() => game.answer(entry.id)} className="rounded-2xl border border-white/15 bg-white/5 p-3 text-left transition active:scale-[.98]"><span className="block text-sm font-black text-white">{entry.judul}</span><span lang="ar" dir="rtl" className="game-arabic mt-1 block text-lg leading-relaxed text-violet-100">{entry.arab}</span><span className="mt-1 block text-xs text-white/60">{entry.arti}</span></button>)}</div> : game.status === "cleared" && <div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-3 text-center"><p lang="ar" dir="rtl" className="game-arabic text-xl leading-relaxed text-white">{room.target.arab}</p><p className="mt-2 text-xs leading-relaxed text-white/80">{room.target.arti}</p>{game.phase === "playing" && <button type="button" onClick={game.nextRoom} className="game-button mt-3 w-full bg-violet-500">Turun ke Lantai Berikutnya</button>}</div>}
      <p aria-live="polite" className="text-center text-xs text-white/75">{game.feedback}</p><ComboBadge combo={game.combo} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} victory={game.outcome === "victory"} maxCombo={game.combo} title={game.outcome === "victory" ? "Victory!" : "Defeat"} score={game.score} best={game.best} isNewRecord={game.isNewRecord} accent="violet" description={`${game.outcome === "victory" ? "Semua monster dikalahkan" : "HP pemain habis"} · ${Math.min(game.rooms.length, game.roomIndex + (game.outcome === "victory" ? 1 : 0))}/${game.rooms.length} lantai`} onRetry={game.start} onExit={() => navigate("/member/ngaji-ceria/games") } secondChance={game.canSecondChance ? { onSuccess: game.revive, question: "Doa sebelum masuk kamar mandi dimulai dengan…", options: ["Bismillah", "Selamat pagi", "Sampai jumpa"], correctIndex: 0 } : undefined}><div className="space-y-3"><ProgressPanel progress={game.progress} /><LeaderboardPanel entries={game.leaderboard} /></div></GameOverModal>
  </GameShell>;
}

export default function DoaDungeonPage() { return <GameBoundary><Game /></GameBoundary>; }
