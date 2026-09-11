import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4 transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:shadow-md hover:border-surface-border/80 active:scale-[0.99] active:shadow-sm"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Grouped list modern: satu panel dengan border halus dan divider tipis,
 * bukan shadow bertumpuk. Lebih ringan dan bersih secara visual.
 */
export function GroupedList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-4 my-2 bg-surface-card rounded-2xl border border-surface-border overflow-hidden shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function ListRow({
  children,
  onClick,
  leading,
  insetDivider = true,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  leading?: ReactNode;
  insetDivider?: boolean;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 min-h-[52px] px-4 py-3 ${
        insetDivider ? "ios-list-divider" : ""
      } ${
        onClick
          ? "cursor-pointer transition-colors duration-150 hover:bg-surface-card2/60 active:bg-surface-card2"
          : ""
      } ${className}`}
    >
      {leading}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Avatar Fallback Icons                           */
/* -------------------------------------------------------------------------- */

/**
 * Siluet wanita berhijab, tanpa wajah.
 * Digambar sebagai SVG inline agar tidak perlu dependency tambahan.
 */
function FemaleHijabIcon({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Hijab luar */}
      <path
        d="M12 2.5c-3.2 0-5.5 2.4-5.5 5.6 0 1.1.2 2 .5 2.8-.6.5-1 1.3-1 2.2 0 1.3.9 2.3 2 2.5.4 3.6 2.1 6.4 4 6.4s3.6-2.8 4-6.4c1.1-.2 2-1.2 2-2.5 0-.9-.4-1.7-1-2.2.3-.8.5-1.7.5-2.8 0-3.2-2.3-5.6-5.5-5.6Z"
        fill="currentColor"
        opacity="0.35"
      />
      {/* Area wajah (polos) */}
      <ellipse cx="12" cy="9.5" rx="2.6" ry="3.2" fill="currentColor" />
      {/* Bahu */}
      <path
        d="M6 22c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Siluet pria sederhana (kepala + bahu), tanpa wajah.
 */
function MaleIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Kepala */}
      <circle cx="12" cy="9" r="4" fill="currentColor" />
      {/* Bahu */}
      <path
        d="M5 22c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Avatar                                   */
/* -------------------------------------------------------------------------- */

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  /** Jenis kelamin untuk menentukan icon fallback. Default: 'L' (laki-laki) */
  gender?: "L" | "P";
}

/**
 * Avatar modern dengan fallback icon:
 * - Jika `src` ada dan berhasil dimuat → tampilkan foto
 * - Jika `src` kosong atau gagal dimuat → tampilkan icon dummy
 *   (hijab untuk perempuan, siluet biasa untuk laki-laki)
 */
export function Avatar({ src, name, size = 44, gender = "L" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = src && !imgError;

  const bgClass =
    gender === "P"
      ? "bg-accent-soft text-accent"
      : "bg-surface-card2 text-surface-muted";

  if (showPhoto) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover bg-accent-soft flex-shrink-0 ring-1 ring-surface-border"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${bgClass}`}
      aria-label={name}
    >
      {gender === "P" ? (
        <FemaleHijabIcon size={size} />
      ) : (
        <MaleIcon size={size} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Badge                                    */
/* -------------------------------------------------------------------------- */

const BADGE_COLORS: Record<string, string> = {
  emerald: "bg-accent-soft text-accent",
  sand: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  amber: "bg-warning-soft text-warning",
  ink: "bg-surface-card2 text-surface-muted",
};

export function Badge({
  children,
  color = "emerald",
}: {
  children: ReactNode;
  color?: keyof typeof BADGE_COLORS;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${BADGE_COLORS[color]}`}
    >
      {children}
    </span>
  );
}

export function ChevronRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className="flex items-center gap-3">
      <div className="flex-1 min-w-0">{children}</div>
      <ChevronRight
        size={17}
        strokeWidth={2.3}
        className="text-surface-muted/60 flex-shrink-0"
      />
    </div>
  );
}
