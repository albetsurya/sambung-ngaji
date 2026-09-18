import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  User,
  Home,
} from "../common/FontAwesomeIcons";
import { Avatar, BottomSheet } from "../common";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { normalizeGender } from "../../utils/format";

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

export interface ProfileMenuItem {
  key: string;
  label: string;
  description?: string;
  icon: ReactNode;
  iconBg: string;
  onClick: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}

interface ProfileMenuSheetProps {
  open: boolean;
  onClose: () => void;
  /** Path ke halaman profil — beda admin vs member */
  profilePath: string;
  /** Item tambahan (muncul antara "Sinkronisasi" dan "Keluar") */
  extraItems?: ProfileMenuItem[];
  /** Path tujuan setelah logout (default: /login) */
  logoutRedirect?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export function ProfileMenuSheet({
  open,
  onClose,
  profilePath,
  extraItems = [],
  logoutRedirect = "/login",
}: ProfileMenuSheetProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      await queryClient.invalidateQueries();
      showToast("Data diperbarui");
      onClose();
    } finally {
      setTimeout(() => setSyncing(false), 500);
    }
  }

  function handleProfile() {
    onClose();
    navigate(profilePath);
  }

  function handleThemeToggle() {
    toggleTheme();
  }

  async function handleLogout() {
    onClose();
    await logout();
    navigate(logoutRedirect);
  }

  const roleLabel = (user?.role || "").replace(/_/g, " ");

  return (
    <BottomSheet open={open} onClose={onClose} title="Menu">
      {/* Profile Header */}
      <div className="mb-4 flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-card2 border border-surface-border">
        <Avatar
          name={user?.nama || "?"}
          size={56}
          gender={normalizeGender(user?.jenis_kelamin)}
        />
        <div className="flex-1 min-w-0">
          <p className="text-ios-body font-semibold text-surface-text truncate">
            {user?.nama || "Pengguna"}
          </p>
          <p className="text-ios-footnote text-surface-muted truncate">
            @{user?.username || "-"}
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold tracking-wide text-accent bg-accent-soft rounded-full px-2 py-0.5 uppercase">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-1.5">
        <MenuButton
          icon={<User size={18} strokeWidth={2.2} />}
          iconBg="bg-info-soft text-info"
          label="Profil Saya"
          description="Lihat dan edit biodata"
          onClick={handleProfile}
        />

        <MenuButton
          icon={
            theme === "dark" ? (
              <Sun size={18} strokeWidth={2.2} />
            ) : (
              <Moon size={18} strokeWidth={2.2} />
            )
          }
          iconBg="bg-warning-soft text-warning"
          label={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          description="Ubah tampilan aplikasi"
          onClick={handleThemeToggle}
          trailing={
            <div
              className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                theme === "dark" ? "bg-accent" : "bg-surface-card2"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          }
        />

        <MenuButton
          icon={
            <RefreshCw
              size={18}
              strokeWidth={2.2}
              className={syncing ? "animate-spin" : ""}
            />
          }
          iconBg="bg-accent-soft text-accent"
          label="Sinkronisasi Data"
          description="Muat ulang data terbaru"
          onClick={handleSync}
          disabled={syncing}
        />

        {/* Mode jamaah — hanya kalau user punya member_id */}
        {user?.member_id && user.role !== "MEMBER" && (
          <MenuButton
            icon={<Home size={18} strokeWidth={2.2} />}
            iconBg="bg-accent-soft text-accent"
            label="Tampilan sebagai Jamaah"
            description="Masuk mode personal"
            onClick={() => {
              onClose();
              navigate("/member");
            }}
          />
        )}

        {extraItems.map((item) => (
          <MenuButton
            key={item.key}
            icon={item.icon}
            iconBg={item.iconBg}
            label={item.label}
            description={item.description}
            onClick={() => {
              onClose();
              item.onClick();
            }}
            trailing={item.trailing}
            danger={item.danger}
          />
        ))}
      </div>

      {/* Logout */}
      <div className="mt-4 pt-4 border-t border-surface-border">
        <MenuButton
          icon={<LogOut size={18} strokeWidth={2.2} />}
          iconBg="bg-danger-soft text-danger"
          label="Keluar"
          description="Keluar dari akun ini"
          onClick={handleLogout}
          danger
        />
      </div>
    </BottomSheet>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MenuButton                                    */
/* -------------------------------------------------------------------------- */

function MenuButton({
  icon,
  iconBg,
  label,
  description,
  onClick,
  trailing,
  disabled,
  danger,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  description?: string;
  onClick: () => void;
  trailing?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left rounded-2xl border p-3 flex items-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 ${
        danger
          ? "border-danger/20 bg-danger-soft hover:bg-danger-soft/80"
          : "border-surface-border bg-surface-card hover:bg-surface-card2"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-ios-body font-medium ${
            danger ? "text-danger" : "text-surface-text"
          }`}
        >
          {label}
        </p>
        {description && (
          <p
            className={`text-ios-footnote ${
              danger ? "text-danger/70" : "text-surface-muted"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {trailing || (
        <ChevronRight
          size={16}
          className={`flex-shrink-0 ${
            danger ? "text-danger/60" : "text-surface-muted"
          }`}
        />
      )}
    </button>
  );
}
