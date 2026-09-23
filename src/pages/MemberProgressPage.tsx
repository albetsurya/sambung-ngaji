import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Lock,
  Check,
  BookOpen,
  RefreshCw,
  ScrollText,
  Calendar,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { useSholatJournal } from "../hooks/useSholatJournal";
import { useDzikirStreak } from "../hooks/useDzikirStreak";
import { useQuranStreak } from "../hooks/useQuranStreak";
import { useTahfidz, getJuzHafal } from "../hooks/useTahfidz";
import {
  useBadges,
  type BadgeCategory,
  type BadgeState,
  type BadgeTier,
} from "../hooks/useBadges";

/* -------------------------------------------------------------------------- */
/*                              Config                                        */
/* -------------------------------------------------------------------------- */

const CATEGORY_LABEL: Record<BadgeCategory, string> = {
  sholat: "Sholat",
  dzikir: "Dzikir",
  quran: "Quran",
  tahfidz: "Tahfidz",
  total: "Istiqamah",
};

const TIER_LABEL: Record<BadgeTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
};

const TIER_CHIP: Record<BadgeTier, string> = {
  bronze: "text-amber-700 bg-amber-100",
  silver: "text-slate-500 bg-slate-100",
  gold: "text-amber-500 bg-amber-50",
};

const TIER_BAR: Record<BadgeTier, string> = {
  bronze: "bg-amber-500",
  silver: "bg-slate-400",
  gold: "bg-amber-400",
};

/* -------------------------------------------------------------------------- */
/*                              Helpers                                       */
/* -------------------------------------------------------------------------- */

function formatProgress(badge: BadgeState): string {
  const value = Math.min(badge.minStreak, badge.minStreak);
  return `${value}/${badge.minStreak}`;
}

function formatCurrentValue(badge: BadgeState, streaks: { sholat: number; dzikir: number; quran: number; tahfidz: number }): string {
  let current = 0;
  switch (badge.category) {
    case "sholat": current = streaks.sholat; break;
    case "dzikir": current = streaks.dzikir; break;
    case "quran": current = streaks.quran; break;
    case "tahfidz": current = streaks.tahfidz; break;
    case "total": current = streaks.sholat + streaks.dzikir + streaks.quran + streaks.tahfidz; break;
  }
  return `${current}/${badge.minStreak}`;
}

function formatProgressPercent(badge: BadgeState, streaks: { sholat: number; dzikir: number; quran: number; tahfidz: number }): number {
  let current = 0;
  switch (badge.category) {
    case "sholat": current = streaks.sholat; break;
    case "dzikir": current = streaks.dzikir; break;
    case "quran": current = streaks.quran; break;
    case "tahfidz": current = streaks.tahfidz; break;
    case "total": current = streaks.sholat + streaks.dzikir + streaks.quran + streaks.tahfidz; break;
  }
  return Math.min(Math.round((current / badge.minStreak) * 100), 100);
}

