import React from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { ChevronRight, Sparkles, Star } from "../../../components/ui/FontAwesomeIcons";

interface QuizBookCardProps {
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

function QuizBookCard({
  title,
  subtitle,
  level,
  coverImage,
  totalQuestions,
  completedQuestions,
  stars,
  isLocked = false,
  onClick,
}: QuizBookCardProps) {
  const isCompleted = completedQuestions === totalQuestions;
  const progressPercent = Math.round((completedQuestions / totalQuestions) * 100);

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full text-left relative overflow-hidden rounded-3xl p-5 border-2 transition-all duration-200 active:scale-[0.98] shadow-md flex items-center gap-4 ${
        isLocked
          ? "bg-surface-card2 text-surface-muted border-surface-border opacity-75 cursor-not-allowed"
          : "bg-surface-card hover:bg-surface-card/90 border-accent/30 hover:border-accent text-surface-text"
      }`}
    >
      {/* Visual Book/Kitab Ornament / Illustration */}
      <div className="relative shrink-0 w-20 h-24 bg-gradient-to-br from-accent-soft to-surface-card2 rounded-2xl border-2 border-accent/20 p-2 shadow-inner flex flex-col items-center justify-center overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className={`w-14 h-14 object-contain transition-transform group-hover:scale-110 ${
            isLocked ? "grayscale opacity-50" : ""
          }`}
        />
        {isLocked && (
          <img
            src={NGAJI_CERIA_ASSETS.kartuTerkunci}
            alt="Terkunci"
            className="absolute inset-0 m-auto w-8 h-8 object-contain"
          />
        )}
      </div>

      {/* Card Info Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isLocked
                ? "bg-surface-card text-surface-muted"
                : "bg-accent-soft text-accent"
            }`}
          >
            {level}
          </span>
          {isCompleted && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-success-soft text-success">
              Selesai
            </span>
          )}
        </div>

        <h3 className="font-display font-black text-base text-surface-text truncate">
          {title}
        </h3>
        <p className="text-xs text-surface-muted line-clamp-1 mt-0.5">
          {subtitle}
        </p>

        {/* Stars and Progress */}
        <div className="mt-3 flex items-center justify-between">
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

          <span className="text-xs font-bold text-accent">
            {completedQuestions}/{totalQuestions} Soal
          </span>
        </div>

        {/* Progress Bar Line */}
        {!isLocked && (
          <div className="w-full bg-surface-card2 rounded-full h-1.5 mt-2 overflow-hidden border border-surface-border">
            <div
              className="bg-accent h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {!isLocked && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
          <ChevronRight size={18} />
        </div>
      )}
    </button>
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
      coverImage: NGAJI_CERIA_ASSETS.kartuHuruf,
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
      coverImage: NGAJI_CERIA_ASSETS.kartuMatchCocok,
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
      coverImage: NGAJI_CERIA_ASSETS.kartuAcak,
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
      coverImage: NGAJI_CERIA_ASSETS.kartuTebakJuz,
      totalQuestions: 10,
      completedQuestions: 0,
      stars: 0,
      isLocked: true,
    },
  ];

  return (
    <NgajiCeriaLayout title="Kuis Kartu Tilawati">
      <div className="px-4 py-4 space-y-5">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-surface-card to-accent/10 border-2 border-accent/30 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 bg-white rounded-2xl p-2 shadow-md border border-accent/20 rotate-2">
              <img
                src={NGAJI_CERIA_ASSETS.tebakSurahBaru}
                alt="Kuis Kartu"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles size={10} />
                Tantangan Interaktif
              </div>
              <h2 className="font-display text-lg font-black text-surface-text">
                Pilih Kitab Kuis Kartu
              </h2>
              <p className="text-xs text-surface-muted leading-tight mt-0.5">
                Uji kelancaran membaca tajwid & irama Tilawati lewat pilihan kitab di bawah.
              </p>
            </div>
          </div>
        </section>

        {/* List Card Kitab */}
        <section className="space-y-4">
          <h3 className="font-black text-xs uppercase tracking-wider text-surface-muted px-1">
            Daftar Kitab Kuis Kartu
          </h3>

          <div className="space-y-3">
            {quizBooks.map((book) => (
              <QuizBookCard
                key={book.id}
                {...book}
                onClick={() => navigate("/member/ngaji-ceria/quiz/play")}
              />
            ))}
          </div>
        </section>
      </div>
    </NgajiCeriaLayout>
  );
}