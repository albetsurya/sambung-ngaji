import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  KeyRound,
  Settings,
  ScrollText,
  LogOut,
  Lock,
  ClipboardList,
  Sparkles,
  QrCode,
  Calendar,
  CalendarCheck,
  Mosque,
  Home,
  FileText,
  UserPlus,
  Search,
  ChevronRight,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Avatar,
  BottomSheet,
  ConfirmDialog,
  GroupedList,
  ListRow,
  ChevronRow,
  ChangePasswordSheet,
} from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { AppMaintenanceSection } from "../components/ui/AppMaintenanceSection";
import { usePermission, setSuperAdminFocusGroup } from "../hooks/usePermission";
import { normalizeGender } from "../utils/format";
import { pendingApi } from "../features/admin/api/pendingApi";
import { groupApi } from "../services/domainApi";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { ThemePickerSheet } from "../components/ui/ThemePickerSheet";
import { queryKeys } from "../lib/queryClient";
import type { Group } from "../types";
import { GroupedListSkeleton } from "../components/ui/Skeleton";

type MenuGroup = "tampilan" | "jamaah" | "jadwal" | "sistem" | "akun";

const FOCUS_GROUP_KEY = "superadmin_focus_group";

interface MenuEntry {
  key: string;
  label: string;
  description?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  to?: string;
  onClick?: () => void;
  show: boolean;
  group: MenuGroup;
  badge?: number;
  badgeLoading?: boolean;
}

