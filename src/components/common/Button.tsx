import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<string, string> = {
  primary:
    "bg-accent text-white shadow-sm hover:bg-accent-dark hover:shadow-md active:bg-accent-dark active:shadow-sm disabled:opacity-40 disabled:shadow-none",
  secondary:
    "bg-surface-card text-accent border border-accent/25 hover:border-accent/40 hover:bg-accent-soft active:bg-accent-soft/80 disabled:opacity-40",
  ghost:
    "bg-transparent text-surface-text hover:bg-surface-card2 active:bg-surface-card2/70 disabled:opacity-40",
  danger:
    "bg-danger text-white shadow-sm hover:shadow-md hover:opacity-95 active:opacity-90 active:shadow-sm disabled:opacity-40 disabled:shadow-none",
};

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl font-semibold text-[15px] tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
