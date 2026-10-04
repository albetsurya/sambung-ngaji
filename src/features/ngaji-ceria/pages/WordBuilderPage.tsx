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
    wordArabic: "اَ بَ اَ",
    wordLatin: "a - ba - a",
    nada: "turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b4_2_a_ba_a.ogg",
    tiles: [
      { id: "2-1", char: "اَ", name: "a" },
      { id: "2-2", char: "بَ", name: "ba" },
      { id: "2-3", char: "اَ", name: "a" },
    ],
  },
  {
    id: 3,
    wordArabic: "اَ بَ بَ",
    wordLatin: "a - ba - ba",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b5_1_a_ba_ba.ogg",
    tiles: [
      { id: "3-1", char: "اَ", name: "a" },
      { id: "3-2", char: "بَ", name: "ba" },
      { id: "3-3", char: "بَ", name: "ba" },
    ],
  },
  {
    id: 4,
    wordArabic: "بَ بَ بَ",
    wordLatin: "ba - ba - ba",
    nada: "turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b3_2_ba_ba_ba.ogg",
    tiles: [
      { id: "4-1", char: "بَ", name: "ba" },
      { id: "4-2", char: "بَ", name: "ba" },
      { id: "4-3", char: "بَ", name: "ba" },
    ],
  },
  {
    id: 5,
    wordArabic: "بَ اَ بَ",
    wordLatin: "ba - a - ba",
    nada: "turun",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b5_2_ba_a_ba.ogg",
    tiles: [
      { id: "5-1", char: "بَ", name: "ba" },
      { id: "5-2", char: "اَ", name: "a" },
      { id: "5-3", char: "بَ", name: "ba" },
    ],
  },
  {
    id: 6,
    wordArabic: "بَ بَ اَ",
    wordLatin: "ba - ba - a",
    nada: "datar",
    audioUrl: "/audio/tilawati/jilid_1/hal1/h1_b4_1_ba_ba_a.ogg",
    tiles: [
      { id: "6-1", char: "بَ", name: "ba" },
      { id: "6-2", char: "بَ", name: "ba" },
      { id: "6-3", char: "اَ", name: "a" },
    ],
  },
];

export default function WordBuilderPage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const puzzle = PUZZLE_DATA[currentIdx];

  // Slot pilihan pengguna (Urutan Kanan ke Kiri untuk Arab)
  const [placedTiles, setPlacedTiles] = useState<{ id: string; char: string; name: string }[]>([]);
  // Bank kepingan acak di bawah
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

  // Auto-play audio on puzzle change
  useEffect(() => {
    handlePlayAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const restart = () => {
    setScore(0);
    setIsFinished(false);
    loadPuzzle(0);
  };

  const renderToneBadge = () => {
    if (puzzle.nada === "datar") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-xs font-black tracking-wide border border-[#2D5A27]/20">
          <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse" />
          Rost: Datar
        </span>
      );
    }
    if (puzzle.nada === "naik") {
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

  if (isFinished) {
    return (
      <NgajiCeriaLayout title="Word Builder" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
        <div className="px-4 py-10 flex flex-col items-center">
          <div className="bg-white rounded-[28px] p-8 text-center border-2 border-[#E2D4C0] shadow-md space-y-4 max-w-sm w-full">
            <div className="w-16 h-16 rounded-full bg-[#FFCB45] border-2 border-[#B8590C]/20 mx-auto flex items-center justify-center">
              <Trophy size={28} className="text-[#5A3A2A]" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#5A3A2A]">Hebat Sekali!</h3>
              <p className="text-xs text-[#8C7A68] mt-1">Kamu berhasil menyusun semua kata Arab. Skor: {score}</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={restart}
                className="flex-1 py-3 rounded-2xl bg-[#2D5A27] text-white font-black text-sm shadow-md border-b-4 border-[#1A3816] active:translate-y-1 transition-all"
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
    <NgajiCeriaLayout title="Word Builder" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-4 space-y-4 bg-[#FFF8EE] min-h-[calc(100vh-70px)] flex flex-col justify-between">
        {/* Top Game Bar */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Soal:</span>
            <span className="text-base font-black text-[#5A3A2A]">
              {currentIdx + 1}/{PUZZLE_DATA.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {renderToneBadge()}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Skor:</span>
            <span className="text-lg font-black text-[#F58A3A]">{score}</span>
          </div>
        </div>

        {/* Word Display & Slot Drop Target */}
        <div className="bg-white rounded-[28px] p-6 text-center border-2 border-[#E2D4C0] shadow-md space-y-6 relative">
          {/* Audio Button */}
          <button
            onClick={handlePlayAudio}
            className={`absolute top-4 right-4 w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isAudioPlaying
                ? "bg-[#F58A3A] text-white scale-110 shadow-lg"
                : "bg-[#FCE6DA] text-[#F58A3A] hover:bg-[#F58A3A]/20 active:scale-95"
            }`}
            title="Dengarkan lafadz"
          >
            <Volume2
              size={20}
              className={isAudioPlaying ? "animate-pulse" : ""}
            />
          </button>

          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF3E4] text-[#8C4A14] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={11} />
              Dengarkan & Susun Huruf
            </div>
            <h2 className="font-display font-black text-2xl text-[#5A3A2A]">"{puzzle.wordLatin}"</h2>
            <p className="text-[11px] text-[#8C7A68] mt-1">
              Sentuh ikon speaker untuk memutar audio nada Rost
            </p>
          </div>

          {/* Slots (RTL display) */}
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
                      ? status === "correct"
                        ? "bg-[#E2EFCF] border-[#2D5A27] text-[#2D5A27] shadow-md"
                        : status === "wrong"
                        ? "bg-[#FCEAEA] border-[#D32F2F] text-[#D32F2F] shadow-md"
                        : "bg-[#FFF3E4] border-[#F58A3A] text-[#5A3A2A] shadow-md active:scale-95"
                      : "bg-[#FBF8F1] border-dashed border-[#E2D4C0] text-transparent"
                  }`}
                >
                  {tile ? tile.char : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available Tiles Bank */}
        <div className="space-y-3">
          <p className="text-xs font-black text-[#8C7A68] text-center">
            Pilih kepingan suku kata di bawah:
          </p>
          <div className="flex justify-center gap-3">
            {availableTiles.map((tile) => (
              <button
                key={tile.id}
                disabled={status !== "idle"}
                onClick={() => handlePickTile(tile)}
                className="w-16 h-16 rounded-2xl bg-white border-2 border-[#E2D4C0] hover:border-[#F58A3A] shadow-md flex items-center justify-center font-arabic text-3xl font-black text-[#5A3A2A] active:scale-95 transition-all"
              >
                {tile.char}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 pb-4">
          {status === "idle" ? (
            <button
              disabled={placedTiles.length !== puzzle.tiles.length}
              onClick={handleCheck}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all shadow-lg ${
                placedTiles.length === puzzle.tiles.length
                  ? "bg-[#2D5A27] text-white border-b-4 border-[#1A3816] active:translate-y-1"
                  : "bg-[#E2D4C0] text-[#8C7A68] cursor-not-allowed"
              }`}
            >
              Periksa Susunan
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
              {currentIdx < PUZZLE_DATA.length - 1
                ? status === "correct"
                  ? "Benar! Lanjut →"
                  : "Coba Lanjut →"
                : "Lihat Hasil Akhir"}
            </button>
          )}
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
