import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { DailyMissionsCard } from "../components/DailyMissionsCard";
import { CeriaGameLoading } from "../components/CeriaGameLoading";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { useNgajiCeriaStore, type NgajiCeriaState } from "../hooks/useNgajiCeriaStore";
import {
  Sparkles,
  Play,
  Star,
  BookOpen,
  MapPin,
  Trophy,
  Fire,
  ChevronRight,
} from "../../../components/ui/FontAwesomeIcons";

export default function NgajiCeriaHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(() => {
    // Tampilkan loading splash HANYA jika masuk dari landing / home luar
    // Penanda sengaja tidak dihapus di sini karena React StrictMode dapat
    // menjalankan initializer state lebih dari sekali pada development.
    return sessionStorage.getItem("trigger_ngaji_ceria_splash") === "true";
  });

  React.useEffect(() => {
    if (!isLoading) return;
    sessionStorage.removeItem("trigger_ngaji_ceria_splash");
  }, [isLoading]);

  const finishLoading = React.useCallback(() => setIsLoading(false), []);

  const displayName = user?.name ? user.name.split(" ")[0] : "Hamba Allah";
  const { currentJilid, currentPage, progressPercentage } = useNgajiCeriaProgress();
  const { currentStreak, streakDays } = useNgajiCeriaStreak();
  const stars = useNgajiCeriaStore((state: NgajiCeriaState) => state.stars);
  const totalStars = Object.values(stars).reduce((total, value) => total + value, 0);
  const currentJilidNumber = Number(currentJilid.replace("jilid-", "")) || 1;

  const days = [
    ["SEN", 1], ["SEL", 2], ["RAB", 3], ["KAM", 4], ["JUM", 5], ["SAB", 6], ["AHD", 0],
  ] as const;
  const activeDays = days.map(([label, dayIndex]) => ({ label, active: streakDays[dayIndex] }));

  return (
    <>
      {isLoading && <CeriaGameLoading durationMs={1500} onLoaded={finishLoading} />}
      <NgajiCeriaLayout title="Ngaji Ceria">
        <div className={`px-4 py-4 space-y-5 bg-[#FFF8EE] min-h-full rounded-t-3xl transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {/* User Greeting Section */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C5A3A]">
              Assalamu'alaikum,
            </span>
            <h2 className="font-display font-black text-lg text-[#5A3A2A]">
              {displayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#E2EFCF] text-[#2D5A27] font-black text-[10px] uppercase tracking-wider border border-[#2D5A27]/20 flex items-center gap-1">
              <Sparkles size={11} /> VIP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFCB45] text-[#5A3A2A] font-black text-xs border border-[#B8590C]/20 flex items-center gap-1">
              <Star size={12} className="fill-[#5A3A2A]" /> {totalStars}
            </span>
          </div>
        </div>

        {/* Brown Hero Current Lesson Card (Ref 1) */}
        <section className="relative overflow-hidden rounded-[26px] bg-[#5A3A2A] text-white p-5 shadow-lg border-2 border-[#3E2518]">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCB45]">
                TILAWATI {currentJilidNumber} • HALAMAN {currentPage}
              </span>
              <span className="text-[10px] font-bold text-white/80">{progressPercentage}%</span>
            </div>

            <div>
              <h3 className="font-display font-black text-lg text-white leading-tight">
                Lanjutkan Jilid {currentJilidNumber} Hal {currentPage}
              </h3>
              <p className="text-xs text-white/80 mt-1">
                Kenali cara pengucapan dan panjang bacaan huruf Ta dengan tepat.
              </p>
            </div>

            {/* Progress bar line */}
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-[#FFCB45] h-full" style={{ width: `${progressPercentage}%` }} />
            </div>

            <button
              onClick={() => navigate(`/member/ngaji-ceria/quiz/play?jilid=${currentJilidNumber}&hal=${currentPage}`)}
              className="mt-1 w-full py-3 rounded-2xl bg-[#F58A3A] hover:bg-[#E2561A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md border-b-4 border-[#A63C0E] active:translate-y-0.5 transition-all"
            >
              <Play size={16} />
              Lanjutkan Pembelajaran Hari Ini
            </button>
          </div>
        </section>

        {/* 4 Main Grid Menus (Ref 1) */}
        <section className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => navigate("/member/ngaji-ceria/path")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#EFF3EC] border-2 border-[#C5DDB9] active:scale-95 transition-transform shadow-sm gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shadow-sm">
              <BookOpen size={18} />
            </div>
            <span className="text-[11px] font-black text-[#2D5A27]">Pilih Jilid</span>
          </button>

          <button
            onClick={() => navigate("/member/ngaji-ceria/map")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#EAF6FB] border-2 border-[#BCE3F5] active:scale-95 transition-transform shadow-sm gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1C5D79] text-white flex items-center justify-center shadow-sm">
              <MapPin size={18} />
            </div>
            <span className="text-[11px] font-black text-[#1C5D79]">Jelajah</span>
          </button>

          <button
             onClick={() => navigate("/member/ngaji-ceria/profile")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FFF6EC] border-2 border-[#FCDCB8] active:scale-95 transition-transform shadow-sm gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8C4A14] text-white flex items-center justify-center shadow-sm">
              <Sparkles size={18} />
            </div>
            <span className="text-[11px] font-black text-[#8C4A14]">Laporan</span>
          </button>

          <button
            onClick={() => navigate("/member/ngaji-ceria/leaderboard")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F3F0FF] border-2 border-[#D7CCFF] active:scale-95 transition-transform shadow-sm gap-1.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#553894] text-white flex items-center justify-center shadow-sm">
              <Trophy size={18} />
            </div>
            <span className="text-[11px] font-black text-[#553894]">Peringkat</span>
          </button>
        </section>

        {/* Weekly Streak Mengaji (Ref 1) */}
        <section className="rounded-2xl bg-white p-4 border-2 border-[#E2D4C0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={NGAJI_CERIA_ASSETS.apiStreak} className="w-5 h-5" alt="Flame" />
              <h4 className="font-black text-xs text-[#5A3A2A]">Streak Mengaji</h4>
            </div>
            <span className="text-[10px] font-bold text-[#8C5A3A]">{currentStreak} Hari Beruntun</span>
          </div>

          <div className="flex items-center justify-between gap-1">
            {activeDays.map((day) => (
              <div key={day.label} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                    day.active
                      ? "bg-[#F58A3A] border-[#C4430E] text-white shadow-sm"
                      : "bg-[#F5F2EB] border-[#E2D4C0] text-[#B8A690]"
                  }`}
                >
                  <Fire size={14} className={day.active ? "fill-white" : ""} />
                </div>
                <span className="text-[9px] font-bold text-[#5A3A2A]">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Misi Harian & Rewards */}
        <DailyMissionsCard />

        {/* Shortcut Cek Audio Manual */}
        <section
          onClick={() => navigate("/member/ngaji-ceria/cek-audio")}
          className="rounded-2xl bg-[#00923F]/10 border-2 border-[#00923F]/30 p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00923F] text-white flex items-center justify-center shadow-md">
              <Play size={16} />
            </div>
            <div>
              <h4 className="font-black text-xs text-[#00662C]">Cek Audio Manual (Verifikasi Per Huruf)</h4>
              <p className="text-[10px] text-[#00662C]/80 mt-0.5">Putar audio tiap kombinasi huruf Hal 1-44 tanpa quiz</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#00923F]" />
        </section>

        {/* Interactive Practice Banner (Ref 1) */}
        <section className="rounded-2xl bg-gradient-to-r from-[#FFF0F3] to-[#FCEAEF] p-4 border-2 border-[#FCCCD4] shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#8C243B] text-white flex items-center justify-center shadow-sm">
              <img
                src={NGAJI_CERIA_ASSETS.tebakSurahBaru}
                alt="Kartu"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#8C243B]">
                Latihan Interaktif Jilid 1-6
              </span>
              <h4 className="font-black text-sm text-[#5A3A2A] truncate">
                Sesi Ngaji Kartu
              </h4>
            </div>
          </div>

          <button
            onClick={() => navigate("/member/ngaji-ceria/quiz")}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-[#8C243B] text-white font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
          >
            <span>Mulai</span>
            <ChevronRight size={14} />
          </button>
        </section>
      </div>
    </NgajiCeriaLayout>
    </>
  );
}
