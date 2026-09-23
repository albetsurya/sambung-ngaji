import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, ChevronRight } from "../common/FontAwesomeIcons";
import { useSholatJournal } from "../../hooks/useSholatJournal";
import { useDzikirStreak } from "../../hooks/useDzikirStreak";
import { useQuranStreak } from "../../hooks/useQuranStreak";
import { useTahfidz, getJuzHafal } from "../../hooks/useTahfidz";
import { useBadges } from "../../hooks/useBadges";

export function ProgressBanner() {
  const navigate = useNavigate();
  const sholat = useSholatJournal();
  const dzikir = useDzikirStreak();
  const quran = useQuranStreak();
  const tahfidz = useTahfidz();

  const juzHafal = useMemo(() => getJuzHafal(tahfidz.data), [tahfidz.data]);

  const { unlockedCount, totalCount } = useBadges({
    sholat: sholat.streak,
    dzikir: dzikir.streak,
    quran: quran.streak,
    tahfidz: juzHafal,
    tahfidzStreak: tahfidz.streak,
  });

  const totalStreak =
    sholat.streak + dzikir.streak + quran.streak + tahfidz.streak;

  return (
    <button
      onClick={() => navigate("/member/progres")}
      className="w-full rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3 transition-all active:scale-[0.99] hover:bg-surface-card2 hover:border-accent/30"
    >
      <span className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
        <Trophy size={18} />
      </span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-ios-body font-medium text-surface-text">
          Progres Saya
        </p>
        <p className="text-ios-caption text-surface-muted truncate">
          {totalStreak} hari beruntun · {unlockedCount}/{totalCount} badge
          terbuka
        </p>
      </div>
      <ChevronRight size={16} className="text-surface-muted flex-shrink-0" />
    </button>
  );
}
