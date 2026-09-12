import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Heart,
  TrendingUp,
  Pencil,
  Sparkles,
  LogOut,
  Sun,
  Moon,
  Settings,
  Landmark,
  Users,
  CalendarCheck,
  Info,
  ChevronRight,
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
  EmptyState,
  ErrorState,
  Badge,
  ConfirmDialog,
  GroupedList,
  ListRow,
  Modal,
  ChevronRow,
} from "../components/common";
import { MemberSelfSkeleton } from "../components/common/Skeleton";
import { memberSelfApi } from "../services/memberSelfApi";
import type {
  Member,
  MyAttendanceEntry,
  MonitoringEntry,
  Meeting,
} from "../types";
import {
  CATEGORY_LABEL,
  normalizeGender,
  formatDateShort,
} from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ApiError } from "../services/api";

const TABS = [
  { key: "profil", label: "Profil", Icon: User },
  { key: "absensi", label: "Absensi", Icon: Calendar },
  { key: "monitoring", label: "Pembinaan", Icon: Heart },
  { key: "pengaturan", label: "Pengaturan", Icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "emerald" | "amber" | "red" | "ink" }
> = {
  HADIR: { label: "Hadir", color: "emerald" },
  IJIN: { label: "Ijin", color: "amber" },
  SAKIT: { label: "Sakit", color: "amber" },
  TANPA_KETERANGAN: { label: "Alpa", color: "red" },
};

export default function MemberSelfPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<MyAttendanceEntry[]>([]);
  const [monitoring, setMonitoring] = useState<MonitoringEntry[]>([]);
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<TabKey>("profil");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await memberSelfApi.getDashboard();
      setProfile(res.profile);
      setAttendance(res.attendance);
      setMonitoring(res.monitoring);
      setUpcoming(res.upcoming);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await memberSelfApi.getDashboard();
        if (cancelled) return;
        setProfile(res.profile);
        setAttendance(res.attendance);
        setMonitoring(res.monitoring);
        setUpcoming(res.upcoming);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Gagal memuat data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <AppLayout hideNav>
        <Header title="Profil Saya" />
        <MemberSelfSkeleton />
      </AppLayout>
    );
  }

  if (error || !profile) {
    return (
      <AppLayout hideNav>
        <Header title="Profil Saya" />
        <ErrorState message={error || "Data tidak ditemukan"} onRetry={load} />
      </AppLayout>
    );
  }

  const hadirCount = attendance.filter((a) => a.status === "HADIR").length;
  const persentase = attendance.length
    ? Math.round((hadirCount / attendance.length) * 100)
    : 0;

  return (
    <AppLayout
      hideNav
      fab={
        <FloatingActionGroup>
          <FloatingActionButton
            onClick={() => navigate("/member/ai")}
            label="Tanya AI"
            variant="secondary"
            icon={<Sparkles size={18} strokeWidth={2.2} />}
          />
          <FloatingActionButton
            onClick={() => navigate("/member/edit")}
            label="Edit Biodata"
            variant="secondary"
            icon={<Pencil size={18} strokeWidth={2.2} />}
          />
        </FloatingActionGroup>
      }
    >
      <Header title="Profil Saya" subtitle={profile.kelompok || "Jamaah"} />

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
              <Badge>{CATEGORY_LABEL[profile.kategori]}</Badge>
            )}
            {profile.kelompok && (
              <span className="text-ios-footnote text-surface-muted truncate">
                {profile.kelompok}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 flex gap-1 overflow-x-auto no-scrollbar border-b border-surface-border pb-2">
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

      <div className="py-4" key={tab}>
        {tab === "profil" && (
          <ProfileTab profile={profile} upcoming={upcoming} />
        )}
        {tab === "absensi" && (
          <AttendanceTab
            attendance={attendance}
            hadirCount={hadirCount}
            persentase={persentase}
          />
        )}
        {tab === "monitoring" && <MonitoringTabSelf entries={monitoring} />}
        {tab === "pengaturan" && <SettingsTabSelf />}
      </div>
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
  const fields = [
    { label: "Nama Panggilan", value: profile.nama_panggilan },
    {
      label: "Jenis Kelamin",
      value:
        profile.jenis_kelamin === "L"
          ? "Laki-laki"
          : profile.jenis_kelamin === "P"
            ? "Perempuan"
            : "-",
    },
    { label: "Tempat Lahir", value: profile.tempat_lahir },
    {
      label: "Tanggal Lahir",
      value: profile.tanggal_lahir
        ? formatDateShort(profile.tanggal_lahir)
        : "-",
    },
    {
      label: "Usia",
      value: profile.usia ? `${profile.usia} tahun` : "-",
    },
    { label: "Kelompok", value: profile.kelompok },
    { label: "Desa", value: profile.desa },
    { label: "Daerah", value: profile.daerah },
    { label: "Alamat", value: profile.alamat_rumah },
    { label: "No. WhatsApp", value: profile.no_wa },
    { label: "Pekerjaan", value: profile.pekerjaan },
    { label: "Hobi", value: profile.hobi },
    { label: "Status Pembinaan", value: profile.status_pembinaan },
  ].filter((f) => f.value && f.value !== "" && f.value !== "-");

  return (
    <div className="px-4 space-y-4">
      <Card>
        <p className="text-ios-footnote font-medium text-surface-muted mb-3 px-0.5">
          Biodata
        </p>
        <div className="space-y-2.5">
          {fields.map((f, i) => (
            <div
              key={i}
              className="flex justify-between gap-3 py-1.5 border-b border-surface-border last:border-b-0"
            >
              <span className="text-ios-footnote text-surface-muted flex-shrink-0">
                {f.label}
              </span>
              <span className="text-ios-body text-surface-text text-right truncate">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div>
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

function AttendanceTab({
  attendance,
  hadirCount,
  persentase,
}: {
  attendance: MyAttendanceEntry[];
  hadirCount: number;
  persentase: number;
}) {
  const counts = {
    HADIR: attendance.filter((a) => a.status === "HADIR").length,
    IJIN: attendance.filter((a) => a.status === "IJIN").length,
    SAKIT: attendance.filter((a) => a.status === "SAKIT").length,
    TANPA_KETERANGAN: attendance.filter((a) => a.status === "TANPA_KETERANGAN")
      .length,
  };

  return (
    <div className="px-4 space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(counts).map(([key, val]) => {
          const config = STATUS_CONFIG[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-surface-border bg-surface-card shadow-sm p-3 flex flex-col items-center justify-center gap-1 min-h-[80px]"
            >
              <p className="text-[19px] font-semibold text-surface-text tabular-nums tracking-[-0.02em] leading-none">
                {val}
              </p>
              <p className="text-ios-caption text-surface-muted leading-none">
                {config.label}
              </p>
            </div>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-3">
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
      </Card>

      <div>
        <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
          Riwayat Absensi
        </p>
        {attendance.length === 0 ? (
          <Card>
            <p className="text-ios-subhead text-surface-muted text-center py-4">
              Belum ada riwayat absensi
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {attendance.map((a) => {
              const config = STATUS_CONFIG[a.status] || {
                label: a.status,
                color: "ink" as const,
              };
              return (
                <Card key={a.attendance_id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-surface-text truncate">
                      {a.acara || "Pengajian"}
                    </p>
                    <p className="text-xs text-surface-muted truncate">
                      {a.hari}, {a.tanggal ? formatDateShort(a.tanggal) : "-"}
                      {a.jam ? ` · ${a.jam}` : ""}
                    </p>
                  </div>
                  <Badge color={config.color}>{config.label}</Badge>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MonitoringTabSelf({ entries }: { entries: MonitoringEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="px-4 space-y-4">
        <Card>
          <p className="text-ios-subhead text-surface-muted text-center py-4">
            Belum ada catatan pembinaan
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      {entries.map((m) => (
        <Card key={m.monitoring_id}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge color={m.status === "AKTIF" ? "emerald" : "amber"}>
              {m.status}
            </Badge>
            <span className="text-ios-caption text-surface-muted">
              {m.tanggal ? formatDateShort(m.tanggal) : "-"}
            </span>
          </div>
          {m.catatan && (
            <p className="text-ios-body text-surface-text leading-relaxed">
              {m.catatan}
            </p>
          )}
          {m.tindak_lanjut && (
            <div className="mt-2 pt-2 border-t border-surface-border">
              <p className="text-ios-caption text-surface-muted mb-1">
                Tindak Lanjut
              </p>
              <p className="text-ios-footnote text-surface-text leading-relaxed">
                {m.tindak_lanjut}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function SettingsTabSelf() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  return (
    <div className="space-y-4">
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
