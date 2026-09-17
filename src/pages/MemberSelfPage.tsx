import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  GraduationCap,
  Calendar,
  Heart,
  Sparkles,
  Pencil,
  LogOut,
  Sun,
  Moon,
  Settings,
  Landmark,
  Users,
  CalendarCheck,
  Info,
  ChevronLeft,
  HelpCircle,
  Shield,
} from "../components/common/FontAwesomeIcons";
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
  ConfirmDialog,
  GroupedList,
  ListRow,
  Modal,
  ChevronRow,
} from "../components/common";
import { MemberSelfSkeleton } from "../components/common/Skeleton";
import { memberSelfApi } from "../services/memberSelfApi";
import type { Member, MonitoringEntry, Meeting, Education } from "../types";
import {
  CATEGORY_LABEL,
  normalizeGender,
  formatDateShort,
} from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import {
  ThemePickerRow,
  ThemePickerSheet,
} from "../components/common/ThemePickerSheet";
import {
  BiodataTab,
  EducationTab,
  AttendanceTab,
  type AttendanceItem,
} from "../components/member/MemberTabs";
import { MonitoringTab } from "../components/monitoring/MonitoringTab";

const TABS = [
  { key: "profil", label: "Profil", Icon: User },
  { key: "pendidikan", label: "Pendidikan", Icon: GraduationCap },
  { key: "absensi", label: "Absensi", Icon: Calendar },
  { key: "pembinaan", label: "Pembinaan", Icon: Heart },
  { key: "pengaturan", label: "Pengaturan", Icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function MemberSelfPage() {
  const navigate = useNavigate();
  const { isMember } = usePermission();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabKey | null;
  const isValidTab = (t: string | null): t is TabKey =>
    t !== null && TABS.some((x) => x.key === t);
  const [tab, setTab] = useState<TabKey>(
    isValidTab(tabFromUrl) ? tabFromUrl : "profil",
  );

  useEffect(() => {
    if (isValidTab(tabFromUrl)) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const basePath = isMember ? "/member" : "/profil-saya";
  const backPath = isMember ? "/member" : "/lainnya";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    staleTime: 60_000,
    enabled: !!user?.user_id,
  });

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <Header title="Biodata Saya" />
        <MemberSelfSkeleton />
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

  /* Normalize attendance untuk AttendanceTab */
  const attendanceItems: AttendanceItem[] = attendance
    .map(
      (a): AttendanceItem => ({
        id: a.attendance_id,
        date: a.tanggal,
        label: a.acara || "Pengajian",
        sublabel: [a.hari, a.tanggal ? formatDateShort(a.tanggal) : "", a.jam]
          .filter(Boolean)
          .join(" · "),
        status: a.status,
      }),
    )
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <AppLayout
      hideNav
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
        subtitle={profile.kelompok || "Jamaah"}
        onBack={backPath ? () => navigate(backPath) : undefined}
        backLabel="Lainnya"
        showSyncButton
      />

      {/* Header profile */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Avatar
          src={profile.foto_url}
          name={profile.nama_lengkap}
          size={64}
          gender={normalizeGender(profile.jenis_kelamin)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold text-surface-text truncate tracking-[-0.01em]">
            {profile.nama_lengkap}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {profile.kategori && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent-soft text-accent uppercase">
                {CATEGORY_LABEL[profile.kategori]}
              </span>
            )}
            {profile.kelompok && (
              <span className="text-ios-footnote text-surface-muted truncate">
                {profile.kelompok}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
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

      {/* Tab content */}
      <div className="px-4 py-4" key={tab}>
        {tab === "profil" && (
          <ProfileTab profile={profile} upcoming={upcoming} />
        )}
        {tab === "pendidikan" && (
          <EducationTab education={profile.pendidikan || []} />
        )}
        {tab === "absensi" && <AttendanceTab items={attendanceItems} />}
        {tab === "pembinaan" && (
          <MonitoringTab
            memberId={profile.member_id}
            entries={monitoring}
            attendance={attendanceItems
              .filter((a) => a.date)
              .map((a) => ({ date: a.date!, status: a.status }))}
            canWrite={false}
            onSaved={refetch}
          />
        )}
        {tab === "pengaturan" && <SettingsTabSelf />}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROFILE TAB                                   */
/* -------------------------------------------------------------------------- */

function ProfileTab({
  profile,
  upcoming,
}: {
  profile: Member;
  upcoming: Meeting[];
}) {
  return (
    <div className="-mx-4 space-y-4">
      {/* Biodata section — pakai shared component di dalam padding */}
      <div className="px-4">
        <BiodataTab member={profile} />
      </div>

      {/* Jadwal Mendatang */}
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
                  <span className="text-sm font-bold text-accent leading-none mt-0.5 tabular-nums">
                    {new Date(m.tanggal).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 mb-1 uppercase">
                    {m.hari}
                  </span>
                  <p className="font-medium text-sm text-surface-text truncate">
                    {m.acara || "Pengajian"}
                  </p>
                  {m.jam && (
                    <p className="text-xs text-surface-muted truncate">
                      {m.jam}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              SETTINGS TAB                                  */
/* -------------------------------------------------------------------------- */

function SettingsTabSelf() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { isMember } = usePermission();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  return (
    <div className="space-y-4 -mx-4">
      <GroupedList>
        <ListRow
          onClick={toggleTheme}
          insetDivider={false}
          leading={
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
          }
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-ios-body font-medium text-surface-text truncate">
                Mode Tampilan
              </p>
              <p className="text-ios-caption text-surface-muted truncate">
                {theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif"}
              </p>
            </div>
            <span
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                theme === "dark" ? "bg-accent" : "bg-surface-card2"
              }`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </div>
        </ListRow>

        <ThemePickerRow
          onClick={() => setThemePickerOpen(true)}
          insetDivider={false}
        />
      </GroupedList>

      {!isMember && (
        <GroupedList>
          <ListRow
            onClick={() => navigate("/lainnya")}
            insetDivider={false}
            leading={
              <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                <ChevronLeft size={16} />
              </span>
            }
          >
            <ChevronRow>
              <p className="text-ios-body font-medium text-surface-text truncate">
                Kembali ke Halaman Admin
              </p>
            </ChevronRow>
          </ListRow>
        </GroupedList>
      )}

      <GroupedList>
        <ListRow
          onClick={() => setAboutOpen(true)}
          insetDivider={true}
          leading={
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <Info size={16} />
            </span>
          }
        >
          <ChevronRow>
            <p className="text-ios-body font-medium text-surface-text truncate">
              Tentang Aplikasi
            </p>
          </ChevronRow>
        </ListRow>

        <ListRow
          onClick={() => navigate("/member/panduan")}
          insetDivider={true}
          leading={
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <HelpCircle size={16} />
            </span>
          }
        >
          <ChevronRow>
            <p className="text-ios-body font-medium text-surface-text truncate">
              Panduan Penggunaan
            </p>
          </ChevronRow>
        </ListRow>

        <ListRow
          onClick={() => navigate("/member/privasi")}
          insetDivider={false}
          leading={
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              <Shield size={16} />
            </span>
          }
        >
          <ChevronRow>
            <p className="text-ios-body font-medium text-surface-text truncate">
              Kebijakan Privasi
            </p>
          </ChevronRow>
        </ListRow>
      </GroupedList>

      <GroupedList>
        <ListRow
          onClick={() => setConfirmLogoutOpen(true)}
          insetDivider={false}
          className="justify-center"
        >
          <div className="flex items-center gap-2 text-danger">
            <LogOut size={17} />
            <span className="text-ios-body font-medium">Keluar</span>
          </div>
        </ListRow>
      </GroupedList>

      <div className="text-center pt-2 pb-3">
        <p className="text-ios-caption text-surface-muted">
          Manajemen Pengajian · v1.0.0
        </p>
      </div>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Keluar dari aplikasi?"
        description="Anda perlu login kembali untuk mengakses aplikasi."
        confirmLabel="Ya, Keluar"
        danger
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={() => {
          setConfirmLogoutOpen(false);
          logout();
        }}
      />

      <AboutAppModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <ThemePickerSheet
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ABOUT MODAL                                   */
/* -------------------------------------------------------------------------- */

function AboutAppModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Tentang Aplikasi">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 mb-4">
          <Landmark size={40} className="text-white" />
        </div>
        <h3 className="text-[20px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
          Manajemen Pengajian
        </h3>
        <p className="text-ios-footnote text-surface-muted">Versi 1.0.0</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-body text-surface-text leading-relaxed">
            Aplikasi untuk membantu pengelolaan pengajian: biodata jamaah,
            absensi, monitoring pembinaan, dan pengumuman.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Users size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Manajemen Jamaah
              </p>
              <p className="text-ios-caption text-surface-muted">
                Kelola biodata jamaah dengan mudah
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <CalendarCheck size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Absensi Pengajian
              </p>
              <p className="text-ios-caption text-surface-muted">
                Pencatatan kehadiran yang cepat
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Heart size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Monitoring Pembinaan
              </p>
              <p className="text-ios-caption text-surface-muted">
                Pantau perkembangan jamaah
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Asisten AI
              </p>
              <p className="text-ios-caption text-surface-muted">
                Tanya data pribadi via chat
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-border text-center">
        <p className="text-ios-caption text-surface-muted">
          Dibuat dengan ❤️ untuk pengurus Latukan
        </p>
      </div>
    </Modal>
  );
}
