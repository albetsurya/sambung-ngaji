import type { AnswerState } from "../hooks/useQuizGame";

export function OptionButton({ label, index, selected, correct, answerState, arabic, onSelect }: { label: string; index: number; selected: boolean; correct: boolean; answerState: AnswerState; arabic: boolean; onSelect: (index: number) => void }) {
  const revealed = answerState !== "idle";
  const isCorrect = revealed && correct;
  const isWrongPick = revealed && selected && !correct;
  const color = isCorrect ? "border-emerald-400 bg-emerald-500/20 text-emerald-100" : isWrongPick ? "border-red-400 bg-red-500/20 text-red-100" : "border-white/15 bg-white/5 text-white/90 hover:bg-white/10";
  const feedback = isCorrect ? "quiz-option-correct" : isWrongPick ? "game-shake" : "";
  return <button data-option-index={index} data-option-correct={correct} disabled={revealed} onClick={() => onSelect(index)} className={`min-h-14 w-full rounded-2xl border px-3 py-3 text-left transition-colors active:scale-[0.98] ${color} ${feedback} ${arabic ? "game-arabic text-lg leading-relaxed" : "text-[13px] font-semibold leading-snug"}`} dir={arabic ? "rtl" : "ltr"}>{label}</button>;
}
