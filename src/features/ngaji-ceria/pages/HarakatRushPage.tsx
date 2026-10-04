import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { playSoundEffect } from "../utils/audioPlayer";
import { tapFeedback } from "../../../lib/haptics";
import { Trophy, Sparkles } from "../../../components/ui/FontAwesomeIcons";

interface HarakatTarget {
  id: string;
  name: string; // Fathah, Kasrah, Dhammah
  sign: string; // َ , ِ , ُ
  vowel: string; // a, i, u
  symbol: string;
}

const HARAKAT_LIST: HarakatTarget[] = [
  { id: "fathah", name: "Fathah", sign: "َ", vowel: "a", symbol: "ــــَ" },
  { id: "kasrah", name: "Kasrah", sign: "ِ", vowel: "i", symbol: "ــــِ" },
  { id: "dhammah", name: "Dhammah", sign: "ُ", vowel: "u", symbol: "ــــُ" },
];

const BASE_LETTERS = [
  { char: "ب", name: "Ba" },
  { char: "ت", name: "Ta" },
  { char: "ن", name: "Na" },
  { char: "ي", name: "Ya" },
  { char: "م", name: "Ma" },
  { char: "د", name: "Da" },
  { char: "ر", name: "Ro" },
  { char: "س", name: "Sa" },
];

interface FallingHarakat {
  uid: number;
  harakat: HarakatTarget;
  lane: number; // 0, 1, 2
  yPercent: number; // 0 to 100
}

