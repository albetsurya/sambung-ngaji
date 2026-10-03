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
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ProfileMenuSheet } from "../components/layout/ProfileMenuSheet";
import { Card, Avatar, ErrorState, BottomSheet, Button, GroupedList, ListRow, ChevronRow, EmptyState } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { dashboardApi } from "../services/domainApi";
import { memberApi } from "../features/member/api/memberApi";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import { Download } from "../components/ui/FontAwesomeIcons";
import type {
  DashboardAbsensi,
  DashboardGeneral,
} from "../types";
import { ApiError } from "../services/api";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermission } from "../hooks/usePermission";
import { queryKeys } from "../lib/queryClient";

type IconType = LucideIcon;

export default function DashboardPage() {
  const { user } = useAuth();
  const { assignedGroup } = usePermission();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.dashboard(assignedGroup),
    queryFn: () =>
      dashboardApi.general(assignedGroup ? { group_id: assignedGroup } : {}),
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
              src={user?.photo_url}
              name={user?.name || "?"}
              size={32}
              gender={normalizeGender(user?.gender)}
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

        {!loading && !error && user?.role === "TIM_PNKB" && (
          <PNKBDashboard greeting={greeting} userName={user?.name || ""} />
        )}
        {!loading &&
          !error &&
          data &&
          (user?.role === "SUPER_ADMIN" ||
            user?.role === "ADMIN" ||
            user?.role === "PENGAWAS" ||
            user?.role === "TIM_KU" ||
            user?.role === "TIM_ABSENSI") && (
            <GeneralDashboard
              data={data as DashboardGeneral}
              isSuperAdmin={user.role === "SUPER_ADMIN"}
              greeting={greeting}
              userName={user?.name || ""}
            />
          )}
      </div>

      
      <ProfileMenuSheet
        open={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        profilePath="/my-profile"
      />
    </AppLayout>
  );
}



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
      <h2 className="flex items-center gap-1.5 font-display text-ios-body font-semibold text-surface-text tracking-[-0.01em]">
        {Icon && <Icon size={16} className={iconColor} />}
        {title}
      </h2>
      {onSeeAll && (
        <Button variant="ghost" size="xs" onClick={onSeeAll}>
          Lihat semua
        </Button>
      )}
    </div>
  );
}


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
          <p className="text-ios-caption font-medium text-accent/75">{label}</p>
          <span className="w-9 h-9 rounded-xl bg-accent/10 backdrop-blur-sm flex items-center justify-center">
            <Icon size={16} className="text-accent" />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-[34px] font-bold text-accent tabular-nums tracking-[-0.03em] leading-none">
            {value}
          </span>
        </div>

        {footer && (
          <p className="text-ios-caption text-accent/75 mt-3 flex items-center gap-1">
            <ArrowUpRight size={14} className="text-accent" /> {footer}
          </p>
        )}
      </div>
    </div>
  );
}


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
        <p className="text-ios-caption text-surface-muted font-medium">{label}</p>
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


