import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  GraduationCap,
  Calendar,
  Heart,
  UserPlus,
  ArrowUpRight,
  Pencil,
  RefreshCw,
  Sparkles,
} from "../components/common/FontAwesomeIcons";
import {
  Button,
  Input,
  Select,
  BottomSheet,
  LoadingOverlay,
  MemberSelfSkeleton,
} from "../components/common";
import { userApi, meetingApi, moodApi } from "../services/domainApi";
import type { Role } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ROLE_LABEL } from "../hooks/usePermission";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import { Avatar, ErrorState } from "../components/common";
import { memberApi } from "../services/memberApi";
import { attendanceApi, monitoringApi } from "../services/domainApi";
import type { Member } from "../types";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import {
  BiodataTab,
  EducationTab,
  AttendanceTab,
  MoodTab,
  CategoryHeaderBadge,
  type AttendanceItem,
} from "../components/member/MemberTabs";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { MonitoringTab } from "../components/monitoring/MonitoringTab";

/* -------------------------------------------------------------------------- */
/*                       AUTO-GENERATE USER CREDENTIALS                       */
/* -------------------------------------------------------------------------- */

function generateUsernameFromMember(member: Member): string {
  const panggilan = member.nama_panggilan?.trim();
  const fallback = member.nama_lengkap?.trim().split(/\s+/)[0] || "";
  const source = panggilan || fallback;
  const clean = source.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean.slice(0, 20) || "user";
}

function generatePasswordFromMember(member: Member): string {
  const tgl = member.tanggal_lahir;
  if (tgl) {
    const iso = tgl.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;

    const dmy = tgl.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmy) {
      const dd = dmy[1].padStart(2, "0");
      const mm = dmy[2].padStart(2, "0");
      return `${dd}${mm}${dmy[3]}`;
    }
  }
  return "latukan354";
}

const TABS = [
  { key: "Biodata", label: "Biodata", Icon: User },
  { key: "Pendidikan", label: "Pendidikan", Icon: GraduationCap },
  { key: "Kehadiran", label: "Kehadiran", Icon: Calendar },
  { key: "Monitoring", label: "Monitoring", Icon: Heart },
  { key: "Mood", label: "Mood", Icon: Sparkles },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminLike, role, canManageUsers } = usePermission();
  const canEdit = role === "SUPER_ADMIN" || role === "ADMIN";
  const [tab, setTab] = useState<TabKey>("Biodata");
  const [createUserOpen, setCreateUserOpen] = useState(false);

  /* ---------------------------- Queries ---------------------------- */

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

  // Me meetings untuk enrich attendance (dapat tanggal/hari/acara)
  const { data: meetings = [] } = useQuery({
    queryKey: queryKeys.meetings(),
    queryFn: () => meetingApi.list(),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const { data: userStatus, refetch: refetchUserStatus } = useQuery({
    queryKey: queryKeys.memberUserStatus(id || ""),
    queryFn: () => memberApi.getUserStatus(id!),
    enabled: !!id && canManageUsers,
    staleTime: 30_000,
  });

  const { data: moods = [] } = useQuery({
    queryKey: queryKeys.memberMoods(id || ""),
    queryFn: () => moodApi.listMember(id!).catch(() => []),
    enabled: !!id,
    staleTime: 60_000,
  });

  /* ---------------------------- Loading/Error ---------------------------- */

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <Header title="Jamaah" onBack={() => navigate(-1)} />
        <MemberSelfSkeleton />
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

  /* ---------------------------- Enrich attendance ---------------------------- */

  const meetingsById: Record<string, (typeof meetings)[number]> = {};
  meetings.forEach((m) => {
    meetingsById[m.meeting_id] = m;
  });

  const attendanceItems: AttendanceItem[] = attendance
    .map((a): AttendanceItem => {
      const m = meetingsById[a.meeting_id];
      const tanggal = m?.tanggal || "";
      const hari = m?.hari || "";
      const acara = m?.acara || "Pengajian";
      const jam = m?.jam || "";

      return {
        id: a.attendance_id,
        date: tanggal,
        label: acara,
        sublabel: [hari, tanggal, jam].filter(Boolean).join(" · "),
        status: a.status,
        libur: m?.status === "LIBUR",
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  /* ---------------------------- Render ---------------------------- */

  return (
    <AppLayout
      hideNav
      fab={
        canEdit ? (
          <FloatingActionButton
            onClick={() => navigate(`/jamaah/${member.member_id}/edit`)}
            label="Edit Biodata"
            variant="secondary"
            icon={<Pencil size={18} strokeWidth={2.2} />}
          />
        ) : undefined
      }
    >
      <Header title={member.nama_lengkap} onBack={() => navigate(-1)} />

      {/* Header profile */}
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

      {/* Sticky Tab bar */}
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
        {tab === "Kehadiran" && <AttendanceTab items={attendanceItems} />}
        {tab === "Mood" && <MoodTab entries={moods} />}
        {tab === "Monitoring" && (
          <MonitoringTab
            memberId={member.member_id}
            entries={monitoring}
            attendance={attendanceItems
              .filter((a) => a.date)
              .map((a) => ({ date: a.date!, status: a.status }))}
            canWrite={isAdminLike || role === "TIM_PNKB" || role === "PENGAWAS"}
            onSaved={refetch}
          />
        )}
      </div>

      {/* User Account Section (khusus admin) */}
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

/* -------------------------------------------------------------------------- */
/*                          USER ACCOUNT SECTION                              */
/* -------------------------------------------------------------------------- */

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
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => navigate("/lainnya/users")}
              leftIcon={<ArrowUpRight size={16} />}
            >
              Kelola Akun
            </Button>
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

/* -------------------------------------------------------------------------- */
/*                       CREATE USER FROM MEMBER SHEET                        */
/* -------------------------------------------------------------------------- */

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
    setUsername(generateUsernameFromMember(member));
    setPassword(generatePasswordFromMember(member));
    setRole("MEMBER");
  }, [open, member.member_id]);

  const handleRegenerate = () => {
    setUsername(generateUsernameFromMember(member));
    setPassword(generatePasswordFromMember(member));
  };

  const mutation = useMutation({
    mutationFn: () =>
      userApi.create({
        username: username.trim(),
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

        <Button
          variant="secondary"
          size="sm"
          fullWidth
          type="button"
          onClick={handleRegenerate}
          leftIcon={<RefreshCw size={14} />}
          className="mb-3"
        >
          Generate Ulang Username & Password
        </Button>

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
          type="text"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
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
