import type { ClayTone } from "./ClayCard";

interface ClayProgressProps {
  label: string;
  value: number;
  max?: number;
  tone?: ClayTone;
  hint?: string;
}

/** Chunky clay progress bar with inner highlight. value/max clamp to 0..100%. */
export function ClayProgress({ label, value, max = 100, tone = "accent", hint }: ClayProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="text-ios-footnote font-semibold text-surface-text">{label}</p>
        <p className="text-ios-footnote font-bold text-surface-text tabular-nums">
          {Math.round(pct)}%
        </p>
      </div>
      <div
        className="clay-track h-4"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`clay-fill clay-tile-${tone} h-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && (
        <p className="text-ios-caption text-surface-muted mt-1.5">{hint}</p>
      )}
    </div>
  );
}
