import type { CSSProperties } from "react";
import { GroupedList } from "./Surface";
import { GridCols } from "../../pages/MembersListPage";

/* -------------------------------------------------------------------------- */
/*                              Skeleton Primitive                            */
/* -------------------------------------------------------------------------- */

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  style,
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseShape =
    variant === "circle"
      ? "rounded-full"
      : variant === "rect"
        ? "rounded-xl"
        : "rounded-md";

  return (
    <div
      className={`bg-surface-card2 animate-pulse ${baseShape} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              List Skeleton                                 */
/* -------------------------------------------------------------------------- */

export function DashboardSkeleton() {
  return (
    <>
      <HeroCardSkeleton />

      <div className="flex gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <div className="flex gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      <CategoryDistributionSkeleton />

      <div className="space-y-2">
        <SectionHeaderSkeleton />
        <MeetingCardSkeleton />
      </div>
    </>
  );
}
/**
 * Skeleton untuk baris jamaah — mirror PERSIS layout Card + Avatar + text.
 * Tinggi text disesuaikan dengan line-height Tailwind:
 * - text-sm  → 20px
 * - text-xs  → 16px
 */

/**
 * Skeleton untuk list jamaah penuh (banyak baris).
 */
export function JamaahCardSkeleton() {
  return (
    <div className="px-4">
      <div className="flex items-center gap-3 h-[68px] rounded-2xl border border-surface-border bg-surface-card shadow-sm px-4">
        <div className="w-10 h-10 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2 min-w-0">
          <div className="h-3.5 w-1/2 rounded bg-surface-card2 animate-pulse" />
          <div className="h-2.5 w-1/3 rounded bg-surface-card2 animate-pulse" />
        </div>
        <div className="h-4 w-16 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
      </div>
    </div>
  );
}

export function JamaahListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <JamaahCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Skeletons                                  */
/* -------------------------------------------------------------------------- */

export function JamaahRowSkeleton({ rows = 11 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 h-16 px-4 border-b border-surface-border/60"
        >
          <div className="w-10 h-10 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-3.5 w-1/2 rounded bg-surface-card2 animate-pulse" />
            <div className="h-2.5 w-1/3 rounded bg-surface-card2 animate-pulse" />
          </div>
          <div className="h-3 w-12 rounded bg-surface-card2 animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function JamaahGridSkeleton({
  rows = 6,
  cols = 2,
}: {
  rows?: number;
  cols?: GridCols;
}) {
  const colsClass =
    cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  const avatarSize =
    cols === 2 ? "w-14 h-14" : cols === 3 ? "w-11 h-11" : "w-9 h-9";
  const padding = cols === 2 ? "p-3" : cols === 3 ? "p-2" : "p-1.5";
  const gap = cols === 2 ? "gap-3" : cols === 3 ? "gap-2" : "gap-1.5";

  return (
    <div className={`grid ${colsClass} ${gap}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface-card rounded-2xl border border-surface-border shadow-sm ${padding} flex flex-col items-center gap-2`}
        >
          <div
            className={`${avatarSize} rounded-full bg-surface-card2 animate-pulse`}
          />
          <div className="h-3 w-3/4 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-2.5 w-1/2 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-surface-card2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton untuk GroupedList — mirror ListRow.
 * ListRow punya min-h-[52px] + px-4 py-3 + gap-3.
 */
export function GroupedListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="mx-4 my-4 bg-surface-card rounded-2xl border border-surface-border overflow-hidden shadow-sm">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 min-h-[52px] px-4 py-3 ${
            i !== rows - 1 ? "ios-list-divider" : ""
          }`}
        >
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton width="55%" height={20} />
            <Skeleton width="35%" height={16} />
          </div>
          <Skeleton variant="rect" width={56} height={24} />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Dashboard Skeleton                            */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk HeroStatCard — mirror PERSIS layout asli:
 * - p-5
 * - baris atas: label text-xs (16px) + icon box w-9 h-9 (36px)
 * - value: text-[34px] (line-height ~36px) dengan mt-2
 * - footer: text-xs (16px) dengan mt-3
 */
export function HeroCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-border shadow-sm p-5 bg-surface-card">
      <div className="flex items-start justify-between">
        <Skeleton width="40%" height={16} />
        <Skeleton variant="rect" width={36} height={36} />
      </div>
      <div className="mt-2">
        <Skeleton width="30%" height={36} />
      </div>
      <div className="mt-3">
        <Skeleton width="50%" height={16} />
      </div>
    </div>
  );
}

/**
 * Skeleton untuk StatTile — mirror PERSIS:
 * - p-4
 * - baris atas: label text-xs (16px) + icon w-7 h-7 (28px) dengan mb-3
 * - value: text-2xl (~32px)
 */
export function StatTileSkeleton() {
  return (
    <div className="flex-1 bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton width="50%" height={16} />
        <Skeleton variant="rect" width={28} height={28} />
      </div>
      <Skeleton width="40%" height={32} />
    </div>
  );
}

