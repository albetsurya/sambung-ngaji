import { useEffect, useRef, useState, type CSSProperties } from "react";

export function AnimatedNumber({
  value,
  format,
  duration = 600,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(display)}</>;
}

export function AnimatedProgress({
  pct,
  testId,
}: {
  pct: number;
  testId?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="h-2.5 rounded-full bg-surface-card2 progress-track"
      data-testid={testId}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-accent progress-fill progress-shine"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function TypingDots({ label = "AI sedang mengetik" }: { label?: string }) {
  return (
    <span className="typing-dots" aria-label={label} role="status">
      <span />
      <span />
      <span />
    </span>
  );
}

export function SuccessCheck({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className="anim-success-pop"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="20" fill="rgb(var(--c-success))" opacity="0.12" />
      <circle cx="22" cy="22" r="14" fill="rgb(var(--c-success))" />
      <path
        d="M16 22.5l4 4 8-9"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-check-path"
      />
    </svg>
  );
}

/* Wrapper stagger */
export function staggerStyle(index: number, step = 30): CSSProperties {
  return { "--stagger-delay": `${Math.min(index * step, 300)}ms` } as CSSProperties;
}
