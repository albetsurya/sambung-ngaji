import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  KeyRound,
  Lock,
  Palette,
  Info,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Pencil,
  Download,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Avatar,
  Button,
  ConfirmDialog,
  GroupedList,
  ListRow,
  ChevronRow,
  ChangePasswordSheet,
  ChangeUsernameSheet,
  BackupDataSheet,
} from "../components/common";
import {
  ThemePickerRow,
  ThemePickerSheet,
} from "../components/common/ThemePickerSheet";
import { AboutAppModal } from "../components/member/AboutAppModal";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePermission } from "../hooks/usePermission";

export default function MemberSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isMember } = usePermission();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const backPath = isMember ? "/member" : "/profil-saya";
  const editPath = isMember ? "/member/edit" : "/profil-saya/edit";

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Pengaturan"
        onBack={() => navigate(backPath)}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Card Profil Ringkas */}
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={user?.nama || "?"}
              size={56}
              gender={user?.jenis_kelamin === "P" ? "P" : "L"}
            />
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-semibold text-surface-text truncate">
                {user?.nama || "Pengguna"}
              </p>
              <p className="text-ios-caption text-surface-muted truncate">
                @{user?.username || "-"}
              </p>
            </div>
            <Button
              variant="soft"
              size="xs"
              iconOnly
              onClick={() => navigate(editPath)}
              aria-label="Edit biodata"
              title="Edit biodata"
            >
              <Pencil size={16} strokeWidth={2.2} />
            </Button>
          </div>
        </div>

        {/* Akun */}
        <section>
          <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
            Akun
          </p>
          <GroupedList>
            <ListRow
              onClick={() => setChangePasswordOpen(true)}
              insetDivider={true}
              leading={
                <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                  <KeyRound size={16} />
                </span>
              }
            >
              <ChevronRow>
                <p className="text-ios-body font-medium text-surface-text truncate">
                  Ganti Password
                </p>
              </ChevronRow>
            </ListRow>

            <ListRow
              onClick={() => setChangeUsernameOpen(true)}
              insetDivider={false}
              leading={
                <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                  <Lock size={16} />
                </span>
              }
            >
              <ChevronRow>
                <p className="text-ios-body font-medium text-surface-text truncate">
                  Ganti Username
                </p>
              </ChevronRow>
            </ListRow>
          </GroupedList>
        </section>

        {/* Tampilan */}
        <section>
          <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
            Tampilan
          </p>
          <GroupedList>
            <ListRow
              onClick={toggleTheme}
              insetDivider={true}
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
                  className={
                    "relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 shrink-0 " +
                    (theme === "dark" ? "bg-accent" : "bg-surface-card2")
                  }
                  aria-hidden="true"
                >
                  <span
                    className={
                      "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 " +
                      (theme === "dark" ? "translate-x-5" : "translate-x-0")
                    }
                  />
                </span>
              </div>
            </ListRow>

            <ListRow
              onClick={() => setThemePickerOpen(true)}
              insetDivider={false}
              leading={
                <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                  <Palette size={16} />
                </span>
              }
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <p className="text-ios-body font-medium text-surface-text truncate">
                  Preset Tema
                </p>
                <ChevronRight
                  size={16}
                  className="text-surface-muted shrink-0"
                />
              </div>
            </ListRow>
          </GroupedList>
        </section>

        {/* Data */}
        <section>
          <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
            Data
          </p>
          <GroupedList>
            <ListRow
              onClick={() => setBackupOpen(true)}
              insetDivider={false}
              leading={
                <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                  <Download size={16} />
                </span>
              }
            >
              <ChevronRow>
                <p className="text-ios-body font-medium text-surface-text truncate">
                  Backup Data
                </p>
              </ChevronRow>
            </ListRow>
          </GroupedList>
        </section>

        {/* Info */}
        <section>
          <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
            Info
          </p>
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
        </section>

        {/* Logout */}
        <GroupedList>
          <ListRow
            onClick={() => setConfirmLogoutOpen(true)}
            insetDivider={false}
            className="justify-center"
          >
            <div className="flex items-center gap-2 text-danger">
              <LogOut size={16} />
              <span className="text-ios-body font-medium">Keluar</span>
            </div>
          </ListRow>
        </GroupedList>

        <div className="text-center pt-2 pb-3">
          <p className="text-ios-caption text-surface-muted">
            Manajemen Pengajian · v1.0.0
          </p>
        </div>
      </div>

      {/* Sheets & Modals */}
      <ChangePasswordSheet
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <ChangeUsernameSheet
        open={changeUsernameOpen}
        onClose={() => setChangeUsernameOpen(false)}
      />
      <ThemePickerSheet
        open={themePickerOpen}
        onClose={() => setThemePickerOpen(false)}
      />
      <BackupDataSheet
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
      />
      <AboutAppModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
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
    </AppLayout>
  );
}
