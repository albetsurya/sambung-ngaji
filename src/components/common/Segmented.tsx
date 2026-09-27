import type { ReactNode } from "react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex gap-1 p-1 rounded-2xl bg-surface-card border border-surface-border"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex-1 rounded-xl text-ios-footnote font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] ${
              size === "sm" ? "min-h-[36px]" : "min-h-[44px]"
            } ${
              active
                ? "bg-accent text-white shadow-sm"
                : "text-surface-muted hover:bg-surface-card2"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
