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
  type LucideIcon,
} from "../components/common/FontAwesomeIcons";
import { AppLayout } from "../components/layout/AppLayout";
import { Card, Avatar, ErrorState } from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { dashboardApi } from "../services/domainApi";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import type {
  DashboardAbsensi,
  DashboardGeneral,
  DashboardPNKB,
} from "../types";
import { ApiError } from "../services/api";
import {
  HeroCardSkeleton,
  StatTileSkeleton,
  SectionHeaderSkeleton,
  CategoryDistributionSkeleton,
  MeetingCardSkeleton,
  AttentionCardSkeleton,
} from "../components/common/Skeleton";

type IconType = LucideIcon;

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<
    DashboardGeneral | DashboardPNKB | DashboardAbsensi | null
  >(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await dashboardApi.general();
      setData(res as any);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat dashboard",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* ------------------------------ Header ------------------------------ */}
      <div className="sticky top-0 z-30 border-b border-surface-border backdrop-blur-xl bg-surface-bg/80 pt-safe">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <p className="text-ios-footnote text-surface-muted">{greeting},</p>
            <h1 className="text-[19px] font-semibold text-surface-text leading-tight tracking-[-0.01em] truncate">
              {user?.nama}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Ganti mode tampilan"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all hover:bg-surface-card2 active:scale-95"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Avatar
              name={user?.nama || "?"}
              size={40}
              gender={normalizeGender(user?.jenis_kelamin)}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------ Content ----------------------------- */}
      <div className="px-4 py-4 space-y-4">
        {loading && <DashboardSkeleton />}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && data && user?.role === "TIM_PNKB" && (
          <PNKBDashboard data={data as DashboardPNKB} />
        )}
        {!loading && !error && data && user?.role === "TIM_ABSENSI" && (
          <AbsensiDashboard data={data as DashboardAbsensi} />
        )}
        {!loading &&
          !error &&
          data &&
          (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
            <GeneralDashboard
              data={data as DashboardGeneral}
              isSuperAdmin={user.role === "SUPER_ADMIN"}
            />
          )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Section Header                                */
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
/*                              Hero Stat Card                                */
/* -------------------------------------------------------------------------- */

/**
 * Hero card dengan soft accent background — bukan solid accent.
 * Ditambah decorative circles untuk tekstur halus tanpa berat.
 */
function HeroStatCard({
  label,
  value,
  footer,
  Icon,
}: {
  label: string;
  value: string | number;
  footer?: string;
  Icon: IconType;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-accent-soft border border-accent/15 shadow-sm p-5">
      {/* Decorative circles — subtle texture */}
      <div
        className="absolute -right-10 -top-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />
      <div
        className="absolute -right-2 -bottom-16 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "rgb(var(--c-accent) / 0.06)" }}
      />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-accent/75">{label}</p>
          <span className="w-9 h-9 rounded-xl bg-accent/10 backdrop-blur-sm flex items-center justify-center">
            <Icon size={17} className="text-accent" />
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-[34px] font-bold text-accent tabular-nums tracking-[-0.03em] leading-none">
            {value}
          </span>
        </div>

        {/* Footer */}
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
/*                                Stat Tile                                   */
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
/*                              Meeting Card                                  */
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
/*                          Attention List Section                            */
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
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <SectionHeader
        title="Perlu Perhatian"
        Icon={AlertTriangle}
        iconColor="text-warning"
        onSeeAll={() => navigate("/jamaah")}
      />
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          General Dashboard                                 */
/* -------------------------------------------------------------------------- */

function GeneralDashboard({
  data,
  isSuperAdmin,
}: {
  data: DashboardGeneral;
  isSuperAdmin: boolean;
}) {
  const navigate = useNavigate();

  const totalKategori = Object.values(data.per_kategori).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <>
      {/* Hero */}
      <HeroStatCard
        label="Total Jamaah Aktif"
        value={data.total_jamaah}
        footer="Data diperbarui hari ini"
        Icon={Users}
      />

      {/* Row 1 */}
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

      {/* Row 2 — Super admin only */}
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

      {/* Distribusi kategori */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-surface-muted font-medium">
            Jamaah per Kategori
          </p>
          <span className="text-[10px] font-medium text-surface-muted tabular-nums">
            Total {totalKategori}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.per_kategori).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between bg-surface-card2 rounded-xl px-3 py-2.5"
            >
              <span className="text-ios-footnote text-surface-text">
                {CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]}
              </span>
              <span className="text-xs font-semibold text-surface-text tabular-nums">
                {v}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pengajian terdekat */}
      {data.pengajian_terdekat && (
        <div className="space-y-2">
          <SectionHeader
            title="Pengajian Terdekat"
            onSeeAll={() => navigate("/absensi")}
          />
          <MeetingCard
            meeting={data.pengajian_terdekat}
            onClick={() => navigate("/absensi")}
          />
        </div>
      )}

      {/* Perlu perhatian */}
      <AttentionListSection items={data.jamaah_perlu_perhatian} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                          PNKB Dashboard                                    */
/* -------------------------------------------------------------------------- */

function PNKBDashboard({ data }: { data: DashboardPNKB }) {
  return (
    <>
      <HeroStatCard
        label="Jamaah Pra Nikah"
        value={data.total}
        footer={`${data.aktif} aktif dalam pembinaan`}
        Icon={Heart}
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
/*                          Absensi Dashboard                                 */
/* -------------------------------------------------------------------------- */

function AbsensiDashboard({ data }: { data: DashboardAbsensi }) {
  const navigate = useNavigate();
  return (
    <>
      <HeroStatCard
        label="Jamaah Diabsen Hari Ini"
        value={data.jumlah_jamaah}
        footer={`${data.hadir} hadir`}
        Icon={CheckCircle2}
      />

      <SectionHeader
        title="Pengajian Hari Ini"
        onSeeAll={() => navigate("/absensi")}
      />
      {data.pengajian_hari_ini.length === 0 && (
        <Card>
          <p className="text-sm text-surface-muted">
            Tidak ada jadwal pengajian hari ini.
          </p>
        </Card>
      )}
      {data.pengajian_hari_ini.map((m) => (
        <MeetingCard
          key={m.meeting_id}
          meeting={{
            meeting_id: m.meeting_id,
            tanggal: new Date().toISOString(),
            hari: "Hari Ini",
            acara: m.acara,
            jam: m.jam,
          }}
          onClick={() => navigate("/absensi")}
        />
      ))}

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
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Dashboard Skeleton                                */
/* -------------------------------------------------------------------------- */

/**
 * Skeleton lengkap yang mirror layout dashboard:
 * 1. Hero card
 * 2. Stat tiles (2 baris × 2 tile)
 * 3. Kartu distribusi kategori
 * 4. Section header + meeting card
 * 5. Section header + 2 attention card
 *
 * Total tinggi ≈ dashboard asli, sehingga saat data muncul
 * tidak ada "lompatan" layout.
 */
function DashboardSkeleton() {
  return (
    <>
      {/* 1. Hero card */}
      <HeroCardSkeleton />

      {/* 2. Stat tiles — row 1 */}
      <div className="flex gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      {/* 2. Stat tiles — row 2 */}
      <div className="flex gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>

      {/* 3. Distribusi kategori */}
      <CategoryDistributionSkeleton />

      {/* 4. Pengajian terdekat */}
      <div className="space-y-2">
        <SectionHeaderSkeleton />
        <MeetingCardSkeleton />
      </div>
    </>
  );
}
