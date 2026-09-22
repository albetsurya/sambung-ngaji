import { Zap, Moon, BookOpen, ScrollText } from "../common/FontAwesomeIcons";
import type { Streaks } from "../../types";

const ITEMS: { key: keyof Streaks; label: string; Icon: typeof Zap }[] = [
  { key: "sholat", label: "Sholat", Icon: ScrollText },
  { key: "dzikir", label: "Dzikir", Icon: Zap },
  { key: "tahfidz", label: "Tahfidz", Icon: BookOpen },
  { key: "quran", label: "Quran", Icon: Moon },
];

export function StreakCard({ streaks }: { streaks: Streaks }) {
  return (
    <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
      <p className="text-ios-footnote font-semibold text-surface-muted mb-3">
        🔥 Streak Aktif
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {ITEMS.map(({ key, label, Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-card2 p-3"
          >
            <Icon size={18} className="text-accent" />
            <span className="text-lg font-bold text-surface-text tabular-nums">
              {streaks[key]}
            </span>
            <span className="text-[10px] font-medium text-surface-muted">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
