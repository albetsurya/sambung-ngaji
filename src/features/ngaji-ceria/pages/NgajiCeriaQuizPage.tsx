import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Volume2,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  RefreshCw,
} from "../../../components/ui/FontAwesomeIcons";
import { tapFeedback } from "../../../lib/haptics";
import { MascotStar } from "../components/NgajiCeriaIllustrations";

interface QuizQuestion {
  id: number;
  arabic: string;
  transliterationParts: string[]; // e.g. ["Ta", "Ba", "A"]
  options: string[]; // Options to pick from
  hintTone: string; // "Lagu Rost: Datar"
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    arabic: "تَ بَ أَ",
    transliterationParts: ["Ta", "Ba", "A"],
    options: ["Ba", "Ta", "A", "Da", "Ja", "Sa"],
    hintTone: "Rost: Nada Datar",
  },
  {
    id: 2,
    arabic: "بَ تَ ثَ",
    transliterationParts: ["Ba", "Ta", "Tsa"],
    options: ["Ta", "Tsa", "Ba", "A", "Kha", "Ra"],
    hintTone: "Rost: Nada Naik",
  },
  {
    id: 3,
    arabic: "جَ حَ خَ",
    transliterationParts: ["Ja", "Ha", "Kho"],
    options: ["Kho", "Ha", "Ja", "Za", "Ro", "Da"],
    hintTone: "Rost: Nada Turun",
  },
];