/**
 * Skeleton untuk section header — mirror:
 * - judul text-base (~24px)
 * - tombol "Lihat semua" text-xs (~16px)
 */
export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-0.5 pt-1">
      <Skeleton width={128} height={20} />
      <Skeleton width={64} height={16} />
    </div>
  );
}

/**
 * Skeleton untuk kartu distribusi kategori — mirror:
 * - Card p-4
 * - Header: label + total
 * - Grid 2 kolom × N baris, setiap baris bg-surface-card2 rounded-xl
 */
export function CategoryDistributionSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={112} height={16} />
        <Skeleton width={56} height={12} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-surface-card2 rounded-xl px-3 py-2.5"
          >
            <Skeleton width={64} height={14} className="bg-surface-border" />
            <Skeleton width={24} height={12} className="bg-surface-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton untuk MeetingCard — mirror:
 * - Card p-4 flex items-center gap-3
 * - Icon box w-12 h-12 rounded-2xl
 * - Badge + teks + subtext
 * - Chevron di kanan
 */
export function MeetingCardSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4 flex items-center gap-3">
      <Skeleton variant="rect" width={48} height={48} />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton width={48} height={12} />
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
      <Skeleton variant="rect" width={16} height={16} />
    </div>
  );
}

/**
 * Skeleton untuk AttentionCard — mirror:
 * - Card p-4 flex items-center gap-3
 * - Avatar circle 44px
 * - Nama + reason
 * - Chevron di kanan
 */
export function AttentionCardSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4 flex items-center gap-3">
      <Skeleton variant="circle" width={44} height={44} />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton width="40%" height={16} />
        <Skeleton width="60%" height={12} />
      </div>
      <Skeleton variant="rect" width={16} height={16} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Announcement Skeleton                             */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk baris pengumuman — mirror ListRow dengan icon + 2 baris + badge.
 */
export function AnnouncementRowSkeleton() {
  return (
    <div className="flex items-center gap-3 min-h-[60px] px-4 py-3">
      <Skeleton variant="rect" width={40} height={40} />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton width="50%" height={16} />
        <Skeleton width="35%" height={12} />
      </div>
      <Skeleton
        variant="rect"
        width={64}
        height={24}
        className="rounded-full"
      />
    </div>
  );
}

/**
 * Skeleton untuk list pengumuman penuh.
 */
export function AnnouncementListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="py-3">
      <div className="mx-4 my-4 bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={i !== rows - 1 ? "border-b border-surface-border" : ""}
          >
            <AnnouncementRowSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Member Detail Skeleton                            */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk MemberSelfPage — mirror layout asli:
 * - Profile header (avatar 64px + nama + badge + kelompok)
 * - Tab bar (3 tab: Profil, Absensi, Pembinaan)
 * - Card "Biodata" dengan 8 baris field
 * - Section "Jadwal Pengajian Mendatang" dengan 2 card jadwal
 */