function formatRemaining(badge: BadgeState, streaks: { sholat: number; dzikir: number; quran: number; tahfidz: number }): string {
  let current = 0;
  switch (badge.category) {
    case "sholat": current = streaks.sholat; break;
    case "dzikir": current = streaks.dzikir; break;
    case "quran": current = streaks.quran; break;
    case "tahfidz": current = streaks.tahfidz; break;
    case "total": current = streaks.sholat + streaks.dzikir + streaks.quran + streaks.tahfidz; break;
  }
  const remaining = Math.max(badge.minStreak - current, 0);
  return `${remaining} hari`;
}

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export default function MemberProgressPage() {
  const navigate = useNavigate();

  const sholat = useSholatJournal();
  const dzikir = useDzikirStreak();
  const quran = useQuranStreak();
  const tahfidz = useTahfidz();

  const juzHafal = useMemo(() => getJuzHafal(tahfidz.data), [tahfidz.data]);

  const streaks = {
    sholat: sholat.streak,
    dzikir: dzikir.streak,
    quran: quran.streak,
    tahfidz: tahfidz.streak,
  };

  const { badges, unlockedCount, totalCount } = useBadges(streaks);

  const summary = [
    { key: "sholat", label: "Sholat", value: sholat.streak, Icon: Calendar },
    { key: "dzikir", label: "Dzikir", value: dzikir.streak, Icon: RefreshCw },
    { key: "tahfidz", label: "Tahfidz", value: tahfidz.streak, Icon: BookOpen },
    { key: "quran", label: "Quran", value: quran.streak, Icon: ScrollText },
  ];

  const nextBadges = useMemo(() => {
    const byCategory = new Map<BadgeCategory, BadgeState>();
    for (const badge of badges) {
      if (badge.unlocked) continue;
      const existing = byCategory.get(badge.category);
      if (!existing || formatProgressPercent(badge, streaks) > formatProgressPercent(existing, streaks)) {
        byCategory.set(badge.category, badge);
      }
    }
    return Array.from(byCategory.values()).sort(
      (a, b) => formatProgressPercent(b, streaks) - formatProgressPercent(a, streaks),
    );
  }, [badges, streaks]);

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Progres Saya"
        subtitle="Ringkasan ibadah & badge"
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/member", { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-5 pb-8">
        {/* Ringkasan */}
        <section>
          <p className="px-1 mb-3 text-ios-footnote font-semibold text-surface-text">
            Ringkasan
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {summary.map(({ key, label, value, Icon }) => (
              <div
                key={key}
                className="flex flex-col items-center gap-1 rounded-2xl border border-surface-border bg-surface-card p-3"
              >
                <Icon size={18} className="text-accent" />
                <span className="text-ios-nav font-bold text-surface-text tabular-nums">
                  {value}
                </span>
                <span className="text-[10px] font-medium text-surface-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Badge */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Badge
            </p>
            <span className="text-ios-caption text-surface-muted">
              {unlockedCount}/{totalCount} terbuka
            </span>
          </div>

          <div className="space-y-2">
            {badges.map((badge) => (
              <BadgeRow key={badge.id} badge={badge} streaks={streaks} />
            ))}
          </div>
        </section>

        {/* Berikutnya */}
        {nextBadges.length > 0 && (
          <section>
            <p className="px-1 mb-3 text-ios-footnote font-semibold text-surface-text">
              Berikutnya
            </p>
            <div className="space-y-2">
              {nextBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-2xl border border-surface-border bg-surface-card p-3.5 flex items-center gap-3"
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TIER_CHIP[badge.tier]}`}
                  >
                    <Star size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {badge.name}
                    </p>
                    <p className="text-ios-caption text-surface-muted truncate">
                      {CATEGORY_LABEL[badge.category]} · kurang {formatRemaining(badge, streaks)}
                    </p>
                  </div>
                  <span className="text-ios-footnote font-semibold tabular-nums text-accent flex-shrink-0">
                    {formatProgressPercent(badge, streaks)}%
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Badge Row                                     */
/* -------------------------------------------------------------------------- */

function BadgeRow({ badge, streaks }: { badge: BadgeState; streaks: { sholat: number; dzikir: number; quran: number; tahfidz: number } }) {
  const percent = formatProgressPercent(badge, streaks);

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-3.5">
      <div className="flex items-center gap-3">
        <span
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            badge.unlocked ? TIER_CHIP[badge.tier] : "bg-surface-card2"
          }`}
        >
          {badge.unlocked ? (
            <Star size={16} />
          ) : (
            <Lock size={16} className="text-surface-muted" />
          )}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-ios-body font-medium text-surface-text truncate">
              {badge.name}
            </p>
            {badge.unlocked && (
              <Check
                size={14}
                strokeWidth={2.8}
                className="text-success flex-shrink-0"
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${TIER_CHIP[badge.tier]}`}
            >
              {TIER_LABEL[badge.tier]}
            </span>
            <span className="text-ios-caption text-surface-muted">
              {CATEGORY_LABEL[badge.category]}
            </span>
          </div>
        </div>

        <span className="text-ios-footnote font-semibold tabular-nums text-surface-text flex-shrink-0">
          {formatCurrentValue(badge, streaks)}
        </span>
      </div>

      <div className="mt-2.5 h-1.5 rounded-full bg-surface-card2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            badge.unlocked ? "bg-success" : TIER_BAR[badge.tier]
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}