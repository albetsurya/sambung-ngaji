import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  GraduationCap,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Heart,
  Sparkles,
  Pencil,
  Download,
} from "../components/ui/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
  FloatingActionGroup,
} from "../components/layout/AppLayout";
import {
  Avatar,
  Card,
  ErrorState,
  Button,
} from "../components/ui";
import { MemberSelfSkeleton } from "../components/ui/Skeleton";
import { memberSelfApi } from "../features/member/api/memberSelfApi";
import { memberRequestApi } from "../services/domainApi";
import type { Member, MonitoringEntry, Meeting, Education } from "../types";
import {
  CATEGORY_LABEL,
  normalizeGender,
} from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { goBack } from "../utils/navigation";
import {
  BiodataTab,
  EducationTab,
  MemberStatusChips,
} from "../features/member/components/MemberTabs";
import { TaarufCvSheet } from "../features/taaruf/components/TaarufCvSheet";
import { isTaarufEligible } from "../features/taaruf/lib/taarufAccess";
import { MonitoringTab } from "../features/monitoring/components/MonitoringTab";

const TABS = [
  { key: "profil", label: "Profil", Icon: User },
  { key: "pendidikan", label: "Pendidikan", Icon: GraduationCap },
  { key: "pembinaan", label: "Pembinaan", Icon: Heart },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MemberSelfPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isMember, role } = usePermission();
  const { user, refreshUser } = useAuth();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [requestMsg, setRequestMsg] = useState<string | null>(null);
  const isAdminSelf = role === "SUPER_ADMIN" || role === "ADMIN";
  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const isValidTab = (t: string | null): t is TabKey =>
    t !== null && TABS.some((x) => x.key === t);
  const [tab, setTab] = useState<TabKey>(
    isValidTab(tabFromUrl) ? tabFromUrl : "profil",
  );
  const [taarufOpen, setTaarufOpen] = useState(false);

  useEffect(() => {
    if (isValidTab(tabFromUrl)) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const basePath = isMember ? "/member" : "/profil-saya";
  const backFallback = pathname.startsWith("/member")
    ? "/member/lainnya"
    : "/lainnya";
  const handleBack = () => goBack(navigate, backFallback);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    staleTime: 60_000,
    enabled: !!user?.user_id,
  });

  const becomeMember = useMutation({
    mutationFn: () => memberRequestApi.becomeMember(),
    onSuccess: async (res) => {
      setRequestMsg(res.message);
      if (res.auto_created) {
        await refreshUser();
        qc.invalidateQueries({
          queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
        });
        qc.invalidateQueries({ queryKey: queryKeys.members() });
        qc.invalidateQueries({ queryKey: queryKeys.membersPaged() });
        qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
        setTimeout(() => refetch(), 600);
      }
    },
    onError: (e) =>
      setRequestMsg(
        e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.",
      ),
  });

  const noMemberError =
    !!error &&
    error instanceof ApiError &&
    /belum terhubung ke data jamaah|belum memiliki/i.test(error.message);

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <Header title="Biodata Saya" />
        <MemberSelfSkeleton />
      </AppLayout>
    );
  }

  if (noMemberError) {
    return (
      <AppLayout hideNav showAiChat={false}>
        <Header
          title="Biodata Saya"
          onBack={handleBack}
          backLabel="Kembali"
        />
        <div className="px-5 py-10 flex flex-col items-center text-center">
          <span className="w-16 h-16 rounded-3xl bg-accent-soft flex items-center justify-center text-accent mb-4">
            <User size={28} />
          </span>
          <p className="text-ios-title font-semibold text-surface-text mb-2">
            Akun Anda belum memiliki data member
          </p>
          <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed mb-6">
            {isAdminSelf
              ? "Sebagai admin, Anda bisa langsung membuat data member untuk akun Anda."
              : "Kirim permintaan agar admin menyetujui Anda menjadi member."}
          </p>

          <Button
            variant="primary"
            fullWidth
            className="max-w-xs"
            disabled={becomeMember.isPending}
            onClick={() => becomeMember.mutate()}
          >
            {isAdminSelf ? "Buat Data Member Saya" : "Kirim Permintaan"}
          </Button>

          {requestMsg && (
            <p className="text-ios-footnote text-surface-muted mt-4 leading-relaxed">
              {requestMsg}
            </p>
          )}
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout hideNav>
        <Header title="Biodata Saya" />
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Data tidak ditemukan"
          }
          onRetry={refetch}
        />
      </AppLayout>
    );
  }

  const { profile, attendance, monitoring, upcoming } = data;

  const attendanceHistory = attendance
    .filter((a) => a.date && a.status_meeting !== "LIBUR")
    .map((a) => ({ date: a.date, status: a.status }))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <AppLayout
      showAiChat={false}
      fab={
        <FloatingActionGroup>
          {isMember && (
            <FloatingActionButton
              onClick={() => navigate(`${basePath}/ai`)}
              label="Tanya AI"
              variant="secondary"
              icon={<Sparkles size={18} strokeWidth={2.2} />}
            />
          )}
          <FloatingActionButton
            onClick={() => navigate(`${basePath}/edit`)}
            label="Edit Biodata"
            variant="secondary"
            icon={<Pencil size={18} strokeWidth={2.2} />}
          />
        </FloatingActionGroup>
      }
    >
      <Header
        title={isMember ? "Profil Saya" : "Biodata Saya"}
        subtitle={profile.group_label || "Jamaah"}
        onBack={handleBack}
        backLabel="Kembali"
        showSyncButton
        right={
          isTaarufEligible(profile) ? (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => setTaarufOpen(true)}
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
          src={profile.photo_url}
          name={profile.full_name}
          size={64}
          gender={normalizeGender(profile.gender)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold text-surface-text truncate tracking-[-0.01em]">
            {profile.full_name}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {profile.kategori && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent-soft text-accent uppercase">
                {CATEGORY_LABEL[profile.kategori]}
              </span>
            )}
            {profile.group_label && (
              <span className="text-ios-footnote text-surface-muted truncate">
                {profile.group_label}
              </span>
            )}
          </div>
          <MemberStatusChips member={profile} />
        </div>
      </div>

      
      <div
        className="sticky sticky-below-header z-10 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-3 py-2"
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
                    : "bg-surface-card text-surface-muted border border-surface-border hover:bg-surface-card2"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2.2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      
      <div className="px-4 py-4" key={tab}>
        {tab === "profil" && (
          <ProfileTab profile={profile} upcoming={upcoming} />
        )}
        {tab === "pendidikan" && (
          <EducationTab education={profile.pendidikan || []} member={profile} />
        )}
        {tab === "pembinaan" && (
          <MonitoringTab
            memberId={profile.member_id}
            entries={monitoring}
            attendance={attendanceHistory}
            canWrite={false}
            onSaved={refetch}
          />
        )}
      </div>

      <TaarufCvSheet
        open={taarufOpen}
        member={profile}
        onClose={() => setTaarufOpen(false)}
      />
    </AppLayout>
  );
}