export default function OthersPage() {
  const { user, logout } = useAuth();
  const { isAdminLike, isSuperAdmin, role, assignedGroup, canAccessFinance } = usePermission();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusGroupId, setFocusGroupId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(FOCUS_GROUP_KEY);
    } catch {
      return null;
    }
  });
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");

  const { data: pendingList = [], isFetching: pendingLoading } = useQuery({
    queryKey: queryKeys.pendingMembers("PENDING"),
    queryFn: () => pendingApi.list({ status: "PENDING" }),
    enabled: isAdminLike,
    staleTime: 2 * 60_000,
  });

  const pendingCount = pendingList.length;
  const showBadgeSkeleton = useDelayedLoading(pendingLoading, 300);

  const {
    data: allGroups = [],
    isLoading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    enabled: isSuperAdmin,
    staleTime: 5 * 60_000,
  });

  function selectFocusGroup(groupId: string | null) {
    setFocusGroupId(groupId);
    setSuperAdminFocusGroup(groupId);
  }

  const focusGroup: Group | undefined = useMemo(
    () => allGroups.find((g) => g.group_id === focusGroupId),
    [allGroups, focusGroupId],
  );

  const sheetGroups: Group[] = useMemo(() => {
    const s = groupSearch.toLowerCase().trim();
    if (!s) return allGroups;
    return allGroups.filter(
      (g) =>
        g.group_name.toLowerCase().includes(s) ||
        (g.pembina || "").toLowerCase().includes(s),
    );
  }, [allGroups, groupSearch]);

  const isHubUser =
    (role === "ADMIN" || role === "PENGAWAS" || role === "TIM_ABSENSI") &&
    !!assignedGroup;

  const menu = (
    [
      {
        key: "theme",
        label: "Tampilan & Tema",
        description: "Mode gelap-terang & warna",
        Icon: Settings,
        onClick: () => setThemePickerOpen(true),
        show: true,
        group: "tampilan",
      },

      {
        key: "kelompok-saya",
        label: "Kelompok Saya",
        description: "Anggota, jadwal, absensi & pendaftar kelompok ini",
        Icon: Building2,
        to: "/kelompok-saya",
        show: isHubUser,
        group: "akun",
        badge: pendingCount > 0 ? pendingCount : undefined,
        badgeLoading: pendingLoading,
      },
      {
        key: "pendaftar",
        label: "Pendaftar",
        description: "Verifikasi pendaftar baru",
        Icon: ClipboardList,
        to: "/lainnya/pendaftar",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "jamaah",
        badge: pendingCount > 0 ? pendingCount : undefined,
        badgeLoading: pendingLoading,
      },
      {
        key: "permintaan-member",
        label: "Permintaan Member",
        description: "User minta menjadi member",
        Icon: UserPlus,
        to: "/lainnya/permintaan-member",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "jamaah",
      },
      {
        key: "kelompok",
        label: "Kelompok",
        description: "Kelola kelompok pengajian",
        Icon: Building2,
        to: "/lainnya/kelompok",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "jamaah",
      },
      {
        key: "import-jamaah",
        label: "Import Jamaah",
        description: "Paste text biodata dari WhatsApp",
        Icon: FileText,
        to: "/lainnya/import-jamaah",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "jamaah",
      },
      {
        key: "qr-code",
        label: "QR Pendaftaran",
        description: "Bagikan link pendaftaran",
        Icon: QrCode,
        to: "/lainnya/qr-code",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "jamaah",
      },

      {
        key: "jadwal",
        label: "Kelola Jadwal",
        description: "Kalender, tambah massal, import PDF",
        Icon: Calendar,
        to: "/lainnya/jadwal",
        show:
          (isAdminLike || role === "TIM_ABSENSI") &&
          !isHubUser &&
          !isSuperAdmin,
        group: "jadwal",
      },
      {
        key: "rekap-absensi",
        label: "Rekap Absensi",
        description: "Matriks kehadiran bulanan",
        Icon: CalendarCheck,
        to: "/lainnya/rekap-absensi",
        show:
          (isAdminLike || role === "TIM_ABSENSI" || role === "PENGAWAS") &&
          !isHubUser &&
          !isSuperAdmin,
        group: "jadwal",
      },
      {
        key: "petugas-jumat",
        label: "Petugas Jumat",
        description: "Kelola petugas sholat Jumat",
        Icon: Mosque,
        to: "/lainnya/petugas-jumat",
        show:
          (isAdminLike || role === "TIM_ABSENSI" || role === "PENGAWAS") &&
          !isHubUser &&
          !isSuperAdmin,
        group: "jadwal",
      },

      {
        key: "finance",
        label: "Keuangan",
        description: assignedGroup
          ? "Kas, shodaqoh & zakat kelompok terpilih"
          : "Pilih kelompok dulu, lalu buka kas / shodaqoh / zakat",
        Icon: FileText,
        to: "/finance",
        show: canAccessFinance,
        group: "sistem",
      },
      {
        key: "users",
        label: "Manajemen User",
        description: "Atur akun & hak akses",
        Icon: KeyRound,
        to: "/lainnya/users",
        show: isAdminLike && !isHubUser && !isSuperAdmin,
        group: "sistem",
      },

      {
        key: "tampilan-jamaah",
        label: "Tampilan Jamaah",
        description: "Mode personal: waktu sholat, doa, data pribadi",
        Icon: Home,
        to: "/member",
        show: !!user?.member_id,
        group: "akun",
      },
      {
        key: "change-password",
        label: "Ganti Password",
        description: "Ubah password akun Anda",
        Icon: Lock,
        onClick: () => setChangePasswordOpen(true),
        show: true,
        group: "akun",
      },
      {
        key: "ai-usage",
        label: "Monitoring AI",
        description: "Statistik pemakaian AI",
        Icon: Sparkles,
        to: "/lainnya/ai-usage",
        show: isSuperAdmin,
        group: "sistem",
      },
      {
        key: "audit",
        label: "Audit Log",
        description: "Riwayat aktivitas sistem",
        Icon: ScrollText,
        to: "/lainnya/audit-log",
        show: isSuperAdmin,
        group: "sistem",
      },
    ] satisfies MenuEntry[]
  ).filter((m) => m.show);

  const q = search.toLowerCase().trim();
  const visibleMenu = q
    ? menu.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          (m.description || "").toLowerCase().includes(q),
      )
    : menu;

  const SUPER_SETTING_KEYS = [
    "theme",
    "finance",
    "ai-usage",
    "audit",
    "tampilan-jamaah",
    "change-password",
  ];
  const superSettings = menu.filter((m) => SUPER_SETTING_KEYS.includes(m.key));

  const GROUP_LABEL: Record<MenuGroup, string> = {
    tampilan: "Pengaturan Aplikasi",
    jamaah: "Jamaah & Kelompok",
    jadwal: "Jadwal & Absensi",
    sistem: "Sistem & Hak Akses",
    akun: "Akun Saya",
  };

  const GROUP_ORDER: MenuGroup[] = [
    "tampilan",
    "jamaah",
    "jadwal",
    "akun",
    "sistem",
  ];

  function renderMenuGroup(groupKey: MenuGroup) {
    const items = visibleMenu.filter((m) => m.group === groupKey);
    if (items.length === 0) return null;
    return (
      <section key={groupKey}>
        <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
          {GROUP_LABEL[groupKey]}
        </p>
        <GroupedList>
          {items.map((m, i) => {
            const Icon = m.Icon;
            const handleClick = () => {
              if (m.onClick) m.onClick();
              else if (m.to) navigate(m.to);
            };
            return (
              <ListRow
                key={m.key}
                onClick={handleClick}
                insetDivider={i !== items.length - 1}
                leading={
                  <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                    <Icon size={16} />
                  </span>
                }
              >
                <ChevronRow>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="min-w-0 flex-1">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {m.label}
                      </p>
                      {m.description && (
                        <p className="text-ios-caption text-surface-muted truncate">
                          {m.description}
                        </p>
                      )}
                    </div>
                    {m.badgeLoading && showBadgeSkeleton ? (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-surface-card2 animate-pulse shrink-0">
                        <span className="w-2 h-2 rounded-full bg-surface-muted/40" />
                      </span>
                    ) : m.badge !== undefined ? (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[10px] font-bold shrink-0">
                        {m.badge > 99 ? "99+" : m.badge}
                      </span>
                    ) : null}
                  </div>
                </ChevronRow>
              </ListRow>
            );
          })}
        </GroupedList>
      </section>
    );
  }

  return (
    <AppLayout>
      <Header title="Lainnya" showSyncButton />

      <div className="py-4">
        <GroupedList>
          <ListRow
            insetDivider={false}
            className="py-3.5"
            onClick={() => navigate("/profil-saya")}
          >
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.foto_url}
                name={user?.nama || "?"}
                size={52}
                gender={normalizeGender(user?.jenis_kelamin)}
              />
              <div className="min-w-0 flex-1">
                <p className="text-ios-body font-semibold text-surface-text truncate">
                  {user?.nama}
                </p>
                <p className="text-ios-footnote text-surface-muted truncate">
                  @{user?.username}
                </p>
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent-soft text-accent">
                  {roleLabel(user?.role)}
                </span>
              </div>
              <ChevronRight size={16} className="text-surface-muted shrink-0" />
            </div>
          </ListRow>
        </GroupedList>

        {!isSuperAdmin && (
          <div className="px-4 mt-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari menu..."
                aria-label="Cari menu"
                className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-3.5 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </div>
          </div>
        )}

        {isSuperAdmin && !isHubUser && (
          <section>
            <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
              Kelola
            </p>
            <GroupedList>
              <ListRow
                onClick={() =>
                  navigate(
                    focusGroupId
                      ? `/kelompok-saya?group_id=${focusGroupId}`
                      : "/kelompok-saya",
                  )
                }
                insetDivider={false}
                leading={
                  <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                    <Building2 size={16} />
                  </span>
                }
              >
                <ChevronRow>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="min-w-0 flex-1">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        Kelola Kelompok
                      </p>
                      <p className="text-ios-caption text-surface-muted truncate">
                        {focusGroup
                          ? `Fokus: ${focusGroup.group_name} · Ketuk untuk buka hub`
                          : "Kelola semua atau per kelompok"}
                      </p>
                    </div>
                    {pendingLoading && showBadgeSkeleton ? (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-surface-card2 animate-pulse shrink-0">
                        <span className="w-2 h-2 rounded-full bg-surface-muted/40" />
                      </span>
                    ) : pendingCount > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger text-white text-[10px] font-bold shrink-0">
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    ) : null}
                  </div>
                </ChevronRow>
              </ListRow>
            </GroupedList>
          </section>
        )}

        {isSuperAdmin && (
          <section>
            <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
              Pengaturan
            </p>
            <GroupedList>
              {superSettings.map((m, i) => {
                const Icon = m.Icon;
                const handleClick = () => {
                  if (m.onClick) m.onClick();
                  else if (m.to) navigate(m.to);
                };
                return (
                  <ListRow
                    key={m.key}
                    onClick={handleClick}
                    insetDivider={i !== superSettings.length - 1}
                    leading={
                      <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                        <Icon size={16} />
                      </span>
                    }
                  >
                    <ChevronRow>
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {m.label}
                        </p>
                        {m.description && (
                          <p className="text-ios-caption text-surface-muted truncate">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </ChevronRow>
                  </ListRow>
                );
              })}
            </GroupedList>
          </section>
        )}

        <BottomSheet
          open={groupSheetOpen}
          onClose={() => setGroupSheetOpen(false)}
          title="Pilih Kelompok untuk Dikelola"
        >
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Cari kelompok..."
              aria-label="Cari kelompok"
              className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-3.5 text-[16px] text-surface-text placeholder:text-surface-muted/70 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
          </div>
          {groupsLoading && <GroupedListSkeleton rows={3} />}
          {!groupsLoading && groupsError && (
            <GroupedList flush>
              <ListRow insetDivider={false}>
                <div className="flex items-center justify-between gap-2 w-full">
                  <p className="text-ios-footnote text-danger">
                    Gagal memuat kelompok
                  </p>
                  <button
                    onClick={() => refetchGroups()}
                    className="text-ios-footnote font-semibold text-accent"
                  >
                    Coba lagi
                  </button>
                </div>
              </ListRow>
            </GroupedList>
          )}
          {!groupsLoading && !groupsError && (
            <GroupedList flush>
              <ListRow
                onClick={() => {
                  selectFocusGroup(null);
                  setGroupSheetOpen(false);
                  navigate("/kelompok-saya");
                }}
                insetDivider={sheetGroups.length > 0}
                leading={
                  <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent font-bold shrink-0">
                    S
                  </span>
                }
              >
                <ChevronRow>
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      Semua Kelompok
                    </p>
                    {!focusGroupId && (
                      <span className="text-accent font-bold shrink-0">✓</span>
                    )}
                  </div>
                </ChevronRow>
              </ListRow>
              {sheetGroups.map((g, i) => (
                <ListRow
                  key={g.group_id}
                  onClick={() => {
                    selectFocusGroup(g.group_id);
                    setGroupSheetOpen(false);
                    navigate(`/kelompok-saya?group_id=${g.group_id}`);
                  }}
                  insetDivider={i !== sheetGroups.length - 1}
                  leading={
                    <span className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-[15px] shrink-0">
                      {(g.group_name || "?").charAt(0).toUpperCase()}
                    </span>
                  }
                >
                  <ChevronRow>
                    <div className="flex items-center justify-between gap-2 w-full min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {g.group_name}
                        </p>
                        <p className="text-ios-caption text-surface-muted truncate">
                          {g.pembina
                            ? `Pembina: ${g.pembina}`
                            : "Kelola anggota, jadwal & absensi"}
                          {g.jadwal ? ` · ${g.jadwal}` : ""}
                        </p>
                      </div>
                      {focusGroupId === g.group_id && (
                        <span className="text-accent font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                  </ChevronRow>
                </ListRow>
              ))}
              {sheetGroups.length === 0 && (
                <ListRow insetDivider={false}>
                  <p className="text-ios-footnote text-surface-muted">
                    {allGroups.length === 0
                      ? "Belum ada kelompok. Tambahkan dulu di menu Kelompok."
                      : "Kelompok tidak ditemukan."}
                  </p>
                </ListRow>
              )}
            </GroupedList>
          )}
        </BottomSheet>

        {!isSuperAdmin && GROUP_ORDER.map((g) => renderMenuGroup(g))}

        <AppMaintenanceSection />

        {visibleMenu.length === 0 && (
          <div className="px-4 mt-5">
            <p className="text-ios-body font-medium text-surface-text text-center">
              Tidak ditemukan
            </p>
            <p className="text-ios-caption text-surface-muted text-center mt-1">
              Coba kata kunci lain
            </p>
          </div>
        )}

        <GroupedList>
          <ListRow
            onClick={() => setConfirmLogout(true)}
            insetDivider={false}
            className="justify-center"
          >
            <div className="flex items-center gap-2 text-danger">
              <LogOut size={16} />
              <span className="text-ios-body font-medium">Keluar</span>
            </div>
          </ListRow>
        </GroupedList>

        <div className="text-center pt-5 pb-3">
          <p className="text-ios-caption text-surface-muted">
            Sambung Ngaji · v1.0.0
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Keluar dari aplikasi?"
        description="Anda perlu login kembali untuk mengakses aplikasi."
        confirmLabel="Ya, Keluar"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          logout();
        }}
      />

      <ThemePickerSheet
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
      />
      <ChangePasswordSheet
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </AppLayout>
  );
}

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    TIM_PNKB: "Tim PNKB",
    TIM_ABSENSI: "Tim Absensi",
    PENGAWAS: "Pengawas",
    MEMBER: "Member",
  };
  return role ? map[role] || role : "";
}
