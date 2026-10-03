import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Sparkles,
  Play,
  ChevronRight,
  BookOpen,
  Volume2,
} from "../../../components/ui/FontAwesomeIcons";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { MascotStar, CrownBadge, RostToneIcon } from "../components/NgajiCeriaIllustrations";

interface StreakDayProps {
  day: string;
  isCompleted: boolean;
}

function StreakDay({ day, isCompleted }: StreakDayProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
          isCompleted
            ? "bg-accent text-white scale-105 shadow-accent/30"
            : "bg-surface-card text-surface-muted border border-surface-border"
        }`}
      >
        {isCompleted ? "✓" : day.slice(0, 1)}
      </div>
      <span className="text-[10px] font-semibold text-surface-muted">{day}</span>
    </div>
  );
}

export default function NgajiCeriaHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(" ")[0] : "Sobat Ceria";

  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);
  const { streakDays, currentStreak } = useNgajiCeriaStreak();

  const currentJilidObj = useMemo(() => {
    return TILAWATI_DATA.find((j) => j.id === currentJilid);
  }, [currentJilid]);

  return (
    <NgajiCeriaLayout title="Ngaji Ceria">
      <div className="px-4 py-4 space-y-4">
        {/* Playful Hero Card with Mascot */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-surface-card to-accent/10 border-2 border-accent/30 p-5 shadow-lg shadow-accent/5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-sm">
                <Sparkles size={11} />
                Metode Tilawati
              </div>
              <h2 className="font-display text-xl font-black text-surface-text tracking-tight">
                Hai, {displayName}! 👋
              </h2>
              <p className="text-ios-caption text-surface-muted mt-0.5">
                Siap ngaji dengan lagu Rost hari ini?
              </p>
            </div>
            {/* Cute Mascot */}
            <div className="relative shrink-0">
              <MascotStar className="w-18 h-18 animate-bounce" />
            </div>
          </div>

          {/* Current Level Progress */}
          <div className="mt-4 pt-3 border-t border-accent/20">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-surface-text">
                {currentJilidObj ? currentJilidObj.nama : "Tilawati Jilid 1"} • Halaman {currentPage}
              </span>
              <span className="text-accent font-extrabold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-surface-card2 rounded-full h-3.5 p-0.5 border border-surface-border">
              <div
                className="bg-gradient-to-r from-accent to-accent-light h-full rounded-full transition-all duration-700 shadow-inner"
                style={{ width: `${Math.max(progressPercentage, 8)}%` }}
              />
            </div>
          </div>
        </section>

        {/* Big Action: Start Lesson */}
        <button
          onClick={() => navigate("/member/ngaji-ceria/quiz")}
          className="w-full rounded-3xl p-4 bg-accent text-white shadow-xl shadow-accent/25 flex items-center justify-between gap-4 transition-all duration-200 active:scale-[0.98] hover:brightness-105"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-sm">
              <Play size={20} />
            </div>
            <div className="text-left">
              <span className="block font-black text-base text-white tracking-tight">
                Mulai Sesi Ngaji Kartu
              </span>
              <span className="block text-xs text-white/80 font-medium">
                Latihan Huruf: Ta, Ba, A (Lagu Rost)
              </span>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/80" />
        </button>

        {/* Streak Tracker Section */}
        <section className="bg-surface-card rounded-3xl border border-surface-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-surface-text">
                Streak Mengaji
              </h3>
              <p className="text-[11px] text-surface-muted">
                Pertahankan konsistensi belajarmu
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-warning-soft text-warning font-black text-xs">
              🔥 {currentStreak} Hari
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, idx) => (
              <StreakDay
                key={day}
                day={day}
                isCompleted={streakDays[idx] || false}
              />
            ))}
          </div>
        </section>

        {/* Feature Grid: Learning Path, Quiz & Rost Practice */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/member/ngaji-ceria/path")}
            className="bg-surface-card border-2 border-surface-border hover:border-accent/50 rounded-3xl p-4 text-left transition-all active:scale-[0.97] shadow-sm flex flex-col justify-between h-36"
          >
            <div className="w-11 h-11 rounded-2xl bg-info-soft text-info flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <span className="block font-bold text-sm text-surface-text">
                Peta Jelajah
              </span>
              <span className="block text-[11px] text-surface-muted">
                Jilid 1 sampai 6
              </span>
            </div>
          </button>

          <button
            onClick={() => navigate("/member/ngaji-ceria/quiz")}
            className="bg-surface-card border-2 border-surface-border hover:border-accent/50 rounded-3xl p-4 text-left transition-all active:scale-[0.97] shadow-sm flex flex-col justify-between h-36"
          >
            <div className="w-11 h-11 rounded-2xl bg-warning-soft text-warning flex items-center justify-center">
              <CrownBadge className="w-10 h-10" />
            </div>
            <div>
              <span className="block font-bold text-sm text-surface-text">
                Kuis Interaktif
              </span>
              <span className="block text-[11px] text-surface-muted">
                Tebak & susun huruf
              </span>
            </div>
          </button>
        </div>

        {/* Rost Melody Practice Preview */}
        <section className="rounded-3xl bg-surface-card border border-surface-border p-4 flex items-center gap-3.5 shadow-sm">
          <RostToneIcon className="w-12 h-12 shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-surface-text">
              Irama Rost Tilawati
            </h4>
            <p className="text-[11px] text-surface-muted leading-relaxed">
              1. Nada Datar &rarr; 2. Nada Naik &rarr; 3. Nada Turun
            </p>
          </div>
          <button
            onClick={() => alert("Memutar contoh nada Rost Tilawati")}
            className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center active:scale-90"
            title="Dengar Irama"
          >
            <Volume2 size={18} />
          </button>
        </section>
      </div>
    </NgajiCeriaLayout>
  );
}
