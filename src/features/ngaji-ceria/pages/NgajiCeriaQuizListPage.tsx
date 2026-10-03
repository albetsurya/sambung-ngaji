import React from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { ChevronRight, Sparkles, Star, Lock, Play } from "../../../components/ui/FontAwesomeIcons";

interface QuizBookProps {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  coverImage: string;
  totalQuestions: number;
  completedQuestions: number;
  stars: number;
  isLocked?: boolean;
  onClick: () => void;
}

function StandaloneQuizBookCard({
  title,
  subtitle,
  level,
  coverImage,
  totalQuestions,
  completedQuestions,
  stars,
  isLocked = false,
  onClick,
}: QuizBookProps) {
  const isCompleted = completedQuestions === totalQuestions;
  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <div className="flex items-center gap-4 group">
      {/* Standalone Book Illustration Card */}
      <button
        onClick={onClick}
        disabled={isLocked}
        className={`relative shrink-0 w-24 h-32 transition-all duration-300 group-hover:scale-105 active:scale-95 ${
          isLocked ? "cursor-not-allowed opacity-60 grayscale" : "cursor-pointer drop-shadow-lg"
        }`}
      >
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-contain filter drop-shadow-md"
        />
        {isLocked ? (
          <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-[#5A3A2A]/80 text-white flex items-center justify-center border border-white/40 shadow-sm">
            <Lock size={14} />
          </div>
        ) : (
          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#F58A3A] text-white flex items-center justify-center border border-white shadow-sm">
            <Play size={10} className="ml-0.5 fill-white" />
          </div>
        )}
      </button>

      {/* Details next to book */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E2EFCF] text-[#2D5A27] border border-[#2D5A27]/20">
            {level}
          </span>
          {isCompleted && (
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCB45] text-[#5A3A2A]">
              Selesai
            </span>
          )}
        </div>

        <h3 className="font-display font-black text-base text-[#5A3A2A] truncate">
          {title}
        </h3>
        <p className="text-xs text-[#8C5A3A] line-clamp-1 mt-0.5">
          {subtitle}
        </p>

        {/* Stars and Progress */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((starIdx) => (
              <img
                key={starIdx}
                src={
                  starIdx <= stars
                    ? NGAJI_CERIA_ASSETS.bintang
                    : NGAJI_CERIA_ASSETS.bintangKosong
                }
                alt="Star"
                className="w-4 h-4 object-contain"
              />
            ))}
          </div>

          <span className="text-xs font-black text-[#F58A3A]">
            {completedQuestions}/{totalQuestions} Soal
          </span>
        </div>

        {/* Progress Bar Line */}
        {!isLocked && (
          <div className="w-full bg-[#E2D4C0] rounded-full h-1.5 mt-2 overflow-hidden border border-[#C8B8A2]">
            <div
              className="bg-[#F58A3A] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {!isLocked && (
        <button
          onClick={onClick}
          className="shrink-0 w-8 h-8 rounded-full bg-[#F58A3A] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

export default function NgajiCeriaQuizListPage() {
  const navigate = useNavigate();

  const quizBooks = [
    {
      id: "jilid-1-tebak",
      title: "Kitab Tebak Bacaan Jilid 1",
      subtitle: "Latihan membaca suku kata fathah tunggal (Ta, Ba, A).",
      level: "Tilawati Jilid 1",
      coverImage: NGAJI_CERIA_ASSETS.jilidCovers[1],
      totalQuestions: 14,
      completedQuestions: 4,
      stars: 2,
      isLocked: false,
    },
    {
      id: "jilid-2-sambung",
      title: "Kitab Huruf Sambung Jilid 2",
      subtitle: "Membaca dua huruf bersambung dan harakat kasrah.",
      level: "Tilawati Jilid 2",
      coverImage: NGAJI_CERIA_ASSETS.jilidCovers[2],
      totalQuestions: 15,
      completedQuestions: 0,
      stars: 0,
      isLocked: false,
    },
    {
      id: "jilid-3-mad",
      title: "Kitab Mad & Panjang Jilid 3",
      subtitle: "Mengenal bacaan panjang (Mad Thabi'i) & fathatain.",
      level: "Tilawati Jilid 3",
      coverImage: NGAJI_CERIA_ASSETS.jilidCovers[3],
      totalQuestions: 20,
      completedQuestions: 0,
      stars: 0,
      isLocked: true,
    },
    {
      id: "tebak-juz-amma",
      title: "Kitab Tebak Juz 'Amma",
      subtitle: "Tebak nama surah & ayat-ayat pendek juz 30.",
      level: "Pengayaan",
      coverImage: NGAJI_CERIA_ASSETS.bukuJuzAmma,
      totalQuestions: 10,
      completedQuestions: 0,
      stars: 0,
      isLocked: true,
    },
  ];

  return (
    <NgajiCeriaLayout title="Kuis Kartu Tilawati">
      <div className="px-4 py-4 space-y-6 bg-[#FFF8EE] min-h-full rounded-t-3xl">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#5A3A2A] to-[#3E2518] border-2 border-[#3E2518] p-5 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 bg-white/10 rounded-2xl p-2 shadow-md border border-white/20 rotate-2">
              <img
                src={NGAJI_CERIA_ASSETS.tebakSurahBaru}
                alt="Kuis Kartu"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFCB45] text-[#5A3A2A] text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles size={10} />
                Tantangan Interaktif
              </div>
              <h2 className="font-display text-lg font-black text-white">
                Pilih Kitab Kuis Kartu
              </h2>
              <p className="text-xs text-white/80 leading-tight mt-0.5">
                Uji kelancaran membaca tajwid & irama Tilawati lewat pilihan kitab di bawah.
              </p>
            </div>
          </div>
        </section>

        {/* List Card Kitab */}
        <section className="space-y-5">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#8C5A3A] px-1">
            Daftar Kitab Kuis Kartu
          </h3>

          <div className="space-y-4 divide-y divide-[#E2D4C0] pt-1">
            {quizBooks.map((book) => (
              <div key={book.id} className="pt-4 first:pt-0">
                <StandaloneQuizBookCard
                  {...book}
                  onClick={() => navigate("/member/ngaji-ceria/quiz/play")}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </NgajiCeriaLayout>
  );
}
