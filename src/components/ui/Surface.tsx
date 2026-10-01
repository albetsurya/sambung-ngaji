import { useState, type ReactNode } from "react";
import { ChevronRight, KeyRound } from "./FontAwesomeIcons";
import type { Role } from "../../types";
import { ROLE_LABEL } from "../../hooks/usePermission";
import { tapFeedback } from "../../lib/haptics";

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

export function GroupedList({
  children,
  className = "",
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <div
      className={`${flush ? "" : "mx-4 "}my-2 bg-surface-card rounded-2xl border border-surface-border overflow-hidden shadow-sm ${className}`}
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
      onClick={
        onClick
          ? () => {
              tapFeedback();
              onClick();
            }
          : undefined
      }
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
      
      <path
        d="M12 2.5c-3.2 0-5.5 2.4-5.5 5.6 0 1.1.2 2 .5 2.8-.6.5-1 1.3-1 2.2 0 1.3.9 2.3 2 2.5.4 3.6 2.1 6.4 4 6.4s3.6-2.8 4-6.4c1.1-.2 2-1.2 2-2.5 0-.9-.4-1.7-1-2.2.3-.8.5-1.7.5-2.8 0-3.2-2.3-5.6-5.5-5.6Z"
        fill="currentColor"
        opacity="0.35"
      />
      
      <ellipse cx="12" cy="9.5" rx="2.6" ry="3.2" fill="currentColor" />
      
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
      
      <circle cx="12" cy="9" r="4" fill="currentColor" />
      
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


function optimizeAvatarUrl(url: string): string {
  if (!url) return url;
  if (url.includes("drive.google.com") && /sz=w\d+/.test(url)) {
    return url.replace(/sz=w\d+/, "sz=w200");
  }
  return url;
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  gender?: "L" | "P";
}

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
        src={optimizeAvatarUrl(src!)}
        alt={name}
        onError={() => setImgError(true)}
        style={{ width: size, height: size }}
        className="rounded-full object-cover bg-accent-soft flex-shrink-0 ring-1 ring-surface-border"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
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
      className={`badge badge-${color} inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${BADGE_COLORS[color]}`}
    >
      {children}
    </span>
  );
}

export const ROLE_BADGE_COLOR: Record<Role, keyof typeof BADGE_COLORS> = {
  SUPER_ADMIN: "red",
  ADMIN: "emerald",
  TIM_KU: "teal",
  TIM_PNKB: "amber",
  TIM_ABSENSI: "amber",
  PENGAWAS: "ink",
  MEMBER: "ink",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge color={ROLE_BADGE_COLOR[role]}>{ROLE_LABEL[role]}</Badge>;
}

export function AccountBadge({
  hasAccount,
  compact = false,
}: {
  hasAccount?: boolean;
  compact?: boolean;
}) {
  const active = !!hasAccount;
  return (
    <span
      title={active ? "Punya akun user" : "Belum ada akun"}
      aria-label={active ? "Punya akun user" : "Belum ada akun"}
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${
        compact ? "px-1.5 py-1" : "px-2 py-0.5 text-[10px]"
      } ${active ? "bg-accent-soft text-accent" : "bg-surface-card2 text-surface-muted"}`}
    >
      <KeyRound size={compact ? 11 : 10} />
      {!compact && (active ? "Punya Akun" : "Belum Ada Akun")}
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
        size={16}
        strokeWidth={2.3}
        className="text-surface-muted/60 flex-shrink-0"
      />
    </div>
  );
}
