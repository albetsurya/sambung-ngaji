import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { tapFeedback } from "../../../lib/haptics";
import { Trophy, Sparkles, Check, X, RefreshCw } from "../../../components/ui/FontAwesomeIcons";

interface WordPuzzle {
  id: number;
  wordArabic: string;
  wordLatin: string;
  tiles: { id: string; char: string; name: string }[];
}

const PUZZLE_DATA: WordPuzzle[] = [
  {
    id: 1,
    wordArabic: "كَتَبَ",
    wordLatin: "Kataba",
    tiles: [
      { id: "1-1", char: "كَ", name: "Ka" },
      { id: "1-2", char: "تَ", name: "Ta" },
      { id: "1-3", char: "بَ", name: "Ba" },
    ],
  },
  {
    id: 2,
    wordArabic: "قَرَأَ",
    wordLatin: "Qora'a",
    tiles: [
      { id: "2-1", char: "قَ", name: "Qo" },
      { id: "2-2", char: "رَ", name: "Ro" },
      { id: "2-3", char: "أَ", name: "A" },
    ],
  },
  {
    id: 3,
    wordArabic: "دَرَسَ",
    wordLatin: "Darasa",
    tiles: [
      { id: "3-1", char: "دَ", name: "Da" },
      { id: "3-2", char: "رَ", name: "Ro" },
      { id: "3-3", char: "سَ", name: "Sa" },
    ],
  },
  {
    id: 4,
    wordArabic: "فَتَحَ",
    wordLatin: "Fataha",
    tiles: [
      { id: "4-1", char: "فَ", name: "Fa" },
      { id: "4-2", char: "تَ", name: "Ta" },
      { id: "4-3", char: "حَ", name: "Ha" },
    ],
  },
];

export default function SusunKataGamePage() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const puzzle = PUZZLE_DATA[currentIdx];

  // Slot pilihan pengguna (Urutan Kanan ke Kiri untuk Arab)
  const [placedTiles, setPlacedTiles] = useState<{ id: string; char: string; name: string }[]>([]);
  // Bank kepingan acak di bawah
  const [availableTiles, setAvailableTiles] = useState<{ id: string; char: string; name: string }[]>(
    () => [...puzzle.tiles].sort(() => Math.random() - 0.5)
  );

  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

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
      setStatus("correct");
      setScore((s) => s + 150);
    } else {
      setStatus("wrong");
    }
  };

  const handleNext = () => {
    tapFeedback();
    if (currentIdx < PUZZLE_DATA.length - 1) {
      loadPuzzle(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restart = () => {
    setScore(0);
    setIsFinished(false);
    loadPuzzle(0);
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
    <NgajiCeriaLayout title="Susun Kata" hideNav showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
      <div className="px-4 py-4 space-y-4 bg-[#FFF8EE] min-h-[calc(100vh-70px)] flex flex-col justify-between">
        {/* Top Game Bar */}
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Soal:</span>
            <span className="text-base font-black text-[#5A3A2A]">
              {currentIdx + 1}/{PUZZLE_DATA.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E2EFCF] border border-[#BCE3F5]">
            <span className="text-[11px] font-black text-[#2D5A27]">
              Lafadz: <span className="underline">{puzzle.wordLatin}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#8C7A68]">Skor:</span>
            <span className="text-lg font-black text-[#F58A3A]">{score}</span>
          </div>
        </div>

        {/* Word Display & Slot Drop Target */}
        <div className="bg-white rounded-[28px] p-6 text-center border-2 border-[#E2D4C0] shadow-md space-y-6">
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF3E4] text-[#8C4A14] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={11} />
              Susun Huruf Sesuai Urutan
            </div>
            <h2 className="font-display font-black text-2xl text-[#5A3A2A]">"{puzzle.wordLatin}"</h2>
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
