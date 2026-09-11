import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Building2,
  KeyRound,
  Settings,
  ScrollText,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Avatar,
  ConfirmDialog,
  GroupedList,
  ListRow,
  ChevronRow,
} from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePermission } from "../hooks/usePermission";

export default function OthersPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdminLike, isSuperAdmin } = usePermission();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const menu = [
    {
      key: "kelompok",
      label: "Kelompok",
      description: "Kelola kelompok pengajian",
      Icon: Building2,
      to: "/lainnya/kelompok",
      show: isAdminLike,
    },
    {
      key: "users",
      label: "Manajemen User",
      description: "Atur akun & hak akses",
      Icon: KeyRound,
      to: "/lainnya/users",
      show: isSuperAdmin,
    },
    {
      key: "settings",
      label: "Pengaturan",
      description: "Konfigurasi aplikasi",
      Icon: Settings,
      to: "/lainnya/pengaturan",
      show: isAdminLike,
    },
    {
      key: "audit",
      label: "Audit Log",
      description: "Riwayat aktivitas sistem",
      Icon: ScrollText,
      to: "/lainnya/audit-log",
      show: isSuperAdmin,
    },
  ].filter((m) => m.show);

  return (
    <AppLayout>
      <Header title="Lainnya" />

      <div className="py-4">
        {/* ---------------------------- Profile Card ---------------------------- */}
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

        {/* --------------------------- Preferences ---------------------------- */}
        <GroupedList>
          <ListRow onClick={toggleTheme} insetDivider={false}>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent shrink-0">
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body text-surface-text">Mode Tampilan</p>
                <p className="text-ios-caption text-surface-muted">
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
        </GroupedList>

        {/* ----------------------------- Menu Group --------------------------- */}
        {menu.length > 0 && (
          <GroupedList>
            {menu.map((m, i) => {
              const Icon = m.Icon;
              return (
                <ListRow
                  key={m.key}
                  onClick={() => navigate(m.to)}
                  insetDivider={i !== menu.length - 1}
                  leading={
                    <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                      <Icon size={16} />
                    </span>
                  }
                >
                  <ChevronRow>
                    <div className="min-w-0">
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
        )}

        {/* --------------------------- Logout Group --------------------------- */}
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

        {/* ----------------------------- Version ----------------------------- */}
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
    </AppLayout>
  );
}

function roleLabel(role?: string) {
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    TIM_PNKB: "Tim PNKB",
    TIM_ABSENSI: "Tim Absensi",
  };
  return role ? map[role] || role : "";
}
