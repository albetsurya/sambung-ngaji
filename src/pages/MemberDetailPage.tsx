import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  X,
  Thermometer,
  CircleAlert,
  TrendingUp,
  User,
  GraduationCap,
  Calendar,
  Heart,
  UserPlus,
  ArrowUpRight,
} from "../components/common/FontAwesomeIcons";
import {
  Button,
  Input,
  Select,
  BottomSheet,
  LoadingOverlay,
} from "../components/common";
import { userApi } from "../services/domainApi";
import type { Role } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ROLE_LABEL } from "../hooks/usePermission";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Avatar, ErrorState } from "../components/common";
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
import { queryKeys } from "../lib/queryClient";

const TABS = [
  { key: "Biodata", label: "Biodata", Icon: User },
  { key: "Pendidikan", label: "Pendidikan", Icon: GraduationCap },
  { key: "Kehadiran", label: "Kehadiran", Icon: Calendar },
  { key: "Monitoring", label: "Monitoring", Icon: Heart },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STAT_CONFIG: Record<
  string,
  { label: string; Icon: typeof Check; iconColor: string }
> = {
  HADIR: { label: "Hadir", Icon: Check, iconColor: "text-accent" },
  IJIN: { label: "Ijin", Icon: X, iconColor: "text-warning" },
  SAKIT: { label: "Sakit", Icon: Thermometer, iconColor: "text-info" },
  TANPA_KETERANGAN: {
    label: "Alpa",
    Icon: CircleAlert,
    iconColor: "text-danger",
  },
};

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminLike, role, canManageUsers } = usePermission();
  const canEdit = role === "SUPER_ADMIN" || role === "ADMIN";
  const [tab, setTab] = useState<TabKey>("Biodata");
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const {
    data: member,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.memberDetail(id || ""),
    queryFn: () => memberApi.detail(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  const { data: monitoring = [] } = useQuery({
    queryKey: queryKeys.monitoring(id || ""),
    queryFn: () => monitoringApi.list(id!).catch(() => []),
    enabled: !!id,
    staleTime: 60_000,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: queryKeys.attendanceByMember(id || ""),
    queryFn: () => attendanceApi.byMember(id!).catch(() => []),
    enabled: !!id,
    staleTime: 60_000,
  });

    const { data: userStatus, refetch: refetchUserStatus } = useQuery({
      queryKey: queryKeys.memberUserStatus(id || ""),
      queryFn: () => memberApi.getUserStatus(id!),
      enabled: !!id && canManageUsers,
      staleTime: 30_000,
    });

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <Header title="Jamaah" onBack={() => navigate(-1)} />
        <MemberDetailSkeleton />
      </AppLayout>
    );
  }

  if (error || !member) {
    return (
      <AppLayout hideNav>
        <Header title="Jamaah" onBack={() => navigate(-1)} />
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Data tidak ditemukan"
          }
          onRetry={refetch}
        />
      </AppLayout>
    );
  }

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
          canEdit ? (
            <button
              onClick={() => navigate(`/jamaah/${member.member_id}/edit`)}
              className="text-ios-body font-semibold text-accent px-2 h-9 rounded-xl transition-colors hover:bg-accent-soft/60 active:scale-[0.97]"
            >
              Edit
            </button>
          ) : undefined
        }
      />

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

      <div className="px-4 py-4 animate-[fadeIn_0.2s_ease-out]" key={tab}>
        {tab === "Biodata" && <BiodataTab member={member} />}
        {tab === "Pendidikan" && (
          <EducationTab education={member.pendidikan || []} />
        )}
        {tab === "Kehadiran" && (
          <div className="space-y-4">
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

            <TimelineTab events={timelineEvents} />
          </div>
        )}
        {tab === "Monitoring" && (
          <MonitoringTab
            memberId={member.member_id}
            entries={monitoring}
            canWrite={isAdminLike || role === "TIM_PNKB" || role === "PENGAWAS"}
            onSaved={refetch}
          />
        )}
      </div>

      {canManageUsers && (
        <div className="px-4 pb-6">
          <UserAccountSection
            member={member}
            userStatus={userStatus}
            onOpenCreate={() => setCreateUserOpen(true)}
          />
        </div>
      )}

      {canManageUsers && (
        <CreateUserFromMemberSheet
          open={createUserOpen}
          member={member}
          onClose={() => setCreateUserOpen(false)}
          onCreated={() => {
            refetchUserStatus();
            setCreateUserOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}

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

function MemberDetailSkeleton() {
  return (
    <>
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-surface-card2 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-2/5 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-3.5 w-1/4 rounded-md bg-surface-card2 animate-pulse" />
        </div>
      </div>

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

function UserAccountSection({
  member,
  userStatus,
  onOpenCreate,
}: {
  member: Member;
  userStatus?: { has_user: boolean; user: import("../types").User | null };
  onOpenCreate: () => void;
}) {
  const navigate = useNavigate();

  if (!userStatus) return null;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-surface-border bg-surface-card2/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
          <User size={16} />
        </div>
        <div className="min-w-0">
          <h3 className="text-ios-body font-semibold text-surface-text">
            Akun User
          </h3>
          <p className="text-ios-caption text-surface-muted truncate">
            Akun login untuk jamaah ini
          </p>
        </div>
      </div>
      <div className="p-4">
        {userStatus.has_user && userStatus.user ? (
          <div className="space-y-3">
            <div className="flex justify-between gap-3 py-1.5 border-b border-surface-border">
              <span className="text-ios-footnote text-surface-muted">
                Username
              </span>
              <span className="text-ios-body text-surface-text">
                @{userStatus.user.username}
              </span>
            </div>
            <div className="flex justify-between gap-3 py-1.5 border-b border-surface-border">
              <span className="text-ios-footnote text-surface-muted">Role</span>
              <span className="text-ios-body text-surface-text">
                {ROLE_LABEL[userStatus.user.role]}
              </span>
            </div>
            <button
              onClick={() => navigate("/lainnya/users")}
              className="w-full min-h-[44px] rounded-xl border border-surface-border bg-surface-card hover:bg-surface-card2 flex items-center justify-center gap-2 text-ios-subhead font-medium text-accent transition-colors active:scale-[0.98]"
            >
              <ArrowUpRight size={15} />
              Kelola Akun
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-ios-footnote text-surface-muted leading-relaxed">
              Jamaah ini belum punya akun. Buatkan akun agar bisa login dan
              mengelola biodata sendiri.
            </p>
            <Button
              fullWidth
              onClick={onOpenCreate}
              leftIcon={<UserPlus size={16} />}
            >
              Jadikan User
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateUserFromMemberSheet({
  open,
  member,
  onClose,
  onCreated,
}: {
  open: boolean;
  member: Member;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");

  useEffect(() => {
    if (!open) return;
    setUsername(member.no_wa || "");
    setPassword("");
    setRole("MEMBER");
  }, [open, member]);

  const mutation = useMutation({
    mutationFn: () =>
      userApi.create({
        username,
        nama: member.nama_lengkap,
        password,
        role,
        member_id: member.member_id,
      }),
    onSuccess: () => {
      showToast("Akun berhasil dibuat");
      onCreated();
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membuat akun",
        "error",
      );
    },
  });

  const canSubmit = username.trim().length >= 3 && password.length >= 6;

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Jadikan User">
        <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
          <p className="text-ios-footnote text-accent/80 leading-relaxed">
            Buat akun login untuk <strong>{member.nama_lengkap}</strong>
          </p>
        </div>

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {Object.entries(ROLE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>

        <Input
          label="Username"
          placeholder="Minimal 3 karakter"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          hint="Catat password ini dan berikan ke jamaah"
        />

        <Button
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !canSubmit}
          leftIcon={!mutation.isPending ? <UserPlus size={16} /> : undefined}
        >
          {mutation.isPending ? "Memproses..." : "Buat Akun"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={mutation.isPending} label="Membuat akun..." />
    </>
  );
}
