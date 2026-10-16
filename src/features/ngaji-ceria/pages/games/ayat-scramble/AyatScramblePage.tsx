import { useState } from "react";
import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, pointerWithin, closestCenter, type DragEndEvent, type CollisionDetection } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { NGAJI_CERIA_ASSETS } from "../../../data/assets";
import { GameBoundary } from "../_shared/GameBoundary";
import { GameShell } from "../_shared/GameShell";
import { StartScreen } from "../_shared/StartScreen";
import { GameOverModal } from "../_shared/GameOverModal";
import { HUD } from "../_shared/HUD";
import { TimerBar } from "../_shared/TimerBar";
import { ComboBadge } from "../_shared/ComboBadge";
import { ScrambleZone } from "./components/ScrambleZone";
import { AnswerSlot } from "./components/AnswerSlot";
import { HintButton } from "./components/HintButton";
import { useScrambleGame } from "./hooks/useScrambleGame";
import { DetectiveBoard } from "../_shared/variant/DetectiveBoard";
import { useGameExit } from "../_shared/hooks";
import { verseRecitation } from "../_shared/recitation";

const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  // Dahulukan slot/kata daripada container besar yang juga terkena pointer.
  const specific = hits.filter((hit) => hit.id !== "source-zone");
  return specific.length ? specific : hits.length ? hits : closestCenter(args);
};
function Game() {
  const game = useScrambleGame();
  const exit = useGameExit();
  const [dragId, setDragId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 7 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const disabled = game.phase !== "playing" || game.status !== "idle";
  const allWords = [...game.shuffledWords, ...game.slots.filter((word) => word !== null)];
  const dragWord = allWords.find((word) => word.id === dragId);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragId(null);
    if (!over) return;
    const id = String(active.id); const target = String(over.id);
    if (target === "source-zone" || game.shuffledWords.some((word) => word.id === target)) game.moveWord(id, "source");
    else if (target.startsWith("slot-")) game.moveWord(id, Number(target.slice(5)));
    else { const index = game.slots.findIndex((word) => word?.id === target); if (index >= 0) game.moveWord(id, index); }
  };
  return <GameShell title="Ayat Scramble" phase={game.phase} onPause={game.pause} onResume={game.resume} accent="emerald" recitation={verseRecitation(game.currentQuestion)}>
    {game.phase === "idle" ? <StartScreen title="Ayat Scramble" tagline="Susun ayat, jaga ritme" description="Drag atau tap kata dari kanan ke kiri untuk menyusun ayat. Lima soal, 45 detik per soal, dan dua hint untuk satu sesi." coverImage={NGAJI_CERIA_ASSETS.ayatScramble} best={game.best} onStart={game.start} accent="emerald">
      <div className="flex w-full max-w-xs gap-2">{(["normal", "daily"] as const).map((mode) => <button key={mode} aria-pressed={game.mode === mode} onClick={() => game.setMode(mode)} className={`game-button flex-1 border ${game.mode === mode ? "border-emerald-300 bg-emerald-500/20" : "border-white/20"}`}>{mode === "normal" ? "Biasa" : "Harian"}</button>)}</div>
      {game.mode === "daily" && <p className="text-xs text-emerald-200/80">Tantangan {game.dateSeed} · soal dan acakan sama sepanjang hari.</p>}
    </StartScreen> : game.currentQuestion && <div className="flex flex-col flex-1 gap-3 min-h-0 justify-between">
      <HUD score={game.score} progressLabel={`Soal ${game.currentIndex + 1}/5`} timeLeft={game.timeLeft} accent="emerald" />
      <TimerBar progress={game.timeLeft / 45} secondsLeft={game.timeLeft} accent="emerald" />
      <div className="rounded-2xl border border-emerald-300/20 bg-white/5 p-3"><p className="text-xs font-bold text-emerald-300">{game.currentQuestion.surahName} · ayat {game.currentQuestion.ayahNumber}</p><p className="mt-1 text-xs leading-relaxed text-white/75">{game.currentQuestion.translation}</p></div>
      <DetectiveBoard surah={game.currentQuestion.surahName} ayah={game.currentQuestion.ayahNumber} placed={game.slots.filter(Boolean).length} total={game.currentQuestion.words.length} />
      <DndContext sensors={sensors} collisionDetection={collision} onDragStart={({ active }) => setDragId(String(active.id))} onDragCancel={() => setDragId(null)} onDragEnd={onDragEnd} accessibility={{ screenReaderInstructions: { draggable: "Tekan spasi untuk mengambil kata, tombol panah untuk memindahkan, lalu spasi untuk meletakkan. Kamu juga bisa tap kata." }, announcements: { onDragStart: () => "Kata diambil.", onDragOver: ({ over }) => over ? "Kata berada di atas posisi jawaban." : "Geser ke posisi jawaban.", onDragEnd: () => "Kata diletakkan.", onDragCancel: () => "Pemindahan dibatalkan." } }}>
        <ScrambleZone words={game.shuffledWords} disabled={disabled} onTap={(id) => { const index = game.slots.findIndex((word) => !word); if (index >= 0) game.moveWord(id, index); }} />
        <div className={game.status === "wrong" ? "game-shake" : ""}><p className="mb-2 mt-3 text-xs font-bold text-white/70">Jawaban · urutan dari kanan → kiri</p><div dir="rtl" className={`flex gap-2 overflow-x-auto rounded-2xl border p-2 ${game.status === "correct" ? "border-emerald-300 bg-emerald-500/20" : "border-white/20"}`}><SortableContext items={game.slots.filter((word) => word !== null).map((word) => word.id)} strategy={horizontalListSortingStrategy}>{game.slots.map((word, index) => <AnswerSlot key={index} index={index} word={word} locked={game.lockedPositions.includes(index)} disabled={disabled} onTap={() => word && game.moveWord(word.id, "source")} />)}</SortableContext></div></div>
        <DragOverlay>{dragWord && <div dir="rtl" className="game-arabic rounded-xl border border-emerald-300 bg-slate-800 px-3 py-2 text-xl text-white shadow-lg" style={{ fontFamily: "'Amiri', serif" }}>{dragWord.text}</div>}</DragOverlay>
      </DndContext>
      <div className="flex gap-2"><HintButton left={game.hintsLeft} disabled={disabled || game.slots.every((word, i) => word?.text === game.currentQuestion?.words[i])} onClick={game.hint} /><button onClick={game.check} disabled={disabled || game.slots.some((word) => !word)} className="game-button flex-1 bg-emerald-500">Cek Jawaban</button></div>
      <p aria-live="polite" className="text-center text-xs text-white/80">{game.status === "correct" ? "Tepat! Lanjut ke ayat berikutnya." : game.status === "wrong" ? "Urutannya belum tepat. Coba geser lagi." : game.status === "timeout" ? `Waktu habis. Jawaban: ${game.currentQuestion.words.join(" ")}` : "Tap kata di jawaban untuk mengembalikannya."}</p>
      <ComboBadge combo={game.streak} />
    </div>}
    <GameOverModal visible={game.phase === "gameover"} score={game.score} maxCombo={game.streak} victory={game.solved === 5} best={game.best} isNewRecord={game.isNewRecord} accent="emerald" description={`${game.solved}/5 ayat tersusun · ${game.mode === "daily" ? `Harian ${game.dateSeed}` : "Mode biasa"}`} onRetry={game.start} onExit={exit} />
  </GameShell>;
}
export default function AyatScramblePage() { return <GameBoundary><Game /></GameBoundary>; }
