import { useNavigate } from "react-router-dom";
import { ScrollText, Zap, BookOpen, Moon } from "../common/FontAwesomeIcons";
import type { Streaks } from "../../types";

const ITEMS: { key: keyof Streaks; label: string; Icon: typeof ScrollText }[] = [
  { key: "sholat", label: "Sholat", Icon: ScrollText },
  { key: "dzikir", label: "Dzikir", Icon: Zap },
  { key: "tahfidz", label: "Tahfidz", Icon: BookOpen },
  { key: "quran", label: "Quran", Icon: Moon },
];

export function StreakCard({ streaks }: { streaks: Streaks }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/member/progres")}
      className="w-full text-left rounded-2xl border border-surface-border bg-surface-card p-4 transition-all active:scale-[0.99] hover:bg-surface-card2 hover:border-accent/30"
    >
      <p className="text-ios-footnote font-semibold text-surface-muted mb-3">
        Streak Aktif
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {ITEMS.map(({ key, label, Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded-xl bg-surface-card2 p-3"
          >
            <Icon size={18} className="text-accent" />
            <span className="text-ios-nav font-bold text-surface-text tabular-nums">
              {streaks[key]}
            </span>
            <span className="text-[10px] font-medium text-surface-muted">
              {label}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}
