import type { ReactNode } from "react";

interface FilterChipProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export function FilterChip({ active, label, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={
        "whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] " +
        (active
          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
          : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2")
      }
    >
      {label}
    </button>
  );
}