function MeetingCard({
  meeting,
  onClick,
}: {
  meeting: {
    meeting_id: string;
    date: string;
    day: string;
    event?: string;
    time?: string;
  };
  onClick?: () => void;
}) {
  const dateNum = new Date(meeting.date).getDate();
  return (
    <Card onClick={onClick} className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
        <Calendar size={12} className="text-accent" />
        <span className="text-ios-subhead font-bold text-accent leading-none mt-0.5 tabular-nums">
          {dateNum}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[10px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 mb-1 uppercase">
          {meeting.day}
        </span>
        <p className="font-medium text-ios-subhead text-surface-text truncate">
          {meeting.event || "Pengajian"}
        </p>
        {meeting.time && (
          <p className="text-ios-caption text-surface-muted truncate">{meeting.time}</p>
        )}
      </div>
      <ChevronRight size={18} className="text-surface-muted flex-shrink-0" />
    </Card>
  );
}


function AttentionListSection({
  items,
}: {
  items: {
    member_id: string;
    full_name: string;
    photo_url?: string;
    gender?: "L" | "P";
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
        onSeeAll={items.length > 0 ? () => navigate("/members") : undefined}
      />
      {items.length === 0 ? (
        <Card className="flex items-center gap-3 py-5">
          <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ios-subhead text-surface-text">
              Semua jamaah dalam kondisi baik
            </p>
            <p className="text-ios-caption text-surface-muted">
              Tidak ada jamaah yang perlu perhatian saat ini
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((m) => (
            <Card
              key={m.member_id}
              onClick={() => navigate(`/members/${m.member_id}`)}
              className="flex items-center gap-3"
            >
              <Avatar
                src={m.photo_url}
                name={m.full_name}
                gender={normalizeGender(m?.gender)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ios-subhead text-surface-text truncate">
                  {m.full_name}
                </p>
                <p className="text-ios-caption text-surface-muted truncate">
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

      
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-ios-caption text-surface-muted font-medium">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {Object.entries(data.per_kategori).map(([k, v]) => (
              <button
                key={k}
                onClick={() => navigate(`/members?kategori=${k}`)}
                aria-label={`Lihat jamaah kategori ${
                  CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]
                }`}
                className="flex items-center justify-between gap-2 bg-surface-card2 rounded-xl px-3 py-2.5 transition-all hover:bg-accent-soft active:scale-[0.97] text-left min-h-[44px]"
              >
                <span className="text-ios-footnote text-surface-text truncate">
                  {CATEGORY_LABEL[k as keyof typeof CATEGORY_LABEL]}
                </span>
                <span className="text-ios-caption font-semibold text-surface-text tabular-nums flex-shrink-0 flex items-center gap-1">
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
      

      <div className="space-y-2">
        <SectionHeader
          title="Pengajian Terdekat"
          onSeeAll={
            data.pengajian_terdekat ? () => navigate("/attendance") : undefined
          }
        />
        {data.pengajian_terdekat ? (
          <MeetingCard
            meeting={data.pengajian_terdekat}
            onClick={() => navigate("/attendance")}
          />
        ) : (
          <Card className="flex items-center gap-3 py-5">
            <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center text-surface-muted flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ios-subhead text-surface-text">
                Belum ada jadwal pengajian
              </p>
              <p className="text-ios-caption text-surface-muted">
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


function PNKBDashboard({
  greeting,
  userName,
}: {
  greeting: string;
  userName: string;
}) {
  const navigate = useNavigate();
  const { assignedGroup } = usePermission();
  const { data: pnkbList = [], isLoading: loadingPnkb } = useQuery({
    queryKey: ["members-pnkb", assignedGroup ?? "all"],
    queryFn: () =>
      memberApi.listPNKB(assignedGroup ? { group_id: assignedGroup } : {}),
    staleTime: 60_000,
  });

  const total = pnkbList.length;
  const aktif = pnkbList.filter(
    (m) => (m.mentoring_status || "AKTIF") === "AKTIF",
  ).length;
  const perluPerhatian = pnkbList.filter(
    (m) => (m.mentoring_status || "AKTIF") !== "AKTIF",
  ).length;
  const belumLengkap = pnkbList.filter(
    (m) => !m.birth_date || !m.whatsapp_number || !m.home_address,
  ).length;
  const ikhwan = pnkbList.filter((m) => m.gender === "L").length;
  const akhwat = pnkbList.filter((m) => m.gender === "P").length;
  const preview = pnkbList.slice(0, 5);

  return (
    <>
      <HeroStatCard
        label="Binaan Pra Nikah & Keluarga Bahagia"
        value={loadingPnkb ? "…" : total}
        footer={
          loadingPnkb
            ? "Memuat data binaan…"
            : `${aktif} aktif dibina · ${ikhwan} ikhwan · ${akhwat} akhwat`
        }
        Icon={Heart}
        greeting={greeting}
        userName={userName}
      />

      <div className="flex gap-3">
        <StatTile
          label="Perlu Perhatian"
          value={loadingPnkb ? "…" : perluPerhatian}
          tone="warning"
          Icon={AlertTriangle}
        />
        <StatTile
          label="Biodata Belum Lengkap"
          value={loadingPnkb ? "…" : belumLengkap}
          tone="warning"
          Icon={FileWarning}
        />
      </div>

      <div className="space-y-2">
        <SectionHeader
          title="Siap Taaruf"
          onSeeAll={
            total > 0 ? () => navigate("/members?kategori=PRA_NIKAH") : undefined
          }
        />
        {loadingPnkb ? (
          <Card className="py-5">
            <p className="text-ios-caption text-surface-muted text-center">
              Memuat biodata binaan…
            </p>
          </Card>
        ) : total === 0 ? (
          <EmptyState
            title="Belum ada binaan pra nikah"
            description="Belum ada jamaah pra nikah, duda, atau janda yang terdata di kelompok ini. Tambahkan lewat menu Jamaah agar bisa dipantau persiapannya."
            action={
              <Button
                size="sm"
                onClick={() => navigate("/members/new")}
              >
                Tambah Jamaah
              </Button>
            }
          />
        ) : (
          <GroupedList>
            {preview.map((m, i) => (
              <ListRow
                key={m.member_id}
                onClick={() => navigate(`/members/${m.member_id}`)}
                insetDivider={i !== preview.length - 1}
                leading={
                  <Avatar
                    src={m.photo_url}
                    name={m.full_name}
                    size={40}
                    gender={normalizeGender(m.gender)}
                  />
                }
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="min-w-0 flex-1">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {m.nickname || m.full_name}
                    </p>
                    <p className="text-ios-caption text-surface-muted truncate">
                      {m.gender === "L" ? "Ikhwan" : m.gender === "P" ? "Akhwat" : "Jamaah"}
                      {m.usia ? ` · ${m.usia} th` : ""}
                      {m.mentoring_status && m.mentoring_status !== "AKTIF"
                        ? ` · ${m.mentoring_status}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/members/${m.member_id}/taaruf-cv`);
                    }}
                    aria-label={`Cetak CV taaruf ${m.full_name}`}
                  >
                    <Download size={13} /> CV
                  </Button>
                </div>
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>

      <div className="space-y-2">
        <SectionHeader title="Persiapan Pernikahan" />
        <div className="grid grid-cols-2 gap-2.5">
          <Card
            onClick={() => navigate("/members?kategori=PRA_NIKAH")}
            className="flex flex-col gap-2 !p-3.5"
          >
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
              <ClipboardList size={16} />
            </span>
            <p className="text-ios-subhead font-semibold text-surface-text leading-tight">
              Kelola Pembinaan
            </p>
            <p className="text-ios-caption text-surface-muted leading-snug">
              Pantau kelancaran & kesiapan menikah tiap binaan
            </p>
          </Card>
          <Card
            onClick={() =>
              preview[0] && navigate(`/members/${preview[0].member_id}/taaruf-cv`)
            }
            className="flex flex-col gap-2 !p-3.5"
          >
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
              <Download size={16} />
            </span>
            <p className="text-ios-subhead font-semibold text-surface-text leading-tight">
              Cetak CV Taaruf
            </p>
            <p className="text-ios-caption text-surface-muted leading-snug">
              Siapkan biodata taaruf untuk proses perkenalan
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}


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
              ? () => navigate("/attendance")
              : undefined
          }
        />
        {data.pengajian_hari_ini.length === 0 ? (
          <Card className="flex items-center gap-3 py-5">
            <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center text-surface-muted flex-shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ios-subhead text-surface-text">
                Tidak ada pengajian hari ini
              </p>
              <p className="text-ios-caption text-surface-muted">
                Jadwal pengajian berikutnya akan muncul di sini
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.pengajian_hari_ini.map((m) => (
              <Card
                key={m.meeting_id}
                onClick={() => navigate("/attendance")}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                  <Calendar size={12} className="text-accent" />
                  <span className="text-[10px] font-bold text-accent leading-none mt-0.5">
                    {m.time || "-"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ios-subhead text-surface-text truncate">
                    {m.event || "Pengajian"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {m.target_categories.length === 0 ? (
                      <span className="text-[10px] font-semibold tracking-wide text-surface-muted bg-surface-card2 rounded-full px-2 py-0.5 uppercase">
                        Semua Kategori
                      </span>
                    ) : (
                      m.target_categories.map((k) => (
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
          label="Izin"
          value={data.izin}
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
          label="Alpa"
          value={data.alpa}
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
                    <p className="font-display text-ios-nav font-semibold text-surface-text tabular-nums">
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
                      {cat.izin}
                    </p>
                    <p className="text-[9px] text-warning/70 mt-0.5 font-medium">
                      IZIN
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
                      {cat.alpa}
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
