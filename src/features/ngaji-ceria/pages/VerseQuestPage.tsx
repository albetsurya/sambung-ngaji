import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { JUZ_AMMA_QUIZ_DATA } from "../data/hijaiyah";
import { tapFeedback } from "../../../lib/haptics";
import { Check, X, Sparkles, Trophy } from "../../../components/ui/FontAwesomeIcons";

export default function VerseQuestPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = JUZ_AMMA_QUIZ_DATA[Math.min(currentIdx, JUZ_AMMA_QUIZ_DATA.length - 1)];
  const totalQuestions = JUZ_AMMA_QUIZ_DATA.length;
  const progressPercent = Math.round((currentIdx / totalQuestions) * 100);

  const handlePick = (opt: string) => {
    if (status !== "idle") return;
    tapFeedback();
    setSelected(opt);
  };

  const handleCheck = () => {
    if (!selected) return;
    tapFeedback();
    if (selected === question.surahName) {
      setStatus("correct");
      setScore((s) => s + 150);
    } else {
      setStatus("wrong");
    }
  };

  const handleNext = () => {
    tapFeedback();
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setStatus("idle");
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setStatus("idle");
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <NgajiCeriaLayout title="Verse Quest" showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
        <div className="px-4 py-10 flex flex-col items-center">
          <div className="bg-white rounded-[28px] p-8 text-center border-2 border-[#E2D4C0] shadow-md space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-[#FFCB45] border-2 border-[#B8590C]/20 mx-auto flex items-center justify-center">
              <Trophy size={28} className="text-[#5A3A2A]" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#5A3A2A]">Misi Selesai!</h3>
              <p className="text-xs text-[#8C7A68] mt-1">Skor akhir Tebak Ayat: {score}</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={restart}
                className="flex-1 py-3 rounded-2xl bg-[#553894] text-white font-black text-sm shadow-md border-b-4 border-[#3A2568] active:translate-y-1 transition-all"
              >
                Main Lagi
              </button>
              <button
                onClick={() => navigate("/member/ngaji-ceria/games")}
                className="flex-1 py-3 rounded-2xl bg-white text-[#5A3A2A] font-black text-sm shadow-md border-2 border-[#E2D4C0] active:translate-y-1 transition-all"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </NgajiCeriaLayout>
    );
  }

  return (
    <NgajiCeriaLayout title="Verse Quest" showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-4 space-y-4 bg-[#FBF6EE] min-h-full rounded-t-3xl flex flex-col">
        {/* Progress Header */}
        <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-black mb-1.5 text-[#8C7A68]">
              <span>
                {currentIdx + 1} dari {totalQuestions}
              </span>
              <span className="text-[#553894]">Skor: {score}</span>
            </div>
            <div className="w-full bg-[#E2D4C0] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#553894] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Ayat Card */}
        <div className="bg-[#553894] rounded-[26px] p-6 text-center border-2 border-[#3A2568] shadow-md relative overflow-hidden">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[#FFCB45] text-[10px] font-black uppercase tracking-wider mb-4 border border-white/20">
            <Sparkles size={10} />
            Tebak Nama Surah
          </div>

          <p className="font-arabic text-3xl text-white leading-loose select-none" dir="rtl">
            {question.ayatArabic}
          </p>

          <p className="text-xs text-white/70 italic mt-4 max-w-xs mx-auto">
            "{question.arti}"
          </p>
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5">
          <p className="text-xs font-black text-[#8C7A68] text-center">
            Potongan ayat di atas dari surah apa?
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {question.options.map((opt) => {
              const isSelected = selected === opt;
              const showCorrect = status !== "idle" && opt === question.surahName;
              const showWrong = status === "wrong" && isSelected;

              return (
                <button
                  key={opt}
                  disabled={status !== "idle"}
                  onClick={() => handlePick(opt)}
                  className={`py-3.5 px-2 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    showCorrect
                      ? "bg-[#E2EFCF] border-[#2D5A27] text-[#2D5A27] shadow-md"
                      : showWrong
                      ? "bg-[#FCEAEA] border-[#D32F2F] text-[#D32F2F] shadow-md"
                      : isSelected
                      ? "bg-[#553894] border-[#3A2568] text-white shadow-md"
                      : "bg-white border-[#E2D4C0] text-[#5A3A2A] hover:border-[#553894] shadow-sm"
                  }`}
                >
                  {showCorrect && <Check size={15} />}
                  {showWrong && <X size={15} />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-2 pb-4">
          {status === "idle" ? (
            <button
              disabled={!selected}
              onClick={handleCheck}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg ${
                selected
                  ? "bg-[#553894] text-white border-b-4 border-[#3A2568] active:translate-y-1"
                  : "bg-[#E2D4C0] text-[#8C7A68] cursor-not-allowed"
              }`}
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-base text-white transition-all shadow-lg active:scale-[0.98] border-b-4 ${
                status === "correct"
                  ? "bg-[#2D5A27] border-[#1A3816]"
                  : "bg-[#F58A3A] border-[#C4430E]"
              }`}
            >
              {currentIdx < totalQuestions - 1
                ? status === "correct"
                  ? "Tepat! Lanjut →"
                  : "Coba Soal Berikutnya →"
                : "Lihat Hasil Akhir"}
            </button>
          )}
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
