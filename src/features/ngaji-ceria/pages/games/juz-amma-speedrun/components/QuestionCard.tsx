import { motion } from "framer-motion";
import type { Question } from "../data/juz-amma-questions";
import type { AnswerState } from "../hooks/useQuizGame";
import { OptionButton } from "./OptionButton";
import { SparkleBurst } from "../../_shared/SparkleBurst";

const LABELS = { "lanjut-ayat": "Lanjutkan Ayat", "nama-surah": "Nama Surah", "arti-ayat": "Arti Ayat" };
export function QuestionCard({ question, selectedIndex, answerState, onSelect }: { question: Question; selectedIndex: number | null; answerState: AnswerState; onSelect: (index: number) => void }) {
  const failed = answerState === "wrong" || answerState === "timeout";
  return <motion.div key={`${question.id}:${answerState}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }} className={`relative space-y-3 ${failed ? "game-shake" : ""}`}>
    {answerState === "correct" && <SparkleBurst burstKey={question.id} />}
    <div className="rounded-3xl border border-pink-400/25 bg-white/5 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-pink-300">{LABELS[question.type]}</p>
      <p className="mt-1 text-xs text-white/80">{question.prompt}</p>
      <p dir="rtl" className="game-arabic mt-2 text-center text-2xl leading-relaxed text-white">{question.promptArabic}</p>
    </div>
    <div className="space-y-2">{question.options.map((option, index) => <OptionButton key={`${question.id}:${index}`} label={option} index={index} selected={selectedIndex === index} correct={question.correctIndex === index} answerState={answerState} arabic={question.type === "lanjut-ayat"} onSelect={onSelect} />)}</div>
    {answerState !== "idle" && <p className="text-center text-xs text-white/75">{question.surahName} · ayat {question.ayahNumber}{question.type === "lanjut-ayat" ? ` → ${question.ayahNumber + 1}` : ""}</p>}
  </motion.div>;
}
