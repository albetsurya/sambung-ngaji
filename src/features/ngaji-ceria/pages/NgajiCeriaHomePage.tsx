import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { goBack } from "../../../utils/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Sparkles, Medal, PlayCircle } from "../../../components/ui/FontAwesomeIcons";
import { ClayBackdrop, InlineSpinner } from "../../../components/clay";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";

interface StreakDayProps {
  day: string;
  isCompleted: boolean;
}

function StreakDay({ day, isCompleted }: StreakDayProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-ios-caption font-semibold ${
        isCompleted
          ? "bg-accent text-white"
          : "bg-surface-card text-surface-muted border border-surface-border"
      }`}
    >
      {day}
    </div>
  );
}

export default function NgajiCeriaHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || "Anak Shalih";

  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);
  const { streakDays, currentStreak, isLoading: isStreakLoading } =
    useNgajiCeriaStreak();

  const currentJilidObj = useMemo(() => {
    return TILAWATI_DATA.find((j) => j.id === currentJilid);
  }, [currentJilid]);

  const nextLessonLabel = useMemo(() => {
    if (currentJilidObj && currentPage !== null) {
      const lesson = currentJilidObj.pelajaran.find((p) => p.nomor === currentPage);
      return `${currentJilidObj.nama} • Halaman ${currentPage}${
        lesson ? `: ${lesson.tema}` : ""
      }`;
    }
    return "Mulai Tilawati Jilid 1";
  }, [currentJilidObj, currentPage]);

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Ngaji Ceria"
        subtitle={`Selamat belajar, ${displayName}`}
        onBack={() => goBack(navigate, "/member")}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="relative px-4 py-4 space-y-5 pb-8">
        <ClayBackdrop />

        {/* Progress Card */}
        <section className="clay relative overflow-hidden p-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-ios-caption text-surface-muted">
                Progress Belajar
              </p>
              <p className="font-display text-xl font-bold text-surface-text tracking-[-0.02em] truncate">
                {currentJilidObj
                  ? `${currentJilidObj.nama} • Halaman ${currentPage}`
                  : "Belum memulai"}
              </p>
              <div className="w-full bg-surface-card2 rounded-full h-2.5 mt-3">
                <div
                  className="bg-accent h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-ios-caption text-surface-muted mt-1.5 text-right">
                {progressPercentage}% selesai
              </p>
            </div>
            <Medal size={64} className="text-accent opacity-90 shrink-0 clay-bob" />
          </div>
        </section>

        {/* Streak Mengaji */}
        <section className="clay relative overflow-hidden p-5">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-ios-caption text-surface-muted">
                Streak Mengaji
              </p>
              <p className="font-display text-xl font-bold text-surface-text tracking-[-0.02em] truncate">
                {isStreakLoading ? (
                  <InlineSpinner size={24} />
                ) : (
                  `${currentStreak} Hari Streak`
                )}
              </p>
              <div className="flex justify-between mt-3">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
                  (day, idx) => (
                    <StreakDay
                      key={day}
                      day={day}
                      isCompleted={streakDays[idx] || false}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Actions */}
        <section className="grid grid-cols-1 gap-3">
          <button
            onClick={() => navigate("/member/ngaji-ceria/belajar")}
            className="clay clay-pressable flex items-center gap-3 !rounded-3xl p-3.5 text-left bg-accent text-white shadow-lg shadow-accent/20"
          >
            <span className="clay-tile w-11 h-11 flex items-center justify-center flex-shrink-0 bg-white/20">
              <PlayCircle size={20} className="text-white" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-ios-body font-semibold text-white">
                Mulai Sesi Ngaji
              </span>
              <span className="block text-ios-caption text-white/80 truncate">
                {nextLessonLabel}
              </span>
            </span>
          </button>

          <button
            onClick={() => alert("Jelajahi Jilid (Segera hadir!)")}
            className="clay clay-pressable flex items-center gap-3 !rounded-3xl p-3.5 text-left"
          >
            <span className="clay-tile clay-tile-info w-11 h-11 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-surface-text" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-ios-body font-semibold text-surface-text">
                Jelajahi Jilid
              </span>
              <span className="block text-ios-caption text-surface-muted truncate">
                Lihat semua jilid Tilawati
              </span>
            </span>
          </button>
        </section>
      </div>
    </AppLayout>
  );
}