function ProfileTab({
  profile,
  upcoming,
}: {
  profile: Member;
  upcoming: Meeting[];
}) {
  return (
    <div className="-mx-4 space-y-4">
      
      <div className="px-4">
        <BiodataTab member={profile} />
      </div>

      
      <div className="px-4">
        <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
          Jadwal Pengajian Mendatang
        </p>
        {upcoming.length === 0 ? (
          <Card>
            <p className="text-ios-subhead text-surface-muted text-center py-4">
              Tidak ada jadwal pengajian
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m) => (
              <Card key={m.meeting_id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                  <Calendar size={12} className="text-accent" />
                  <span className="text-ios-subhead font-bold text-accent leading-none mt-0.5 tabular-nums">
                    {new Date(m.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 mb-1 uppercase">
                    {m.day}
                  </span>
                  <p className="font-medium text-ios-subhead text-surface-text truncate">
                    {m.event || "Pengajian"}
                  </p>
                  {m.time && (
                    <p className="text-ios-caption text-surface-muted truncate">
                      {m.time}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      
      <div className="px-4">
        <AttendanceHistoryLink />
      </div>
    </div>
  );
}

function AttendanceHistoryLink() {
  const navigate = useNavigate();
  const { user } = useAuth();
  if (!user?.member_id) return null;
  return (
    <button
      onClick={() => navigate("/member/absensi")}
      className="w-full rounded-2xl border border-surface-border bg-surface-card p-3.5 flex items-center gap-3 text-left transition-all active:scale-[0.99] hover:bg-surface-card2"
    >
      <span className="w-10 h-10 rounded-xl bg-success-soft text-success flex items-center justify-center flex-shrink-0">
        <CalendarCheck size={18} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-ios-body font-medium text-surface-text">
          Riwayat Absensi
        </span>
        <span className="block text-ios-caption text-surface-muted truncate">
          Statistik & rekap kehadiran bulanan
        </span>
      </span>
      <ChevronRight size={16} className="text-surface-muted flex-shrink-0" />
    </button>
  );
}