export function MemberSelfSkeleton() {
  return (
    <>
      {/* Profile header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Skeleton variant="circle" width={64} height={64} />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton width="60%" height={20} />
          <div className="flex items-center gap-2">
            <Skeleton width={64} height={22} className="rounded-full" />
            <Skeleton width={80} height={16} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-3 flex gap-1 overflow-x-auto no-scrollbar border-b border-surface-border pb-2">
        <div className="flex gap-1 overflow-hidden">
          {[80, 92, 106].map((w, i) => (
            <Skeleton key={i} width={w} height={36} className="rounded-xl" />
          ))}
        </div>
      </div>

      {/* Content — mirror tab "Profil" */}
      <div className="px-4 py-4 space-y-4">
        {/* Card Biodata */}
        <div className="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4">
          <div className="mb-3 px-0.5">
            <Skeleton width={60} height={14} />
          </div>
          <div className="space-y-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between gap-3 py-2 border-b border-surface-border last:border-b-0"
              >
                <Skeleton width="30%" height={16} />
                <Skeleton width="50%" height={16} />
              </div>
            ))}
          </div>
        </div>

        {/* Section Jadwal Pengajian Mendatang */}
        <div className="space-y-2">
          <div className="px-0.5">
            <Skeleton width={200} height={14} />
          </div>

          {/* Card jadwal */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4 flex items-center gap-3"
            >
              <Skeleton variant="rect" width={48} height={48} />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton width={64} height={14} className="rounded-full" />
                <Skeleton width="60%" height={16} />
                <Skeleton width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Member Form Skeleton                              */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk MemberFormPage — mirror:
 * - Photo picker 112px
 * - 3 section card dengan header + body
 */
export function MemberFormSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Photo */}
      <div className="flex flex-col items-center">
        <Skeleton variant="rect" width={112} height={112} />
        <Skeleton width={128} height={24} className="mt-3 rounded-full" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-card rounded-2xl border border-surface-border shadow-sm overflow-hidden"
        >
          {/* Section header */}
          <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
            <Skeleton variant="rect" width={36} height={36} />
            <div className="space-y-1.5 flex-1">
              <Skeleton width={96} height={16} />
              <Skeleton width={128} height={12} />
            </div>
          </div>

          {/* Section body */}
          <div className="p-4 space-y-4">
            {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton width={80} height={12} />
                <Skeleton width="100%" height={48} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Card Skeleton                                 */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk Card generik — dapat dikombinasikan dengan berbagai varian konten.
 */
export function CardSkeleton({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface-card rounded-2xl border border-surface-border shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                          Attendance Skeleton                               */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton untuk CompactAttendanceRow — mirror:
 * - min-h-[56px] px-4
 * - Nama + kelompok
 * - 4 tombol status w-10 h-10
 */
export function AttendanceRowSkeleton({
  divider = true,
}: {
  divider?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 min-h-[56px] ${
        divider ? "border-b border-surface-border" : ""
      }`}
    >
      <div className="flex-1 min-w-0 py-2 space-y-2">
        <Skeleton width="50%" height={16} />
        <Skeleton width="30%" height={12} />
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rect" width={40} height={40} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton untuk list absensi penuh.
 */
export function AttendanceListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="bg-surface-card">
      {Array.from({ length: rows }).map((_, i) => (
        <AttendanceRowSkeleton key={i} divider={i !== rows - 1} />
      ))}
    </div>
  );
}

export function AttendancePageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      <div className="pt-3 pb-2">
        <div className="px-4">
          <div className="w-full min-h-[52px] rounded-2xl border border-surface-border bg-surface-card px-4 py-2.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-card2 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-3 w-16 rounded-md bg-surface-card2 animate-pulse" />
              <div className="h-4 w-2/3 rounded-md bg-surface-card2 animate-pulse" />
              <div className="h-3 w-1/2 rounded-md bg-surface-card2 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="sticky px-4 z-20 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="pt-2 pb-2">
          <div className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card" />
        </div>

        <div className="pb-3 space-y-3">
          <div className="flex gap-2 overflow-hidden">
            {[56, 72, 88, 64, 80].map((w, i) => (
              <div
                key={`cat-${i}`}
                className="h-7 rounded-full bg-surface-card2 animate-pulse flex-shrink-0"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>

          <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
            <div className="flex-1 h-9 bg-surface-card2 animate-pulse" />
            <div className="w-px bg-surface-border" />
            <div className="flex-1 h-9 bg-surface-card2 animate-pulse" />
            <div className="w-px bg-surface-border" />
            <div className="flex-1 h-9 bg-surface-card2 animate-pulse" />
          </div>
        </div>

        <div className="py-2 flex items-center justify-between gap-2 border-t border-surface-border">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded-md bg-surface-card2 animate-pulse" />
            <div className="w-16 h-1.5 rounded-full bg-surface-card2 animate-pulse" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-surface-card2 animate-pulse" />
        </div>
      </div>

      <div className="bg-surface-card">
        {Array.from({ length: rows }).map((_, i) => (
          <AttendanceRowSkeleton key={i} divider={i !== rows - 1} />
        ))}
      </div>
    </>
  );
}

export function SettingsSkeleton() {
  return (
    <GroupedList>
      <div className="p-4 space-y-4">
        {/* Judul */}
        <div className="space-y-2">
          <Skeleton width={192} height={20} />
          <Skeleton width="100%" height={16} />
        </div>

        {/* Input */}
        <div className="space-y-2">
          <Skeleton width={80} height={16} />
          <Skeleton width="100%" height={48} />
        </div>

        {/* Tombol */}
        <Skeleton width="100%" height={48} />
      </div>
    </GroupedList>
  );
}

export function UsersSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <GroupedList>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 min-h-[60px] px-4 py-3 ${
            i !== rows - 1 ? "ios-list-divider" : ""
          }`}
        >
          {/* Icon skeleton */}
          <Skeleton variant="rect" width={36} height={36} />
          {/* Text skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton width="40%" height={16} />
            <Skeleton width="25%" height={12} />
          </div>
          {/* Badge skeleton */}
          <Skeleton
            variant="rect"
            width={80}
            height={24}
            className="rounded-full"
          />
        </div>
      ))}
    </GroupedList>
  );
}

export function PendingMembersSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <div className="px-4 py-2.5 border-b border-surface-border">
        <div className="flex gap-2 overflow-hidden">
          {[72, 88, 96, 80].map((w, i) => (
            <Skeleton key={i} width={w} height={32} className="rounded-full" />
          ))}
        </div>
      </div>
      <GroupedList>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 min-h-[60px] px-4 py-3 ${
              i !== rows - 1 ? "ios-list-divider" : ""
            }`}
          >
            <Skeleton variant="rect" width={40} height={40} />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton width="50%" height={16} />
              <Skeleton width="35%" height={12} />
            </div>
            <Skeleton
              variant="rect"
              width={64}
              height={24}
              className="rounded-full"
            />
          </div>
        ))}
      </GroupedList>
    </>
  );
}
