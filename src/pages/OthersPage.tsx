import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  KeyRound,
  Settings,
  ScrollText,
  LogOut,
  Sun,
  Moon,
  Lock,
  ClipboardList,
  Sparkles,
  QrCode,
  User,
  Calendar,
  Home,
  FileText,
  UserPlus,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Avatar,
  ConfirmDialog,
  GroupedList,
  ListRow,
  ChevronRow,
  ChangePasswordSheet,
} from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePermission } from "../hooks/usePermission";
import { pendingApi } from "../services/pendingApi";
import { useDelayedLoading } from "../hooks/useDelayedLoading";
import { ThemePickerSheet } from "../components/common/ThemePickerSheet";
import { queryKeys } from "../lib/queryClient";

type MenuGroup = "tampilan" | "jamaah" | "jadwal" | "sistem" | "akun";

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
  renderToggle?: boolean;
}

export default function OthersPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdminLike, isSuperAdmin, role } = usePermission();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const { data: pendingList = [], isFetching: pendingLoading } = useQuery({
    queryKey: queryKeys.pendingMembers("PENDING"),
    queryFn: () => pendingApi.list({ status: "PENDING" }),
    enabled: isAdminLike,
    staleTime: 2 * 60_000,
  });

  const pendingCount = pendingList.length;
  const showBadgeSkeleton = useDelayedLoading(pendingLoading, 300);

  const menu = ([
    // Tampilan
    {
      key: "mode-tampilan",
      label: "Mode Tampilan",
      description: theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif",
      Icon: theme === "dark" ? Sun : Moon,
      onClick: toggleTheme,
      show: true,
      group: "tampilan",
      renderToggle: true,
    },
    {
      key: "theme-preset",
      label: "Preset Tema",
      description: "Pilih warna tampilan",
      Icon: Settings,
      onClick: () => setThemePickerOpen(true),
      show: true,
      group: "tampilan",
    },

    // Jamaah & Pendaftaran
    {
      key: "pendaftar",
      label: "Pendaftar",
      description: "Verifikasi pendaftar baru",
      Icon: ClipboardList,
      to: "/lainnya/pendaftar",
      show: isAdminLike,
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
      show: isAdminLike,
      group: "jamaah",
    },
    {
      key: "kelompok",
      label: "Kelompok",
      description: "Kelola kelompok pengajian",
      Icon: Building2,
      to: "/lainnya/kelompok",
      show: isAdminLike,
      group: "jamaah",
    },
    {
      key: "import-jamaah",
      label: "Import Jamaah",
      description: "Paste text biodata dari WhatsApp",
      Icon: FileText,
      to: "/lainnya/import-jamaah",
      show: isAdminLike,
      group: "jamaah",
    },
    {
      key: "qr-code",
      label: "QR Pendaftaran",
      description: "Bagikan link pendaftaran",
      Icon: QrCode,
      to: "/lainnya/qr-code",
      show: isAdminLike,
      group: "jamaah",
    },

    // Jadwal & Absensi
    {
      key: "jadwal",
      label: "Kelola Jadwal",
      description: "Kalender, tambah massal, import PDF",
      Icon: Calendar,
      to: "/lainnya/jadwal",
      show: isAdminLike || role === "TIM_ABSENSI",
      group: "jadwal",
    },

    // Sistem
    {
      key: "users",
      label: "Manajemen User",
      description: "Atur akun & hak akses",
      Icon: KeyRound,
      to: "/lainnya/users",
      show: isSuperAdmin,
      group: "sistem",
    },
    {
      key: "settings",
      label: "Pengaturan",
      description: "Konfigurasi aplikasi",
      Icon: Settings,
      to: "/lainnya/pengaturan",
      show: isAdminLike,
      group: "sistem",
    },
    {
      key: "ai-usage",
      label: "Monitoring AI",
      description: "Statistik pemakaian AI",
      Icon: Sparkles,
      to: "/lainnya/ai-usage",
      show: isAdminLike,
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

    // Akun
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
      key: "profil-saya",
      label: "Biodata Saya",
      description: "Lihat & edit biodata pribadi Anda",
      Icon: User,
      to: "/profil-saya",
      show: true,
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
  ] satisfies MenuEntry[]).filter((m) => m.show);

  const GROUP_LABEL: Record<MenuGroup, string> = {
    tampilan: "Tampilan",
    jamaah: "Jamaah & Pendaftaran",
    jadwal: "Jadwal & Absensi",
    sistem: "Sistem",
    akun: "Akun",
  };

  const GROUP_ORDER: MenuGroup[] = [
    "tampilan",
    "jamaah",
    "jadwal",
    "sistem",
    "akun",
  ];

  function renderMenuGroup(groupKey: MenuGroup) {
    const items = menu.filter((m) => m.group === groupKey);
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
              {m.renderToggle ? (
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-body text-surface-text">{m.label}</p>
                    {m.description && (
                      <p className="text-ios-caption text-surface-muted truncate">
                        {m.description}
                      </p>
                    )}
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
              ) : (
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
              )}
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
          <ListRow insetDivider={false} className="py-3.5">
            <div className="flex items-center gap-3">
              <Avatar name={user?.nama || "?"} size={52} gender="L" />
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
            </div>
          </ListRow>
        </GroupedList>

        {GROUP_ORDER.map((g) => renderMenuGroup(g))}

        <GroupedList>
          <ListRow
            onClick={() => setConfirmLogout(true)}
            insetDivider={false}
            className="justify-center"
          >
            <div className="flex items-center gap-2 text-danger">
              <LogOut size={17} />
              <span className="text-ios-body font-medium">Keluar</span>
            </div>
          </ListRow>
        </GroupedList>

        <div className="text-center pt-5 pb-3">
          <p className="text-ios-caption text-surface-muted">
            Manajemen Pengajian · v1.0.0
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