export default function HarakatRushPage() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Basket Huruf di bawah (Lane: 0, 1, 2)
  const [basketLane, setBasketLane] = useState(1);
  const [currentLetter, setCurrentLetter] = useState(BASE_LETTERS[0]);
  const [targetHarakat, setTargetHarakat] = useState(HARAKAT_LIST[0]);

  // Falling Items
  const [items, setItems] = useState<FallingHarakat[]>([]);

  // Mulai game
  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setBasketLane(1);
    setItems([]);
    pickNextTarget();
  };

  const pickNextTarget = () => {
    const nextHarakat = HARAKAT_LIST[Math.floor(Math.random() * HARAKAT_LIST.length)];
    const nextLetter = BASE_LETTERS[Math.floor(Math.random() * BASE_LETTERS.length)];
    setTargetHarakat(nextHarakat);
    setCurrentLetter(nextLetter);
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setIsGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Spawner & Physics loop
  useEffect(() => {
    if (!isPlaying) return;

    // Spawner
    const spawnTimer = setInterval(() => {
      const randomHarakat =
        Math.random() < 0.55
          ? targetHarakat
          : HARAKAT_LIST[Math.floor(Math.random() * HARAKAT_LIST.length)];
      const randomLane = Math.floor(Math.random() * 3);

      setItems((prev) => [
        ...prev,
        {
          uid: Date.now() + Math.random(),
          harakat: randomHarakat,
          lane: randomLane,
          yPercent: 0,
        },
      ]);
    }, 750);

    // Gravity loop
    const gravityTimer = setInterval(() => {
      setItems((prev) => {
        const nextItems: FallingHarakat[] = [];

        prev.forEach((item) => {
          const newY = item.yPercent + 4.0;

          // Cek tabrakan di dasar (y > 75% sampai 92%)
          if (newY >= 75 && newY <= 90 && item.lane === basketLane) {
            tapFeedback();
            if (item.harakat.id === targetHarakat.id) {
              playSoundEffect("correct");
              setScore((s) => s + 100);
              pickNextTarget();
            } else {
              playSoundEffect("wrong");
              setScore((s) => Math.max(0, s - 30));
            }
            return;
          }

          // Lolos ke bawah
          if (newY < 100) {
            nextItems.push({ ...item, yPercent: newY });
          }
        });

        return nextItems;
      });
    }, 40);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(gravityTimer);
    };
  }, [isPlaying, basketLane, targetHarakat]);

  const moveLane = (lane: number) => {
    tapFeedback();
    setBasketLane(lane);
  };

  return (
    <NgajiCeriaLayout title="Harakat Rush" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-3 bg-[#FFF8EE] h-[calc(100vh-70px)] flex flex-col justify-between overflow-hidden">
        {/* Top Game Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-[#E2D4C0] shadow-sm shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Waktu:</span>
            <span className="text-base font-black text-[#D32F2F]">{timeLeft}d</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF3E4] border border-[#FCDCB8]">
            <span className="text-[11px] font-black text-[#8C4A14]">
              Tangkap: <span className="underline decoration-2">{targetHarakat.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Skor:</span>
            <span className="text-lg font-black text-[#F58A3A]">{score}</span>
          </div>
        </div>

        {!isPlaying && !isGameOver ? (
          <div className="bg-white rounded-[28px] p-6 text-center border-2 border-[#E2D4C0] shadow-md space-y-4 my-auto max-w-sm mx-auto w-full">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#EAF6FB] border-2 border-[#BCE3F5] flex items-center justify-center">
              <span className="font-arabic text-5xl font-black text-[#1C5D79]">بَ</span>
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#5A3A2A]">Harakat Rush</h3>
              <p className="text-xs text-[#8C7A68] mt-1 leading-relaxed max-w-xs mx-auto">
                Geser huruf di bawah ke 3 jalur (Kiri, Tengah, Kanan) untuk menangkap harakat yang diminta sebelum waktu habis!
              </p>
            </div>
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-[#1C5D79] hover:bg-[#134257] text-white font-black text-sm shadow-md border-b-4 border-[#103445] active:scale-98 transition-all"
            >
              Mulai Tangkap
            </button>
          </div>
        ) : isGameOver ? (
          <div className="bg-white rounded-[28px] p-6 text-center border-2 border-[#E2D4C0] shadow-md space-y-4 my-auto max-w-sm mx-auto w-full">
            <div className="w-16 h-16 rounded-full bg-[#FFCB45] border-2 border-[#B8590C]/20 mx-auto flex items-center justify-center">
              <Trophy size={28} className="text-[#5A3A2A]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={10} />
                Waktu Selesai
              </div>
              <h3 className="font-display font-black text-xl text-[#5A3A2A]">Bagus Sekali!</h3>
              <p className="text-xs text-[#8C7A68] mt-1">Skor tangkapan harakat: {score}</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={startGame}
                className="flex-1 py-3 rounded-2xl bg-[#1C5D79] text-white font-black text-sm shadow-md border-b-4 border-[#103445] active:translate-y-1 transition-all"
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
        ) : (
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            {/* Arena 3 Lane (Full Height) */}
            <div className="relative flex-1 bg-gradient-to-b from-[#EBF5FB] via-[#F2FAFD] to-[#DDF0FA] rounded-3xl border-2 border-[#BCE3F5] overflow-hidden shadow-inner flex flex-col">
              {/* Divider Garis Jalur */}
              <div className="absolute inset-0 grid grid-cols-3 pointer-events-none">
                <div className="border-r-2 border-dashed border-[#BCE3F5]/60" />
                <div className="border-r-2 border-dashed border-[#BCE3F5]/60" />
                <div />
              </div>

              {/* Falling Harakat Items */}
              {items.map((item) => (
                <div
                  key={item.uid}
                  className="absolute transition-all duration-75 flex items-center justify-center pointer-events-none"
                  style={{
                    left: `${item.lane * 33.33}%`,
                    width: "33.33%",
                    top: `${item.yPercent}%`,
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#1C5D79] shadow-md flex items-center justify-center">
                    <span className="font-arabic text-2xl font-black text-[#1C5D79] select-none">
                      {item.harakat.symbol}
                    </span>
                  </div>
                </div>
              ))}

              {/* Basket Huruf Bergerak di Bawah Arena */}
              <div
                className="absolute bottom-3 transition-all duration-150 flex items-center justify-center pointer-events-none"
                style={{
                  left: `${basketLane * 33.33}%`,
                  width: "33.33%",
                }}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FFCB45] border-4 border-white shadow-xl flex flex-col items-center justify-center">
                  <span className="font-arabic text-3xl font-black text-[#5A3A2A] leading-tight">
                    {currentLetter.char}
                  </span>
                  <span className="text-[9px] font-black text-[#5A3A2A]/80 uppercase">
                    {currentLetter.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Kontrol 3 Tombol Tap */}
            <div className="grid grid-cols-3 gap-3 pt-3 shrink-0">
              {[0, 1, 2].map((lane) => (
                <button
                  key={lane}
                  onClick={() => moveLane(lane)}
                  className={`py-3.5 rounded-2xl font-black text-sm border-2 transition-transform active:scale-95 shadow-md ${
                    basketLane === lane
                      ? "bg-[#1C5D79] text-white border-[#103445] shadow-lg"
                      : "bg-white text-[#5A3A2A] border-[#E2D4C0]"
                  }`}
                >
                  {lane === 0 ? "◀ Kiri" : lane === 1 ? "▲ Tengah" : "Kanan ▶"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </NgajiCeriaLayout>
  );
}
