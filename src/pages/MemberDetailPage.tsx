import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  X,
  Thermometer,
  CircleAlert,
  TrendingUp,
  Pencil,
  User,
  GraduationCap,
  Calendar,
  Heart,
} from "lucide-react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Avatar, LoadingState, ErrorState } from "../components/common";
import { memberApi } from "../services/memberApi";
import { attendanceApi, monitoringApi } from "../services/domainApi";
import type { Member, MonitoringEntry, AttendanceRecord } from "../types";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import {
  BiodataTab,
  EducationTab,
  TimelineTab,
  CategoryHeaderBadge,
  type TimelineEvent,
} from "../components/member/MemberTabs";
import { MonitoringTab } from "../components/monitoring/MonitoringTab";
import { usePermission } from "../hooks/usePermission";
import { ATTENDANCE_LABEL } from "../utils/format";
import { ApiError } from "../services/api";

/* -------------------------------------------------------------------------- */
/*                                    Tabs                                    */
/* -------------------------------------------------------------------------- */

const TABS = [
  { key: "Biodata", label: "Biodata", Icon: User },
  { key: "Pendidikan", label: "Pendidikan", Icon: GraduationCap },
  { key: "Kehadiran", label: "Kehadiran", Icon: Calendar },
  { key: "Monitoring", label: "Monitoring", Icon: Heart },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* -------------------------------------------------------------------------- */
/*                              StatBox Config                                */
/* -------------------------------------------------------------------------- */

const STAT_CONFIG: Record<
  string,
  { label: string; Icon: typeof Check; accent: string; iconColor: string }
> = {
  HADIR: {
    label: "Hadir",
    Icon: Check,
    accent: "text-accent",
    iconColor: "text-accent",
  },
  IJIN: {
    label: "Ijin",
    Icon: X,
    accent: "text-warning",
    iconColor: "text-warning",
  },
  SAKIT: {
    label: "Sakit",
    Icon: Thermometer,
    accent: "text-info",
    iconColor: "text-info",
  },
  TANPA_KETERANGAN: {
    label: "Alpa",
    Icon: CircleAlert,
    accent: "text-danger",
    iconColor: "text-danger",
  },
};

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminLike, role } = usePermission();
  const [member, setMember] = useState<Member | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("Biodata");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const [m, mon, att] = await Promise.all([
        memberApi.detail(id),
        monitoringApi.list(id).catch(() => []),
        attendanceApi.byMember(id).catch(() => []),
      ]);
      setMember(m);
      setMonitoring(mon);
      setAttendance(att);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat data jamaah",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  /* ------------------------------- Loading UI ------------------------------- */
  if (loading) {
    return (
      <AppLayout hideNav>
        <Header title="Jamaah" onBack={() => navigate(-1)} />
        <MemberDetailSkeleton />
      </AppLayout>
    );
  }

  /* -------------------------------- Error UI -------------------------------- */
  if (error || !member) {
    return (
      <AppLayout hideNav>
        <Header title="Jamaah" onBack={() => navigate(-1)} />
        <ErrorState message={error || "Data tidak ditemukan"} onRetry={load} />
      </AppLayout>
    );
  }

  /* ---------------------------- Timeline Events ----------------------------- */
  const timelineEvents: TimelineEvent[] = [
    ...attendance.map((a) => ({
      date: a.attendance_id,
      type: "attendance" as const,
      label:
        a.status === "HADIR"
          ? "Hadir pengajian"
          : `Tidak hadir (${ATTENDANCE_LABEL[a.status]})`,
      variant: (a.status === "HADIR"
        ? "success"
        : "danger") as TimelineEvent["variant"],
    })),
    ...monitoring.map((m) => ({
      date: m.tanggal,
      type: "monitoring" as const,
      label: "Monitoring",
      detail: m.catatan,
      variant: "warning" as TimelineEvent["variant"],
    })),
  ]
    .filter((e) => e.type === "monitoring")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  /* --------------------------- Attendance Summary --------------------------- */
  const counts = {
    HADIR: attendance.filter((a) => a.status === "HADIR").length,
    IJIN: attendance.filter((a) => a.status === "IJIN").length,
    SAKIT: attendance.filter((a) => a.status === "SAKIT").length,
    TANPA_KETERANGAN: attendance.filter((a) => a.status === "TANPA_KETERANGAN")
      .length,
  };
  const persentase = attendance.length
    ? Math.round((counts.HADIR / attendance.length) * 100)
    : 0;

  return (
    <AppLayout hideNav>
      <Header
        title={member.nama_lengkap}
        onBack={() => navigate(-1)}
        right={
          isAdminLike ? (
            <button
              onClick={() => navigate(`/jamaah/${member.member_id}/edit`)}
              className="text-ios-body font-semibold text-accent px-2 h-9 rounded-xl transition-colors hover:bg-accent-soft/60 active:scale-[0.97]"
            >
              Edit
            </button>
          ) : undefined
        }
      />

      {/* Profile Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Avatar
          src={member.foto_url}
          name={member.nama_lengkap}
          size={64}
          gender={normalizeGender(member?.jenis_kelamin)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold text-surface-text truncate tracking-[-0.01em]">
            {member.nama_lengkap}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <CategoryHeaderBadge member={member} />
            {member.kelompok && (
              <span className="text-ios-footnote text-surface-muted truncate">
                {member.kelompok}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Bar — segmented pill style */}
      <div
        className="sticky z-10 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-3 py-2"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-ios-footnote font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? "bg-accent text-white shadow-sm shadow-accent/30"
                    : "bg-surface-card text-surface-muted border border-surface-border hover:bg-surface-card2 hover:text-surface-text"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2.2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 animate-[fadeIn_0.2s_ease-out]" key={tab}>
        {tab === "Biodata" && <BiodataTab member={member} />}
        {tab === "Pendidikan" && (
          <EducationTab education={member.pendidikan || []} />
        )}
        {tab === "Kehadiran" && (
          <div className="space-y-4">
            {/* Attendance Summary */}
            <div className="grid grid-cols-4 gap-2">
              {(
                Object.keys(STAT_CONFIG) as Array<keyof typeof STAT_CONFIG>
              ).map((key) => (
                <StatBox
                  key={key}
                  label={STAT_CONFIG[key].label}
                  value={counts[key as keyof typeof counts] ?? 0}
                  Icon={STAT_CONFIG[key].Icon}
                  iconColor={STAT_CONFIG[key].iconColor}
                />
              ))}
            </div>

            {/* Persentase Card */}
            <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center flex-shrink-0">
                <TrendingUp size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-footnote text-surface-muted">
                  Persentase kehadiran
                </p>
                <p className="text-[22px] font-semibold text-surface-text tabular-nums tracking-[-0.02em]">
                  {persentase}%
                </p>
              </div>
              <div className="w-20 h-2 rounded-full bg-surface-card2 overflow-hidden flex-shrink-0">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${persentase}%` }}
                />
              </div>
            </div>

            {/* Timeline */}
            <TimelineTab events={timelineEvents} />
          </div>
        )}
        {tab === "Monitoring" && (
          <MonitoringTab
            memberId={member.member_id}
            entries={monitoring}
            canWrite={isAdminLike || role === "TIM_PNKB"}
            onSaved={load}
          />
        )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  StatBox                                   */
/* -------------------------------------------------------------------------- */

function StatBox({
  label,
  value,
  Icon,
  iconColor,
}: {
  label: string;
  value: number;
  Icon: typeof Check;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm p-3 flex flex-col items-center justify-center gap-1 min-h-[80px]">
      <Icon size={16} className={iconColor} strokeWidth={2.4} />
      <p className="text-[19px] font-semibold text-surface-text tabular-nums tracking-[-0.02em] leading-none">
        {value}
      </p>
      <p className="text-ios-caption text-surface-muted leading-none">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Member Detail Skeleton                            */
/* -------------------------------------------------------------------------- */

function MemberDetailSkeleton() {
  return (
    <>
      {/* Profile header skeleton */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-2/5 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-3.5 w-1/4 rounded-md bg-surface-card2 animate-pulse" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div
        className="sticky z-10 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-3 py-2"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-xl bg-surface-card2 animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Content skeleton — 4 baris field */}
      <div className="px-4 py-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-surface-border bg-surface-card shadow-sm p-4 flex items-center justify-between"
          >
            <div className="h-4 w-1/3 rounded-md bg-surface-card2 animate-pulse" />
            <div className="h-4 w-1/2 rounded-md bg-surface-card2 animate-pulse" />
          </div>
        ))}
      </div>
    </>
  );
}
