import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { HIJAIYAH_LIST, HijaiyahItem } from "../data/hijaiyah";
import { playHijaiyahAudio, playSoundEffect } from "../utils/audioPlayer";
import { tapFeedback } from "../../../lib/haptics";
import { RefreshCw, Trophy } from "../../../components/ui/FontAwesomeIcons";

interface BalloonTarget {
  id: string;
  letter: HijaiyahItem;
  balloonSvg: string;
  x: number; // percentage
  y: number; // percentage
  speed: number;
}

const BALLOON_COLORS = [
  NGAJI_CERIA_ASSETS.balonBiru,
  NGAJI_CERIA_ASSETS.balonMerah,
  NGAJI_CERIA_ASSETS.balonKuning,
  NGAJI_CERIA_ASSETS.balonHijau,
];

export default function HijaiyahBurstPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<HijaiyahItem>(HIJAIYAH_LIST[0]);
  const [balloons, setBalloons] = useState<BalloonTarget[]>([]);

  const pickNewTarget = useCallback((): HijaiyahItem => {
    const randomIdx = Math.floor(Math.random() * HIJAIYAH_LIST.length);
    const target = HIJAIYAH_LIST[randomIdx];
    setCurrentTarget(target);
    return target;
  }, []);

  const spawnBalloons = useCallback((targetLetter: HijaiyahItem) => {
    // Generate 4 balloons (1 correct, 3 random wrong)
    const options: HijaiyahItem[] = [targetLetter];
    while (options.length < 4) {
      const candidate = HIJAIYAH_LIST[Math.floor(Math.random() * HIJAIYAH_LIST.length)];
      if (!options.find((o) => o.id === candidate.id)) {
        options.push(candidate);
      }
    }
    // Shuffle
    const shuffled = options.sort(() => Math.random() - 0.5);

    const newBalloons: BalloonTarget[] = shuffled.map((item, idx) => ({
      id: `${item.id}-${Date.now()}-${idx}`,
      letter: item,
      balloonSvg: BALLOON_COLORS[idx % BALLOON_COLORS.length],
      // Menambahkan efek acak posisi agar terlihat bertumpuk (offset)
      x: 10 + (idx % 2) * 20 + Math.random() * 10,
      y: 10 + Math.floor(idx / 2) * 30 + Math.random() * 10,
      speed: 1,
    }));
    setBalloons(newBalloons);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsPlaying(true);
    const target = pickNewTarget();
    if (target) {
      playHijaiyahAudio(target.id);
    }
  };

  useEffect(() => {
    if (isPlaying && currentTarget) {
      spawnBalloons(currentTarget);
    }
  }, [isPlaying, currentTarget, spawnBalloons]);

  // Countdown timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          setIsGameOver(true);
          playSoundEffect("win");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePop = (balloon: BalloonTarget) => {
    tapFeedback();
    playHijaiyahAudio(balloon.letter.id);
    if (balloon.letter.id === currentTarget.id) {
      playSoundEffect("pop");
      setScore((s) => s + 100);
      const nextTarget = pickNewTarget();
      if (nextTarget) {
        setTimeout(() => playHijaiyahAudio(nextTarget.id), 600);
      }
    } else {
      playSoundEffect("wrong");
      setScore((s) => Math.max(0, s - 30));
    }
  };

  return (
    <NgajiCeriaLayout title="Hijaiyah Burst" showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-4 space-y-4 bg-[#FFF8EE] min-h-full rounded-t-3xl flex flex-col justify-between">
        {/* Top Game Bar */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Waktu:</span>
            <span className={`text-base font-black ${timeLeft <= 5 ? "text-[#D32F2F] animate-pulse" : "text-[#5A3A2A]"}`}>
              {timeLeft}d
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Skor:</span>
            <span className="text-lg font-black text-[#F58A3A]">{score}</span>
          </div>
        </div>

        {/* Playfield Area */}
        <div className="relative flex-1 min-h-[360px] bg-gradient-to-b from-[#EAF6FB] via-[#F2FAFD] to-white rounded-3xl border-2 border-[#BCE3F5] p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner">
          {/* Target Instruction Prompt */}
          <div className="z-10 bg-white/95 px-5 py-2.5 rounded-2xl border-2 border-[#BCE3F5] shadow-md flex items-center gap-3">
            <span className="text-xs font-bold text-[#1C5D79]">Pecahkan huruf:</span>
            <span className="text-2xl font-black text-[#5A3A2A] font-arabic">
              {currentTarget.arabic}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#E2EFCF] text-[#2D5A27]">
              ({currentTarget.name})
            </span>
          </div>

          {/* Balloon Grid */}
          {isPlaying && (
            <div className="relative w-full h-[300px] my-auto z-10 py-4">
              {balloons.map((balloon) => (
                <button
                  key={balloon.id}
                  onClick={() => handlePop(balloon)}
                  className="absolute transition-all duration-300 hover:scale-105 active:scale-90"
                  style={{
                    left: `${balloon.x}%`,
                    top: `${balloon.y}%`,
                    width: "45%",
                    maxWidth: "120px",
                  }}
                >
                  <img
                    src={balloon.balloonSvg}
                    alt="Balon"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                  {/* Arabic letter on balloon */}
                  <span className="absolute inset-0 flex items-center justify-center font-arabic text-3xl font-black text-[#5A3A2A] pb-3 select-none">
                    {balloon.letter.arabic}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Start / Game Over Modal Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-20">
              <div className="bg-white rounded-[28px] p-6 text-center max-w-xs w-full border-4 border-white shadow-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EAF6FB] border-2 border-[#BCE3F5] mx-auto flex items-center justify-center">
                  <Trophy size={28} className="text-[#1C5D79]" />
                </div>

                <div>
                  <h3 className="font-display font-black text-xl text-[#5A3A2A]">
                    {isGameOver ? "Permainan Selesai!" : "Balon Hijaiyah"}
                  </h3>
                  <p className="text-xs text-[#8C7A68] mt-1">
                    {isGameOver
                      ? `Hebat! Skor akhir kamu: ${score}`
                      : "Pecahkan balon dengan huruf hijaiyah yang tepat sebanyak mungkin sebelum 30 detik habis!"}
                  </p>
                </div>

                <button
                  onClick={startGame}
                  className="w-full py-3.5 rounded-2xl bg-[#1C5D79] hover:bg-[#14485E] text-white font-black text-sm shadow-md border-b-4 border-[#0E3547] active:translate-y-1 transition-all"
                >
                  {isGameOver ? "Main Lagi" : "Mulai Bermain"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
