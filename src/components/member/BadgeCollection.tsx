import { Star, Lock } from "../common/FontAwesomeIcons";
import type { BadgeState } from "../../hooks/useBadges";

const TIER_COLOR: Record<BadgeState["tier"], string> = {
  bronze: "text-amber-700 bg-amber-100",
  silver: "text-slate-400 bg-slate-100",
  gold: "text-amber-500 bg-amber-50",
};

export function BadgeCollection({ badges }: { badges: BadgeState[] }) {
  const unlocked = badges.filter((b) => b.unlocked);
  const locked = badges.filter((b) => !b.unlocked);

  return (
    <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
      <p className="text-ios-footnote font-semibold text-surface-muted mb-3">
        🏅 {unlocked.length}/{badges.length} Badge
      </p>
      <div className="grid grid-cols-5 gap-2">
        {unlocked.map((b) => (
          <div
            key={b.id}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 ${TIER_COLOR[b.tier]}`}
            title={`${b.name} — ${b.minStreak} hari`}
          >
            <Star size={16} />
            <span className="text-[9px] font-medium text-center leading-tight">
              {b.name}
            </span>
          </div>
        ))}
        {locked.slice(0, 7).map((b) => (
          <div
            key={b.id}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-card2 p-2 opacity-50"
            title={`${b.name} — ${b.minStreak} hari`}
          >
            <Lock size={16} className="text-surface-muted" />
            <span className="text-[9px] font-medium text-center leading-tight text-surface-muted">
              {b.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
