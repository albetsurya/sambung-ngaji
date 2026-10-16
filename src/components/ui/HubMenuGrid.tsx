import type { ComponentType } from "react";

export interface HubMenuGridItem {
  key: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  badge?: number;
  onClick: () => void;
}

export function HubMenuGrid({ items }: { items: HubMenuGridItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="px-4 grid grid-cols-3 gap-2.5">
      {items.map((m) => {
        const Icon = m.Icon;
        return (
          <button
            key={m.key}
            onClick={m.onClick}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-surface-border bg-surface-card py-3.5 px-1 shadow-sm transition-all active:scale-[0.97]"
          >
            <span className="relative w-11 h-11 rounded-2xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <Icon size={20} />
              {m.badge !== undefined && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center border-2 border-surface-card">
                  {m.badge > 99 ? "99+" : m.badge}
                </span>
              )}
            </span>
            <span className="text-[11px] leading-tight font-medium text-surface-text text-center line-clamp-2">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
