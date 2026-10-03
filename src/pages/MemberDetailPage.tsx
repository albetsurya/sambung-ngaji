import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Users,
  GraduationCap,
  Calendar,
  Heart,
  UserPlus,
  ArrowUpRight,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  Download,
  KeyRound,
} from "../components/ui/FontAwesomeIcons";
import {
  Button,
  Input,
  Select,
  BottomSheet,
  ConfirmDialog,
  LoadingOverlay,
  MemberSelfSkeleton,
  RoleBadge,
  AccountBadge,
} from "../components/ui";
import { userApi, meetingApi, moodApi } from "../services/domainApi";
import type { Role } from "../types";
import { useToast } from "../contexts/ToastContext";
import { ROLE_LABEL } from "../hooks/usePermission";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import { Avatar, ErrorState } from "../components/ui";
import { memberApi } from "../features/member/api/memberApi";
import { attendanceApi, monitoringApi } from "../services/domainApi";
import type { Member } from "../types";
import { CATEGORY_LABEL, normalizeGender, getDisplayName } from "../utils/format";
import {
  BiodataTab,
  EducationTab,
  AttendanceTab,
  MoodTab,
  CategoryHeaderBadge,
  MemberStatusChips,
  type AttendanceItem,
} from "../features/member/components/MemberTabs";
import { usePermission } from "../hooks/usePermission";
import { useAuth } from "../contexts/AuthContext";
import { canViewTaarufCv, isTaarufEligible } from "../features/taaruf/lib/taarufAccess";
import { ApiError, abortAllApiCalls } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { MonitoringTab } from "../features/monitoring/components/MonitoringTab";


function generateUsernameFromMember(member: Member): string {
  const panggilan = member.nickname?.trim();
  const fallback = member.full_name?.trim().split(/\s+/)[0] || "";
  const source = panggilan || fallback;
  const clean = source.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean.slice(0, 20) || "user";
}

