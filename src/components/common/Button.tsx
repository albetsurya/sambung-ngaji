// src/components/common/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  /** Icon di kiri teks */
  leftIcon?: ReactNode;
  /** Icon di kanan teks */
  rightIcon?: ReactNode;
  /** Mode icon-only (tombol bulat/rounded tanpa teks) */
  iconOnly?: boolean;
  children?: ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                                  Config                                    */
/* -------------------------------------------------------------------------- */

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

const SIZES: Record<
  string,
  {
    height: string;
    px: string;
    text: string;
    iconSize: string;
    gap: string;
  }
> = {
  sm: {
    height: "min-h-[40px]",
    px: "px-3.5",
    text: "text-[14px]",
    iconSize: "w-4 h-4",
    gap: "gap-1.5",
  },
  md: {
    height: "min-h-[48px]",
    px: "px-5",
    text: "text-[15px]",
    iconSize: "w-[18px] h-[18px]",
    gap: "gap-2",
  },
  lg: {
    height: "min-h-[52px]",
    px: "px-6",
    text: "text-[16px]",
    iconSize: "w-5 h-5",
    gap: "gap-2",
  },
};

/* -------------------------------------------------------------------------- */
/*                                  Button                                    */
/* -------------------------------------------------------------------------- */

/**
 * Button modern dengan dukungan icon yang rapi.
 *
 * Pemakaian:
 *   <Button leftIcon={<Copy size={16} />}>Salin</Button>
 *   <Button rightIcon={<ChevronRight size={16} />}>Lanjut</Button>
 *   <Button iconOnly aria-label="Tutup"><X size={18} /></Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  iconOnly,
  className = "",
  children,
  ...rest
}: Props) {
  const s = SIZES[size];

  // --------------------------------------------------------------
  // Icon-only: tombol bulat tanpa padding horizontal besar
  // --------------------------------------------------------------
  if (iconOnly) {
    return (
      <button
        className={`inline-flex items-center justify-center ${s.height} ${
          size === "sm" ? "w-10" : size === "lg" ? "w-[52px]" : "w-12"
        } rounded-2xl font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg ${VARIANTS[variant]} ${className}`}
        {...rest}
      >
        <span className={`flex items-center justify-center ${s.iconSize}`}>
          {children}
        </span>
      </button>
    );
  }

  // --------------------------------------------------------------
  // Regular: dengan teks + optional icon kiri/kanan
  // --------------------------------------------------------------
  return (
    <button
      className={`inline-flex items-center justify-center ${s.height} ${s.px} ${s.gap} rounded-2xl font-semibold ${s.text} tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg ${VARIANTS[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {leftIcon && (
        <span
          className={`inline-flex items-center justify-center flex-shrink-0 ${s.iconSize}`}
          aria-hidden="true"
        >
          {leftIcon}
        </span>
      )}

      {children && <span className="truncate">{children}</span>}

      {rightIcon && (
        <span
          className={`inline-flex items-center justify-center flex-shrink-0 ${s.iconSize}`}
          aria-hidden="true"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}
