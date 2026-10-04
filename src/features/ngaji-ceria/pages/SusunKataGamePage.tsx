import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { playAudioUrl, playSoundEffect } from "../utils/audioPlayer";
import { tapFeedback } from "../../../lib/haptics";
import { Trophy, Sparkles, Check, X, RefreshCw, Volume2 } from "../../../components/ui/FontAwesomeIcons";

interface WordPuzzle {
  id: number;
  wordArabic: string;
  wordLatin: string;
  nada: "datar" | "naik" | "turun";
  audioUrl: string;
  tiles: { id: string; char: string; name: string }[];
}

// Data game diambil dari setiap akhir baris atau baris fokus halaman 1-5
const PUZZLE_DATA: WordPuzzle[] = [
  {
    id: 1,
    wordArabic: "اَ بَ",
    wordLatin: "a - ba",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b0_header_a_ba.ogg",
    tiles: [
      { id: "1-1", char: "اَ", name: "a" },
      { id: "1-2", char: "بَ", name: "ba" },
    ],
  },
  {
    id: 2,
    wordArabic: "اَ بَ تَ",
    wordLatin: "a - ba - ta",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal2/h2_b0_header_a_ba_ta.ogg",
    tiles: [
      { id: "2-1", char: "اَ", name: "a" },
      { id: "2-2", char: "بَ", name: "ba" },
      { id: "2-3", char: "تَ", name: "ta" },
    ],
  },
  {
    id: 3,
    wordArabic: "بَ تَ ثَ",
    wordLatin: "ba - ta - tsa",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal3/h3_b0_header_ba_ta_tsa.ogg",
    tiles: [
      { id: "3-1", char: "بَ", name: "ba" },
      { id: "3-2", char: "تَ", name: "ta" },
      { id: "3-3", char: "ثَ", name: "tsa" },
    ],
  },
  {
    id: 4,
    wordArabic: "جَ حَ",
    wordLatin: "ja - ha",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal4/h4_b0_header_ja_ha.ogg",
    tiles: [
      { id: "4-1", char: "جَ", name: "ja" },
      { id: "4-2", char: "حَ", name: "ha" },
    ],
  },
  {
    id: 5,
    wordArabic: "خَ بَ ثَ",
    wordLatin: "kha - ba - tsa",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal5/h5_b0_header_kha_ba_tsa.ogg",
    tiles: [
      { id: "5-1", char: "خَ", name: "kha" },
      { id: "5-2", char: "بَ", name: "ba" },
      { id: "5-3", char: "ثَ", name: "tsa" },
    ],
  },
];