function generatePasswordFromMember(member: Member): string {
  const tgl = member.birth_date;
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
  { key: "Akun", label: "Akun", Icon: KeyRound },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminLike, role, canManageUsers, isSuperAdmin } = usePermission();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const canEdit = role === "SUPER_ADMIN" || role === "ADMIN";
  const canDeleteMember = canEdit;
  const canSeeAkun = canManageUsers || canDeleteMember;
  const visibleTabs = canSeeAkun
    ? TABS
    : TABS.filter((t) => t.key !== "Akun");
  const [tab, setTab] = useState<TabKey>("Biodata");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [confirmDeleteMember, setConfirmDeleteMember] = useState(false);


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

  const { data: meetings = [] } = useQuery({
    queryKey: queryKeys.meetings(),
    queryFn: () => meetingApi.list(),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const { data: userStatus, refetch: refetchUserStatus } = useQuery({
    queryKey: queryKeys.memberUserStatus(id || ""),
    queryFn: () => memberApi.getUserStatus(id!),
    enabled: !!id && (canManageUsers || role === "ADMIN"),
    staleTime: 30_000,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: () => memberApi.delete(id!),
    onSuccess: () => {
      showToast("Member berhasil dihapus permanen");
      queryClient.invalidateQueries({ queryKey: queryKeys.members() });
      queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users() });
      setConfirmDeleteMember(false);
      navigate("/jamaah", { replace: true });
    },
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus member",
        "error",
      );
      setConfirmDeleteMember(false);
    },
  });

  const { data: moods = [] } = useQuery({
    queryKey: queryKeys.memberMoods(id || ""),
    queryFn: () => moodApi.listMember(id!).catch(() => []),
    enabled: !!id,
    staleTime: 60_000,
  });


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


  const meetingsById: Record<string, (typeof meetings)[number]> = {};
  meetings.forEach((m) => {
    meetingsById[m.meeting_id] = m;
  });

  const attendanceItems: AttendanceItem[] = attendance
    .map((a): AttendanceItem => {
      const m = meetingsById[a.meeting_id];
      const meetingDate = m?.date || "";
      const hari = m?.day || "";
      const acara = m?.event || "Pengajian";
      const jam = m?.time || "";

      return {
        id: a.attendance_id,
        date: meetingDate,
        label: acara,
        sublabel: [hari, meetingDate, jam].filter(Boolean).join(" · "),
        status: a.status,
        libur: m?.status === "LIBUR",
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));


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
      <Header
        title={getDisplayName(member)}
        onBack={() => navigate(-1)}
        right={
          isTaarufEligible(member) &&
          canViewTaarufCv(role, user?.member_id, member.member_id) ? (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => navigate(`/jamaah/${member.member_id}/cv-taaruf`)}
              aria-label="Cetak CV Taaruf"
              title="Cetak CV Taaruf (PDF/Gambar)"
              className="border border-surface-border bg-surface-card hover:bg-surface-card2 shrink-0"
            >
              <Download size={16} />
            </Button>
          ) : undefined
        }
      />

      
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Avatar
          src={member.photo_url}
          name={member.full_name}
          size={64}
          gender={normalizeGender(member?.gender)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold text-surface-text truncate tracking-[-0.01em]">
            {getDisplayName(member)}
          </p>
          {member.group_label && (
            <p className="text-ios-footnote text-surface-muted truncate mt-0.5 flex items-center gap-1">
              <Users size={11} className="shrink-0" />
              {member.group_label}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <AccountBadge hasAccount={member.has_user} />
            {userStatus?.user && <RoleBadge role={userStatus.user.role} />}
            <CategoryHeaderBadge member={member} />
            <MemberStatusChips member={member} inline />
          </div>
        </div>
      </div>

      
      <div
        className="sticky sticky-below-header z-10 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-3 py-2"
      >
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {visibleTabs.map((t) => {
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

      
      <div className="px-4 py-4 anim-fade" key={tab}>
        {tab === "Biodata" && <BiodataTab member={member} />}
        {tab === "Pendidikan" && (
          <EducationTab education={member.pendidikan || []} member={member} />
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
        {tab === "Akun" && canSeeAkun && (
          <div className="space-y-4">
            {canManageUsers && (
              <UserAccountSection
                member={member}
                userStatus={userStatus}
                onOpenCreate={() => setCreateUserOpen(true)}
              />
            )}
            {canDeleteMember && (
              <div className="rounded-2xl border border-danger/30 bg-surface-card shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-danger/20 bg-danger-soft/50">
                  <p className="text-ios-caption text-danger font-semibold">
                    Zona Berbahaya
                  </p>
                </div>
                <div className="p-4">
                  {userStatus?.has_user ? (
                    isSuperAdmin ? (
                      <p className="text-ios-footnote text-surface-muted leading-relaxed">
                            Member ini punya akun user. Hapus permanen
                            hanya bisa lewat Manajemen User (super admin).
                          </p>
                    ) : (
                      <p className="text-ios-footnote text-surface-muted leading-relaxed">
                        Member ini sudah punya akun user. Penghapusan permanen
                        hanya bisa lewat Kelola Akun oleh super admin.
                      </p>
                    )
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteMember(true)}
                      className="w-full text-left rounded-xl border border-danger/30 bg-danger-soft hover:bg-danger-soft/80 p-3.5 flex items-center gap-3 transition-all active:scale-[0.99]"
                    >
                      <span className="w-10 h-10 rounded-xl bg-danger text-white flex items-center justify-center flex-shrink-0">
                        <Trash2 size={16} strokeWidth={2.2} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-body font-medium text-danger">
                          Hapus Member Permanen
                        </p>
                        <p className="text-ios-caption text-danger/80">
                          Belum punya akun. Biodata dan riwayat ikut terhapus.
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {canManageUsers && (
        <CreateUserFromMemberSheet
          open={createUserOpen}
          member={member}
          onClose={() => setCreateUserOpen(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members() });
            queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
            queryClient.invalidateQueries({ queryKey: queryKeys.users() });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
            queryClient.invalidateQueries({ queryKey: queryKeys.memberDetail(id || "") });
            queryClient.invalidateQueries({ queryKey: queryKeys.memberUserStatus(id || "") });
            refetchUserStatus();
            refetch();
            setCreateUserOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteMember}
        title={`Hapus ${member.full_name}?`}
        description="Biodata, foto, riwayat absensi & pembinaan ikut terhapus permanen. Tidak bisa dibatalkan."
        confirmLabel="Ya, Hapus"
        danger
        loading={deleteMemberMutation.isPending}
        onCancel={() => setConfirmDeleteMember(false)}
        onConfirm={() => deleteMemberMutation.mutate()}
      />
    </AppLayout>
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
              <RoleBadge role={userStatus.user.role} />
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
        name: member.full_name,
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
            Buat akun login untuk <strong>{member.full_name}</strong>
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

      <LoadingOverlay open={mutation.isPending} label="Membuat akun..." onCancel={() => abortAllApiCalls()} />
    </>
  );
}
