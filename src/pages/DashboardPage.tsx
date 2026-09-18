import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  FileWarning,
  KeyRound,
  Calendar,
  Heart,
  CheckCircle2,
  ClipboardList,
  Thermometer,
  CircleAlert,
  ArrowUpRight,
  ChevronRight,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  User,
  X,
  type LucideIcon,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ProfileMenuSheet } from "../components/layout/ProfileMenuSheet";
import { Card, Avatar, ErrorState, BottomSheet } from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { dashboardApi } from "../services/domainApi";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import type {
  DashboardAbsensi,
  DashboardGeneral,
  DashboardPNKB,
} from "../types";
import { ApiError } from "../services/api";
import { DashboardSkeleton } from "../components/common/Skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryClient";

type IconType = LucideIcon;

export default function DashboardPage() {
  const { user } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: () => dashboardApi.general(),
    staleTime: 30_000,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 18
          ? "Selamat sore"
          : "Selamat malam";

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        right={
          <button
            onClick={() => setProfileMenuOpen(true)}
            aria-label="Menu profil"
            className="rounded-full overflow-hidden transition-all hover:opacity-80 active:scale-95"
          >
            <Avatar
              name={user?.nama || "?"}
              size={32}
              gender={normalizeGender(user?.jenis_kelamin)}
            />
          </button>
        }
        showThemeToggle={false}
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4">
        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat dashboard"
            }
            onRetry={refetch}
          />
        )}

        {!loading && !error && data && user?.role === "TIM_PNKB" && (
          <PNKBDashboard
            data={data as unknown as DashboardPNKB}
            greeting={greeting}
            userName={user?.nama || ""}
          />
        )}
        {!loading && !error && data && user?.role === "TIM_ABSENSI" && (
          <AbsensiDashboard
            data={data as unknown as DashboardAbsensi}
            greeting={greeting}
            userName={user?.nama || ""}
          />
        )}
        {!loading &&
          !error &&
          data &&
          (user?.role === "SUPER_ADMIN" ||
            user?.role === "ADMIN" ||
            user?.role === "PENGAWAS") && (
            <GeneralDashboard
              data={data as DashboardGeneral}
              isSuperAdmin={user.role === "SUPER_ADMIN"}
              greeting={greeting}
              userName={user?.nama || ""}
            />
          )}
      </div>

      {/* ------------------ Profile Menu Sheet ------------------ */}
      <ProfileMenuSheet
        open={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        profilePath="/profil-saya"
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Profile Menu Sheet                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                        SECTION HEADER                                      */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  onSeeAll,
  Icon,
  iconColor = "text-surface-muted",
}: {
  title: string;
  onSeeAll?: () => void;
  Icon?: IconType;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-0.5 pt-1">
      <h2 className="flex items-center gap-1.5 font-display text-base font-semibold text-surface-text tracking-[-0.01em]">
        {Icon && <Icon size={16} className={iconColor} />}
        {title}
      </h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xs font-medium text-accent transition-colors hover:text-accent-dark"
        >
          Lihat semua
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        HERO STAT CARD                                      */
/* -------------------------------------------------------------------------- */

function HeroStatCard({
  label,
  value,
  footer,
  Icon,
  greeting,
  userName,
}: {
  label: string;
  value: string | number;
  footer?: string;
  Icon: IconType;
  greeting?: string;
  userName?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-accent-soft border border-accent/15 shadow-sm p-5">
      <div
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />
      <div
        className="absolute -right-2 -bottom-16 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />

      <div className="relative">
        {greeting && userName && (
          <>
            <p className="text-ios-footnote text-accent/75">{greeting},</p>
            <h1 className="text-[22px] font-bold text-accent tracking-[-0.02em] leading-tight mt-0.5 truncate">
              {userName}
            </h1>
            <div className="h-px bg-accent/15 my-4" />
          </>
        )}

        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-accent/75">{label}</p>
          <span className="w-9 h-9 rounded-xl bg-accent/10 backdrop-blur-sm flex items-center justify-center">
            <Icon size={17} className="text-accent" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-[34px] font-bold text-accent tabular-nums tracking-[-0.03em] leading-none">
            {value}
          </span>
        </div>

        {footer && (
          <p className="text-xs text-accent/75 mt-3 flex items-center gap-1">
            <ArrowUpRight size={13} className="text-accent" /> {footer}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        STAT TILE                                           */
/* -------------------------------------------------------------------------- */

type StatTone = "default" | "accent" | "warning" | "danger" | "info";

const TONE_CONFIG: Record<
  StatTone,
  { iconBg: string; iconColor: string; valueColor: string }
> = {
  default: {
    iconBg: "bg-surface-card2",
    iconColor: "text-surface-muted",
    valueColor: "text-surface-text",
  },
  accent: {
    iconBg: "bg-accent-soft",
    iconColor: "text-accent",
    valueColor: "text-surface-text",
  },
  warning: {
    iconBg: "bg-warning-soft",
    iconColor: "text-warning",
    valueColor: "text-surface-text",
  },
  danger: {
    iconBg: "bg-danger-soft",
    iconColor: "text-danger",
    valueColor: "text-surface-text",
  },
  info: {
    iconBg: "bg-info-soft",
    iconColor: "text-info",
    valueColor: "text-surface-text",
  },
};

function StatTile({
  label,
  value,
  Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  Icon: IconType;
  tone?: StatTone;
}) {
  const config = TONE_CONFIG[tone];
  return (
    <Card className="flex-1">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-surface-muted font-medium">{label}</p>
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.iconBg}`}
        >
          <Icon size={14} className={config.iconColor} />
        </span>
      </div>
      <p
        className={`font-display text-2xl font-semibold tracking-[-0.02em] tabular-nums ${config.valueColor}`}
      >
        {value}
      </p>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                        MEETING CARD                                        */
/* -------------------------------------------------------------------------- */

function MeetingCard({
  meeting,
  onClick,
}: {
  meeting: {
    meeting_id: string;
    tanggal: string;
    hari: string;
    acara?: string;
    jam?: string;
  };
  onClick?: () => void;
}) {
  const dateNum = new Date(meeting.tanggal).getDate();
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
        <Calendar size={12} className="text-accent" />
        <span className="text-sm font-bold text-accent leading-none mt-0.5 tabular-nums">
          {dateNum}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[10px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 mb-1 uppercase">
          {meeting.hari}
        </span>
        <p className="font-medium text-sm text-surface-text truncate">
          {meeting.acara || "Pengajian"}
        </p>
        {meeting.jam && (
          <p className="text-xs text-surface-muted truncate">{meeting.jam}</p>
        )}
      </div>
      <ChevronRight size={18} className="text-surface-muted flex-shrink-0" />
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                       ATTENTION LIST                                       */
/* -------------------------------------------------------------------------- */

function AttentionListSection({
  items,
}: {
  items: {
    member_id: string;
    nama_lengkap: string;
    foto_url?: string;
    jenis_kelamin?: "L" | "P";
    reasons: string[];
  }[];
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-2">
      <SectionHeader
        title="Perlu Perhatian"
        Icon={AlertTriangle}
        iconColor="text-warning"
        onSeeAll={items.length > 0 ? () => navigate("/jamaah") : undefined}
      />
      {items.length === 0 ? (
        <Card className="flex items-center gap-3 py-5">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-surface-text">
              Semua jamaah dalam kondisi baik
            </p>
            <p className="text-xs text-surface-muted">
              Tidak ada jamaah yang perlu perhatian saat ini
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <Card
              key={m.member_id}
              onClick={() => navigate(`/jamaah/${m.member_id}`)}
              className="flex items-center gap-3"
            >
              <Avatar
                src={m.foto_url}
                name={m.nama_lengkap}
                gender={normalizeGender(m?.jenis_kelamin)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-surface-text truncate">
                  {m.nama_lengkap}
                </p>
                <p className="text-xs text-surface-muted truncate">
                  {m.reasons[0]}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="text-surface-muted flex-shrink-0"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     GENERAL DASHBOARD                                      */
/* -------------------------------------------------------------------------- */

function GeneralDashboard({
  data,
  isSuperAdmin,
  greeting,
  userName,
}: {
  data: DashboardGeneral;
  isSuperAdmin: boolean;
  greeting: string;
  userName: string;
}) {
  const navigate = useNavigate();

  const totalKategori = Object.values(data.per_kategori).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <>
      <HeroStatCard
        label="Total Jamaah Aktif"
        value={data.total_jamaah}
        footer="Data diperbarui hari ini"
        Icon={Users}
        greeting={greeting}
        userName={userName}
      />

      <div className="flex gap-3">
        <StatTile
          label="Kehadiran"
          value={`${data.rata_rata_kehadiran}%`}
          tone="accent"
          Icon={TrendingUp}
        />
        <StatTile
          label="Perlu Perhatian"
          value={data.jamaah_perlu_perhatian.length}
          tone="warning"
          Icon={AlertTriangle}
        />
      </div>

      {isSuperAdmin && (
        <div className="flex gap-3">
          <StatTile
            label="Data Belum Lengkap"
            value={data.data_belum_lengkap}
            tone="warning"
            Icon={FileWarning}
          />
          <StatTile
            label="User Aktif"
            value={data.user_aktif ?? "-"}
            tone="default"
            Icon={KeyRound}
          />
        </div>
      )}

      {/* ============ FIX: kategori → button, navigate ke /jamaah?kategori=X ============ */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-surface-muted font-medium">
            Jamaah per Kategori
          </p>
          <span className="text-[10px] font-medium text-surface-muted tabular-nums">
            Total {totalKategori}
          </span>
        </div>
        {totalKategori === 0 ? (
          <p className="text-ios-footnote text-surface-muted text-center py-4">
            Belum ada data jamaah
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.per_kategori).map(([k, v]) => (
              <button
                key={k}
                onClick={() => navigate(`/jamaah?kategori=${k}`)}
                aria-label={`Lihat jamaah kategori ${
                  CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]
                }`}
                className="flex items-center justify-between gap-2 bg-surface-card2 rounded-xl px-3 py-2.5 transition-all hover:bg-accent-soft active:scale-[0.97] text-left min-h-[44px]"
              >
                <span className="text-ios-footnote text-surface-text truncate">
                  {CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]}
                </span>
                <span className="text-xs font-semibold text-surface-text tabular-nums flex-shrink-0 flex items-center gap-1">
                  {v}
                  <ChevronRight
                    size={12}
                    className="text-surface-muted opacity-60"
                  />
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>
      {/* ========================================================================== */}

      <div className="space-y-2">
        <SectionHeader
          title="Pengajian Terdekat"
          onSeeAll={
            data.pengajian_terdekat ? () => navigate("/absensi") : undefined
          }
        />
        {data.pengajian_terdekat ? (
          <MeetingCard
            meeting={data.pengajian_terdekat}
            onClick={() => navigate("/absensi")}
          />
        ) : (
          <Card className="flex items-center gap-3 py-5">
            <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center text-surface-muted flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-surface-text">
                Belum ada jadwal pengajian
              </p>
              <p className="text-xs text-surface-muted">
                Jadwal akan muncul setelah dibuat
              </p>
            </div>
          </Card>
        )}
      </div>

      <AttentionListSection items={data.jamaah_perlu_perhatian} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                       PNKB DASHBOARD                                       */
/* -------------------------------------------------------------------------- */

function PNKBDashboard({
  data,
  greeting,
  userName,
}: {
  data: DashboardPNKB;
  greeting: string;
  userName: string;
}) {
  return (
    <>
      <HeroStatCard
        label="Jamaah Pra Nikah"
        value={data.total}
        footer={`${data.aktif} aktif dalam pembinaan`}
        Icon={Heart}
        greeting={greeting}
        userName={userName}
      />

      <div className="flex gap-3">
        <StatTile
          label="Perlu Perhatian"
          value={data.perlu_perhatian}
          tone="warning"
          Icon={AlertTriangle}
        />
        <StatTile
          label="Kehadiran"
          value={`${data.kehadiran}%`}
          tone="accent"
          Icon={TrendingUp}
        />
      </div>

      <StatTile
        label="Data Belum Lengkap"
        value={data.data_belum_lengkap}
        tone="warning"
        Icon={FileWarning}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                      ABSENSI DASHBOARD                                     */
/* -------------------------------------------------------------------------- */

function AbsensiDashboard({
  data,
  greeting,
  userName,
}: {
  data: DashboardAbsensi;
  greeting: string;
  userName: string;
}) {
  const navigate = useNavigate();
  return (
    <>
      <HeroStatCard
        label="Jamaah Diabsen Hari Ini"
        value={data.jumlah_jamaah}
        footer={`${data.hadir} hadir dari ${data.total_target} target`}
        Icon={CheckCircle2}
        greeting={greeting}
        userName={userName}
      />

      <div className="space-y-2">
        <SectionHeader
          title="Pengajian Hari Ini"
          onSeeAll={
            data.pengajian_hari_ini.length > 0
              ? () => navigate("/absensi")
              : undefined
          }
        />
        {data.pengajian_hari_ini.length === 0 ? (
          <Card className="flex items-center gap-3 py-5">
            <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center text-surface-muted flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm text-surface-text">
                Tidak ada pengajian hari ini
              </p>
              <p className="text-xs text-surface-muted">
                Jadwal pengajian berikutnya akan muncul di sini
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.pengajian_hari_ini.map((m) => (
              <Card
                key={m.meeting_id}
                onClick={() => navigate("/absensi")}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                  <Calendar size={12} className="text-accent" />
                  <span className="text-[10px] font-bold text-accent leading-none mt-0.5">
                    {m.jam || "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-surface-text truncate">
                    {m.acara || "Pengajian"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {m.kategori_target.length === 0 ? (
                      <span className="text-[10px] font-semibold tracking-wide text-surface-muted bg-surface-card2 rounded-full px-2 py-0.5 uppercase">
                        Semua Kategori
                      </span>
                    ) : (
                      m.kategori_target.map((k) => (
                        <span
                          key={k}
                          className="text-[10px] font-semibold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase"
                        >
                          {CATEGORY_LABEL[k]}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-surface-muted flex-shrink-0"
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <StatTile
          label="Ijin"
          value={data.ijin}
          tone="default"
          Icon={ClipboardList}
        />
        <StatTile
          label="Sakit"
          value={data.sakit}
          tone="default"
          Icon={Thermometer}
        />
        <StatTile
          label="Tanpa Ket."
          value={data.tanpa_keterangan}
          tone="danger"
          Icon={CircleAlert}
        />
      </div>

      {data.by_category.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title="Ringkasan per Kategori" />
          <div className="space-y-2">
            {data.by_category.map((cat, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      {cat.is_semua ? (
                        <span className="text-[11px] font-bold tracking-wide text-surface-text bg-surface-card2 rounded-full px-2 py-0.5 uppercase">
                          Semua Kategori
                        </span>
                      ) : (
                        cat.kategori.map((k) => (
                          <span
                            key={k}
                            className="text-[11px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase"
                          >
                            {CATEGORY_LABEL[k]}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-ios-caption text-surface-muted mt-1">
                      {cat.meeting_count} pengajian · target {cat.total_target}{" "}
                      jamaah
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-lg font-semibold text-surface-text tabular-nums">
                      {cat.persentase}%
                    </p>
                    <p className="text-ios-caption text-surface-muted">
                      kehadiran
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <div className="rounded-lg bg-accent-soft px-2 py-1.5 text-center">
                    <p className="text-[15px] font-bold text-accent tabular-nums leading-none">
                      {cat.hadir}
                    </p>
                    <p className="text-[9px] text-accent/70 mt-0.5 font-medium">
                      HADIR
                    </p>
                  </div>
                  <div className="rounded-lg bg-warning-soft px-2 py-1.5 text-center">
                    <p className="text-[15px] font-bold text-warning tabular-nums leading-none">
                      {cat.ijin}
                    </p>
                    <p className="text-[9px] text-warning/70 mt-0.5 font-medium">
                      IJIN
                    </p>
                  </div>
                  <div className="rounded-lg bg-info-soft px-2 py-1.5 text-center">
                    <p className="text-[15px] font-bold text-info tabular-nums leading-none">
                      {cat.sakit}
                    </p>
                    <p className="text-[9px] text-info/70 mt-0.5 font-medium">
                      SAKIT
                    </p>
                  </div>
                  <div className="rounded-lg bg-danger-soft px-2 py-1.5 text-center">
                    <p className="text-[15px] font-bold text-danger tabular-nums leading-none">
                      {cat.tanpa_keterangan}
                    </p>
                    <p className="text-[9px] text-danger/70 mt-0.5 font-medium">
                      ALPA
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-surface-card2 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${cat.persentase}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
