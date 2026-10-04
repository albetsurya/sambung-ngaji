import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Volume2,
  Check,
  X,
  Sparkles,
  RefreshCw,
} from "../../../components/ui/FontAwesomeIcons";
import { tapFeedback } from "../../../lib/haptics";
import { playAudioUrl, playSoundEffect, playOpeningDua, stopAllAudio } from "../utils/audioPlayer";

interface QuizQuestion {
  id: number;
  arabic: string;
  transliterationParts: string[];
  options: string[];
  hintTone: string;
  audioUrl: string;
  isOpening?: boolean;
  isListenOnly?: boolean;
}

const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 0,
    arabic: "اَ بَ",
    transliterationParts: ["a", "ba"],
    options: ["a", "ba", "ta", "tsa", "ja", "ha", "da", "ro"],
    hintTone: "Rost: Datar — Naik — Turun (3x)",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b0_header_a_ba_3x_v2.ogg",
    isOpening: true,
    isListenOnly: true,
  },
  {
    id: 1,
    arabic: "اَ بَ",
    transliterationParts: ["a", "ba"],
    options: ["a", "ba", "ta", "tsa", "ja", "ha", "da", "ro"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b0_header_a_ba.ogg",
  },
  {
    id: 2,
    arabic: "اَ اَ",
    transliterationParts: ["a", "a"],
    options: ["a", "a", "ba", "ba", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b1_1_a_a.ogg",
  },
  {
    id: 3,
    arabic: "بَ بَ",
    transliterationParts: ["ba", "ba"],
    options: ["ba", "ba", "a", "a", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Naik",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b1_2_ba_ba.ogg",
  },
  {
    id: 4,
    arabic: "اَ بَ",
    transliterationParts: ["a", "ba"],
    options: ["a", "ba", "a", "ba", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b1_3_a_ba.ogg",
  },
  {
    id: 5,
    arabic: "بَ اَ",
    transliterationParts: ["ba", "a"],
    options: ["ba", "a", "a", "ba", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b2_1_ba_a.ogg",
  },
  {
    id: 6,
    arabic: "اَ بَ",
    transliterationParts: ["a", "ba"],
    options: ["a", "ba", "a", "ba", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Naik",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b2_2_a_ba.ogg",
  },
  {
    id: 7,
    arabic: "بَ اَ",
    transliterationParts: ["ba", "a"],
    options: ["ba", "a", "a", "ba", "ta", "tsa", "ja", "ha"],
    hintTone: "Rost: Nada Turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b2_3_ba_a.ogg",
  },
  {
    id: 8,
    arabic: "اَ اَ اَ",
    transliterationParts: ["a", "a", "a"],
    options: ["a", "a", "a", "ba", "ba", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b3_1_a_a_a.ogg",
  },
  {
    id: 9,
    arabic: "بَ بَ بَ",
    transliterationParts: ["ba", "ba", "ba"],
    options: ["ba", "ba", "ba", "a", "a", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b3_2_ba_ba_ba.ogg",
  },
  {
    id: 10,
    arabic: "بَ بَ اَ",
    transliterationParts: ["ba", "ba", "a"],
    options: ["ba", "ba", "a", "ba", "a", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b4_1_ba_ba_a.ogg",
  },
  {
    id: 11,
    arabic: "اَ بَ اَ",
    transliterationParts: ["a", "ba", "a"],
    options: ["a", "ba", "a", "ba", "ba", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b4_2_a_ba_a.ogg",
  },
  {
    id: 12,
    arabic: "اَ بَ بَ",
    transliterationParts: ["a", "ba", "ba"],
    options: ["a", "ba", "ba", "a", "a", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b5_1_a_ba_ba.ogg",
  },
  {
    id: 13,
    arabic: "بَ اَ بَ",
    transliterationParts: ["ba", "a", "ba"],
    options: ["ba", "a", "ba", "ba", "a", "ta", "tsa", "ha"],
    hintTone: "Rost: Nada Turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b5_2_ba_a_ba.ogg",
  },
  {
    id: 14,
    arabic: "ا ب ا ب ا ب",
    transliterationParts: ["alif", "ba", "alif", "ba", "alif", "ba"],
    options: ["alif", "ba", "alif", "ba", "alif", "ba", "ta", "tsa"],
    hintTone: "Rost: Nada Datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b6_bottom_alif_ba.ogg",
  },
];

export default function NgajiCeriaQuizPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const question = SAMPLE_QUESTIONS[currentIdx];
  const totalQuestions = SAMPLE_QUESTIONS.length;
  const currentStep = currentIdx + 1;
  const progressPercent = Math.round((currentStep / totalQuestions) * 100);

  const [isOpening, setIsOpening] = useState(true);
  const [isTaawudzPhase, setIsTaawudzPhase] = useState(true);

  // Auto-play audio when question changes
  useEffect(() => {
    if (currentIdx === 0 && isOpening) {
        setIsTaawudzPhase(true);
        playOpeningDua(() => {
            setIsTaawudzPhase(false);
            handlePlayAudio();
            setIsOpening(false);
        });
    } else {
        handlePlayAudio();
    }
    
    return () => {
        stopAllAudio();
    };
  }, [currentIdx]);

  const handleExit = () => {
    stopAllAudio();
    navigate("/member/ngaji-ceria/quiz");
  };

  const handlePickToken = (token: string) => {
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
      selectedTokens.every(
        (val, idx) => val === question.transliterationParts[idx],
      );

    if (isCorrect) {
      setStatus("correct");
      playSoundEffect("correct");
    } else {
      setStatus("wrong");
      playSoundEffect("wrong");
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

  const handleRetry = () => {
    tapFeedback();
    setSelectedTokens([]);
    setStatus("idle");
  };

  const handlePlayAudio = () => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    tapFeedback();
    playAudioUrl(question.audioUrl, () => {
      setIsAudioPlaying(false);
    });
  };

  const renderToneBadge = () => {
    if (question.hintTone.includes("Datar")) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-xs font-black tracking-wide border border-[#2D5A27]/20">
          <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse" />
          {question.hintTone.includes("3x") ? "Rost: Datar (3x)" : "Rost: Datar"}
        </span>
      );
    }
    if (question.hintTone.includes("Naik")) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D6E6F2] text-[#2B5A7D] text-xs font-black tracking-wide border border-[#2B5A7D]/20">
          <span className="w-2 h-2 rounded-full bg-[#2B5A7D] animate-pulse" />
          Rost: Naik
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE6DA] text-[#C4430E] text-xs font-black tracking-wide border border-[#C4430E]/20">
        <span className="w-2 h-2 rounded-full bg-[#C4430E] animate-pulse" />
        Rost: Turun
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFF8EE] flex flex-col justify-between selection:bg-[#F58A3A]/20">
      {/* Top Header & Progress Bar */}
      <div className="pt-safe px-4 py-3 border-b border-[#E2D4C0] bg-[#FFF8EE]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={handleExit}
            aria-label="Kembali"
            className="w-9 h-9 rounded-full bg-white border border-[#E2D4C0] flex items-center justify-center text-[#8C7A68] hover:text-[#5A3A2A] active:scale-90 transition-transform shadow-sm"
          >
            <X size={16} />
          </button>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex justify-between items-center text-[11px] font-bold mb-1 text-[#8C7A68]">
              <span>
                {currentStep} dari {totalQuestions}
              </span>
              <span className="text-[#F58A3A] font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E2D4C0] rounded-full h-3 p-0.5 border border-[#C8B8A2]">
              <div
                className="bg-[#F58A3A] h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF6D5] text-[#5A3A2A] font-black text-xs border border-[#FFCB45]/30 shadow-sm">
            <Sparkles size={13} className="text-[#F58A3A]" />
            <span>+10</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Play Area */}
      {isTaawudzPhase ? (
        <main className="max-w-md mx-auto w-full px-5 py-8 flex-1 flex flex-col items-center justify-center">
          <div className="w-full bg-[#2D5A27] text-white border-2 border-[#1A3816] rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white mb-2">
              <Volume2 size={28} className="animate-pulse text-[#FFCB45]" />
            </div>
            <div>
              <p className="text-2xl font-arabic leading-loose tracking-wide text-[#FFCB45]" dir="rtl">
                أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
              </p>
              <div className="my-4 border-t border-white/20 w-24 mx-auto" />
              <p className="text-3xl font-arabic leading-loose tracking-wide text-white" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
            </div>
            <p className="text-xs text-white/80 font-medium pt-2">
              Mendengarkan Ta'awudz & Basmalah pembuka...
            </p>
          </div>
        </main>
      ) : (
        <main className="max-w-md mx-auto w-full px-5 py-6 flex-1 flex flex-col items-center">
          {/* Question Prompt */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FCE6DA] text-[#F58A3A] text-xs font-black tracking-wide uppercase border border-[#F58A3A]/20">
                Tebak Bacaan
              </span>
              {renderToneBadge()}
            </div>
            <button
              onClick={() => setSelectedTokens([])}
              className="text-xs text-[#8C7A68] flex items-center gap-1 hover:text-[#F58A3A]"
            >
              <RefreshCw size={12} />
              <span>Hapus</span>
            </button>
          </div>

          <h2 className="text-xl font-black text-[#5A3A2A] mb-4 text-center">
            {question.isListenOnly ? "Dengarkan Contoh Judul (3x)" : "Bisa Kamu Baca?"}
          </h2>

          {/* Big Arabic Display Card */}
          <div className="w-full bg-white border-2 border-[#E2D4C0] rounded-3xl p-6 shadow-md flex flex-col items-center relative mb-6">
            <button
              onClick={handlePlayAudio}
              className={`absolute top-3 right-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isAudioPlaying
                  ? "bg-[#F58A3A] text-white scale-110 shadow-lg"
                  : "bg-[#FCE6DA] text-[#F58A3A] hover:bg-[#F58A3A]/20 active:scale-95"
              }`}
              title="Dengarkan lafadz"
            >
              <Volume2
                size={18}
                className={isAudioPlaying ? "animate-pulse" : ""}
              />
            </button>

            <p
              className="text-5xl font-arabic text-[#5A3A2A] py-4 tracking-widest text-center select-none"
              dir="rtl"
            >
              {question.arabic}
            </p>

            <p className="text-[11px] text-[#8C7A68] mt-1">
              {question.isListenOnly
                ? "Disimak dulu irama Datar — Naik — Turun"
                : "Sentuh audio untuk mendengarkan lafadz"}
            </p>
          </div>

          {question.isListenOnly ? (
            <div className="w-full flex-1 flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="px-4 py-3 rounded-2xl bg-[#FFF6D5] border border-[#FFCB45]/40 text-[#5A3A2A] text-sm font-semibold max-w-xs">
                Judul halaman dibaca 3 kali sebagai contoh irama Rost (Datar, Naik, Turun).
              </div>
            </div>
          ) : (
            <>
              {/* Answer Construction Slots */}
              <div className="w-full min-h-[64px] border-b-2 border-[#E2D4C0] pb-3 flex items-center justify-center gap-2.5 flex-wrap mb-8">
                {selectedTokens.length === 0 ? (
                  <span className="text-sm font-medium text-[#8C7A68] italic">
                    Pilih bacaan di bawah secara berurutan...
                  </span>
                ) : (
                  selectedTokens.map((token, idx) => (
                    <button
                      key={`${token}-${idx}`}
                      onClick={() => handleRemoveToken(idx)}
                      className="px-4 py-2.5 rounded-2xl bg-[#F58A3A] text-white font-black text-base shadow-md border-b-4 border-[#C4430E] active:translate-y-1 transition-all"
                    >
                      {token}
                    </button>
                  ))
                )}
              </div>

              {/* Options Word Bank */}
              <div className="w-full flex-1 flex flex-col justify-center">
                <p className="text-xs font-black text-[#8C7A68] mb-3 text-center">
                  Pilihan Bacaan:
                </p>
                <div className="grid grid-cols-4 gap-2.5 w-full">
                  {question.options.map((opt, idx) => {
                    const isUsed =
                      selectedTokens.filter((t) => t === opt).length >=
                      question.options.filter((t) => t === opt).length;

                    return (
                      <button
                        key={`${opt}-${idx}`}
                        disabled={isUsed || status !== "idle"}
                        onClick={() => handlePickToken(opt)}
                        className={`h-14 rounded-2xl font-black text-base border-b-4 transition-all duration-150 flex items-center justify-center ${
                          isUsed
                            ? "bg-[#E2D4C0]/50 text-[#8C7A68]/40 border-transparent cursor-not-allowed"
                            : "bg-white text-[#5A3A2A] border-[#E2D4C0] hover:border-[#F58A3A] active:translate-y-1 active:border-b-0 shadow-sm"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {/* Bottom Sticky Action / Feedback Drawer */}
      {!isTaawudzPhase && (
        <footer
          className={`p-4 pb-safe transition-colors duration-300 border-t ${
            status === "correct"
              ? "bg-[#E2EFCF] border-[#2D5A27]/30"
              : status === "wrong"
              ? "bg-[#FCEAEA] border-[#D32F2F]/30"
              : "bg-white border-[#E2D4C0]"
          }`}
        >
          <div className="max-w-md mx-auto">
            {status === "correct" && (
              <div className="flex items-center gap-3 mb-3 text-[#2D5A27]">
                <div className="w-10 h-10 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold shadow-md">
                  <Check size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-base leading-none">
                    Luar Biasa! Jawaban Tepat!
                  </p>
                  <p className="text-xs mt-1 text-[#2D5A27]/80">
                    Lafadz terbaca fasih sesuai irama.
                  </p>
                </div>
              </div>
            )}

            {status === "wrong" && (
              <div className="flex items-center gap-3 mb-3 text-[#D32F2F]">
                <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold shadow-md">
                  <X size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-base leading-none">
                    Hampir Tepat!
                  </p>
                  <p className="text-xs mt-1 text-[#D32F2F]/80">
                    Periksa urutan bacaan dan coba lagi ya.
                  </p>
                </div>
              </div>
            )}

            {status === "idle" ? (
              question.isListenOnly ? (
                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl font-black text-base text-white tracking-wide transition-all shadow-lg active:scale-[0.98] border-b-4 bg-[#F58A3A] hover:bg-[#E2561A] border-[#C4430E]"
                >
                  Mulai Latihan →
                </button>
              ) : (
                <button
                  disabled={selectedTokens.length === 0}
                  onClick={handleCheckAnswer}
                  className={`w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all shadow-lg ${
                    selectedTokens.length > 0
                      ? "bg-[#F58A3A] hover:bg-[#E2561A] text-white shadow-[#F58A3A]/30 active:scale-[0.98] border-b-4 border-[#C4430E]"
                      : "bg-[#E2D4C0] text-[#8C7A68] cursor-not-allowed border-b-4 border-transparent"
                  }`}
                >
                  Periksa Jawaban
                </button>
              )
            ) : (
              <button
                onClick={status === "correct" ? handleNext : handleRetry}
                className={`w-full py-4 rounded-2xl font-black text-base text-white tracking-wide transition-all shadow-lg active:scale-[0.98] border-b-4 ${
                  status === "correct"
                    ? "bg-[#2D5A27] hover:bg-[#1A3816] border-[#1A3816]"
                    : "bg-[#F58A3A] hover:bg-[#E2561A] border-[#C4430E]"
                }`}
              >
                {status === "correct" ? "Lanjut Soal Berikutnya →" : "Coba Lagi"}
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