export default function NgajiCeriaQuizPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const question = SAMPLE_QUESTIONS[currentIdx];
  const totalQuestions = 14;
  const currentStep = currentIdx + 4; // Matching user screenshot "4 of 14"
  const progressPercent = Math.round((currentStep / totalQuestions) * 100);

  const handlePickToken = (token: string, optionIndex: number) => {
    if (status !== "idle") return;
    tapFeedback();
    setSelectedTokens((prev) => [...prev, token]);
  };

  const handleRemoveToken = (index: number) => {
    if (status !== "idle") return;
    tapFeedback();
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    tapFeedback();
    const isCorrect =
      selectedTokens.length === question.transliterationParts.length &&
      selectedTokens.every((val, idx) => val === question.transliterationParts[idx]);

    if (isCorrect) {
      setStatus("correct");
    } else {
      setStatus("wrong");
    }
  };

  const handleNext = () => {
    tapFeedback();
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedTokens([]);
      setStatus("idle");
    } else {
      navigate("/member/ngaji-ceria");
    }
  };

  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
    tapFeedback();
    setTimeout(() => {
      setIsAudioPlaying(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between selection:bg-accent/20">
      {/* Top Header & Duolingo-style Progress Bar */}
      <div className="pt-safe px-4 py-3 border-b border-surface-border bg-surface-bg/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/member/ngaji-ceria")}
            aria-label="Kembali"
            className="w-9 h-9 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-surface-muted hover:text-surface-text active:scale-90 transition-transform"
          >
            <X size={16} />
          </button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-bold mb-1 text-surface-muted">
              <span>{currentStep} dari {totalQuestions}</span>
              <span className="text-accent">{progressPercent}%</span>
            </div>
            <div className="w-full bg-surface-card2 rounded-full h-3 p-0.5 border border-surface-border">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-soft text-warning font-bold text-xs">
            <Sparkles size={13} />
            <span>+10</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Play Area */}
      <main className="max-w-md mx-auto w-full px-5 py-6 flex-1 flex flex-col items-center">
        {/* Question Prompt */}
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-extrabold tracking-wide uppercase">
              Tebak Bacaan
            </span>
            <span className="text-xs font-medium text-surface-muted">
              {question.hintTone}
            </span>
          </div>
          <button
            onClick={() => setSelectedTokens([])}
            className="text-xs text-surface-muted flex items-center gap-1 hover:text-accent"
          >
            <RefreshCw size={12} />
            <span>Ulang</span>
          </button>
        </div>

        <h2 className="text-xl font-black text-surface-text mb-4 text-center">
          Bisa Kamu Baca?
        </h2>

        {/* Big Arabic Display Card */}
        <div className="w-full bg-surface-card border-2 border-accent/30 rounded-3xl p-6 shadow-md shadow-accent/5 flex flex-col items-center relative mb-6">
          <button
            onClick={handlePlayAudio}
            className={`absolute top-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isAudioPlaying
                ? "bg-accent text-white scale-110 shadow-lg shadow-accent/30"
                : "bg-accent-soft text-accent hover:bg-accent/20 active:scale-95"
            }`}
            title="Dengarkan lafadz"
          >
            <Volume2 size={18} className={isAudioPlaying ? "animate-pulse" : ""} />
          </button>

          <p
            className="text-5xl font-arabic text-surface-text py-4 tracking-widest text-center select-none"
            dir="rtl"
          >
            {question.arabic}
          </p>

          <p className="text-[11px] text-surface-muted mt-1">
            Ketuk audio untuk mendengarkan lafadz Tilawati
          </p>
        </div>

        {/* Answer Construction Slots */}
        <div className="w-full min-h-[64px] border-b-2 border-surface-border pb-3 flex items-center justify-center gap-2.5 flex-wrap mb-8">
          {selectedTokens.length === 0 ? (
            <span className="text-sm font-medium text-surface-muted italic">
              Pilih suku kata di bawah secara berurutan...
            </span>
          ) : (
            selectedTokens.map((token, idx) => (
              <button
                key={`${token}-${idx}`}
                onClick={() => handleRemoveToken(idx)}
                className="px-4 py-2.5 rounded-2xl bg-accent text-white font-bold text-base shadow-md shadow-accent/25 border-b-4 border-accent-dark active:translate-y-1 transition-all"
              >
                {token}
              </button>
            ))
          )}
        </div>

        {/* Options Word Bank */}
        <div className="w-full flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold text-surface-muted mb-3 text-center">
            Pilihan Suku Kata:
          </p>
          <div className="grid grid-cols-3 gap-3 w-full">
            {question.options.map((opt, idx) => {
              const isUsed =
                selectedTokens.filter((t) => t === opt).length >=
                question.options.filter((t) => t === opt).length;

              return (
                <button
                  key={`${opt}-${idx}`}
                  disabled={isUsed || status !== "idle"}
                  onClick={() => handlePickToken(opt, idx)}
                  className={`h-14 rounded-2xl font-black text-lg border-b-4 transition-all duration-150 flex items-center justify-center ${
                    isUsed
                      ? "bg-surface-card2 text-surface-muted/40 border-transparent cursor-not-allowed"
                      : "bg-surface-card text-surface-text border-surface-border hover:border-accent active:translate-y-1 active:border-b-0 shadow-sm"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Sticky Action / Feedback Drawer */}
      <footer
        className={`p-4 pb-safe transition-colors duration-300 border-t ${
          status === "correct"
            ? "bg-success-soft border-success/30"
            : status === "wrong"
            ? "bg-danger-soft border-danger/30"
            : "bg-surface-card border-surface-border"
        }`}
      >
        <div className="max-w-md mx-auto">
          {status === "correct" && (
            <div className="flex items-center gap-3 mb-3 text-success">
              <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center font-bold">
                <Check size={20} />
              </div>
              <div>
                <p className="font-extrabold text-base leading-none">
                  Hebat! Jawabanmu Benar! 🎉
                </p>
                <p className="text-xs mt-1 text-success/80">
                  Lafadz terbaca fasih sesuai kaidah Tilawati.
                </p>
              </div>
            </div>
          )}

          {status === "wrong" && (
            <div className="flex items-center gap-3 mb-3 text-danger">
              <div className="w-10 h-10 rounded-full bg-danger text-white flex items-center justify-center font-bold">
                <X size={20} />
              </div>
              <div>
                <p className="font-extrabold text-base leading-none">
                  Hampir Tepat!
                </p>
                <p className="text-xs mt-1 text-danger/80">
                  Coba dengarkan audionya dan periksa urutan hurufnya lagi ya.
                </p>
              </div>
            </div>
          )}

          {status === "idle" ? (
            <button
              disabled={selectedTokens.length === 0}
              onClick={handleCheckAnswer}
              className={`w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all shadow-lg ${
                selectedTokens.length > 0
                  ? "bg-accent text-white shadow-accent/30 active:scale-[0.98] border-b-4 border-accent-dark"
                  : "bg-surface-card2 text-surface-muted cursor-not-allowed border-b-4 border-transparent"
              }`}
            >
              Periksa Jawaban
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-base text-white tracking-wide transition-all shadow-lg active:scale-[0.98] border-b-4 ${
                status === "correct"
                  ? "bg-success border-success-dark shadow-success/30"
                  : "bg-accent border-accent-dark shadow-accent/30"
              }`}
            >
              {status === "correct" ? "Lanjut Soal Berikutnya →" : "Coba Lagi"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