export default function SusunKataGamePage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const puzzle = PUZZLE_DATA[currentIdx];

  const [placedTiles, setPlacedTiles] = useState<{ id: string; char: string; name: string }[]>([]);
  const [availableTiles, setAvailableTiles] = useState<{ id: string; char: string; name: string }[]>(
    () => [...puzzle.tiles].sort(() => Math.random() - 0.5)
  );

  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const handlePlayAudio = () => {
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    tapFeedback();
    playAudioUrl(puzzle.audioUrl, () => {
      setIsAudioPlaying(false);
    });
  };

  useEffect(() => {
    handlePlayAudio();
  }, [currentIdx]);

  const loadPuzzle = (idx: number) => {
    const nextPuzzle = PUZZLE_DATA[idx];
    setCurrentIdx(idx);
    setPlacedTiles([]);
    setAvailableTiles([...nextPuzzle.tiles].sort(() => Math.random() - 0.5));
    setStatus("idle");
  };

  const handlePickTile = (tile: { id: string; char: string; name: string }) => {
    if (status !== "idle") return;
    tapFeedback();
    setPlacedTiles((prev) => [...prev, tile]);
    setAvailableTiles((prev) => prev.filter((t) => t.id !== tile.id));
  };

  const handleRemoveTile = (tile: { id: string; char: string; name: string }) => {
    if (status !== "idle") return;
    tapFeedback();
    setPlacedTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setAvailableTiles((prev) => [...prev, tile]);
  };

  const handleCheck = () => {
    if (placedTiles.length !== puzzle.tiles.length) return;
    tapFeedback();

    const isMatch = placedTiles.every((t, i) => t.id === puzzle.tiles[i].id);
    if (isMatch) {
      playSoundEffect("correct");
      setStatus("correct");
      setScore((s) => s + 150);
    } else {
      playSoundEffect("wrong");
      setStatus("wrong");
    }
  };

  const handleNext = () => {
    tapFeedback();
    if (currentIdx < PUZZLE_DATA.length - 1) {
      loadPuzzle(currentIdx + 1);
    } else {
      playSoundEffect("win");
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    tapFeedback();
    setPlacedTiles([]);
    setAvailableTiles([...puzzle.tiles].sort(() => Math.random() - 0.5));
    setStatus("idle");
  };

  const restart = () => {
    setScore(0);
    setIsFinished(false);
    loadPuzzle(0);
  };

  const renderToneBadge = () => {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-xs font-black tracking-wide border border-[#2D5A27]/20">
        <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse" />
        Rost: Datar
      </span>
    );
  };

  if (isFinished) {
    return (
      <NgajiCeriaLayout title="Susun Kata" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
        <div className="px-4 py-10 flex flex-col items-center">
          <div className="bg-white rounded-[28px] p-8 text-center border-2 border-[#E2D4C0] shadow-md space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-[#FFCB45] border-2 border-[#B8590C]/20 mx-auto flex items-center justify-center">
              <Trophy size={28} className="text-[#5A3A2A]" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#5A3A2A]">Hebat Sekali!</h3>
              <p className="text-xs text-[#8C7A68] mt-1">Kamu berhasil menyusun semua kata. Skor: {score}</p>
            </div>
            <button
              onClick={restart}
              className="w-full py-3 rounded-2xl bg-[#2D5A27] text-white font-black text-sm shadow-md border-b-4 border-[#1A3816] active:translate-y-1 transition-all"
            >
              Main Lagi
            </button>
          </div>
        </div>
      </NgajiCeriaLayout>
    );
  }

  return (
    <NgajiCeriaLayout title="Susun Kata" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-4 space-y-4 bg-[#FFF8EE] min-h-[calc(100vh-70px)] flex flex-col justify-between">
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Soal:</span>
            <span className="text-base font-black text-[#5A3A2A]">{currentIdx + 1}/{PUZZLE_DATA.length}</span>
          </div>
          {renderToneBadge()}
        </div>

        <div className="bg-white rounded-[28px] p-6 text-center border-2 border-[#E2D4C0] shadow-md space-y-6 relative">
          <button
            onClick={handlePlayAudio}
            className={`absolute top-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isAudioPlaying ? "bg-[#F58A3A] text-white scale-110 shadow-lg" : "bg-[#FCE6DA] text-[#F58A3A] hover:bg-[#F58A3A]/20 active:scale-95"
            }`}
          >
            <Volume2 size={20} className={isAudioPlaying ? "animate-pulse" : ""} />
          </button>
          <div>
            <h2 className="font-display font-black text-2xl text-[#5A3A2A]">"{puzzle.wordLatin}"</h2>
          </div>

          <div className="flex justify-center items-center gap-3 min-h-[72px]" dir="rtl">
            {Array.from({ length: puzzle.tiles.length }).map((_, idx) => {
              const tile = placedTiles[idx];
              return (
                <button
                  key={idx}
                  disabled={!tile || status !== "idle"}
                  onClick={() => tile && handleRemoveTile(tile)}
                  className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-arabic text-3xl font-black transition-all ${
                    tile
                      ? status === "correct" ? "bg-[#E2EFCF] border-[#2D5A27] text-[#2D5A27]" 
                      : status === "wrong" ? "bg-[#FCEAEA] border-[#D32F2F] text-[#D32F2F]" 
                      : "bg-[#FFF3E4] border-[#F58A3A] text-[#5A3A2A]"
                      : "bg-[#FBF8F1] border-dashed border-[#E2D4C0] text-transparent"
                  }`}
                >
                  {tile ? tile.char : ""}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                disabled={status !== "idle"}
                onClick={() => handlePickTile(tile)}
                className="w-16 h-16 rounded-2xl bg-white border-2 border-[#E2D4C0] shadow-md flex items-center justify-center font-arabic text-3xl font-black text-[#5A3A2A] active:scale-95 transition-all"
              >
                {tile.char}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 pb-4">
          <button
            disabled={status !== "idle" || placedTiles.length !== puzzle.tiles.length}
            onClick={status === "idle" ? handleCheck : (status === "correct" ? handleNext : handleRetry)}
            className={`w-full py-4 rounded-2xl font-black text-base text-white transition-all shadow-lg active:scale-[0.98] border-b-4 ${
              status === "idle" ? (placedTiles.length === puzzle.tiles.length ? "bg-[#2D5A27] border-[#1A3816]" : "bg-[#E2D4C0] text-[#8C7A68]")
              : status === "correct" ? "bg-[#2D5A27] border-[#1A3816]" : "bg-[#F58A3A] border-[#C4430E]"
            }`}
          >
            {status === "idle" ? "Periksa Susunan" : (status === "correct" ? (currentIdx < PUZZLE_DATA.length - 1 ? "Benar! Lanjut →" : "Selesai") : "Coba Lagi")}
          </button>
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
