import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { tapFeedback } from "../../lib/haptics";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "soft" | "softDanger";
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
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
  soft: "bg-accent-soft text-accent hover:bg-accent-soft/70 active:bg-accent-soft/60 disabled:opacity-40",
  softDanger:
    "bg-danger-soft text-danger hover:bg-danger-soft/70 active:bg-danger-soft/60 disabled:opacity-40",
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
  xs: {
    height: "min-h-[36px]",
    px: "px-3",
    text: "text-[13px]",
    iconSize: "w-3.5 h-3.5",
    gap: "gap-1.5",
  },
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

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leftIcon,
  rightIcon,
  iconOnly,
  className = "",
  children,
  onClick,
  ...rest
}: Props) {
  const s = SIZES[size];
  // Class stabil untuk override per-preset tema (lihat styles/themes.css).
  const stable = `btn btn-${variant} btn-${size}`;
  // Getar halus tiap tap (Android; iOS mengabaikan).
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    tapFeedback();
    onClick?.(e);
  };

  if (iconOnly) {
    const width =
      size === "xs"
        ? "w-9"
        : size === "sm"
          ? "w-10"
          : size === "lg"
            ? "w-[52px]"
            : "w-12";
    return (
      <button
        className={`inline-flex items-center justify-center ${s.height} ${width} rounded-2xl font-semibold transition-all duration-200 ease-out active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg ${VARIANTS[variant]} ${stable} ${className}`}
        onClick={handleClick}
        {...rest}
      >
        <span className={`flex items-center justify-center ${s.iconSize}`}>
          {children}
        </span>
      </button>
    );
  }

  return (
    <button
      className={`inline-flex items-center justify-center ${s.height} ${s.px} ${s.gap} rounded-2xl font-semibold ${s.text} tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.97] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg ${VARIANTS[variant]} ${stable} ${fullWidth ? "w-full" : ""} ${className}`}
        onClick={handleClick}
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
