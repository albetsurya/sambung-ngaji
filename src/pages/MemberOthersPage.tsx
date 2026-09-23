import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ScrollText,
  Sparkles,
  Calendar,
  Compass,
  Heart,
  CalendarCheck,
  BookOpen,
  RefreshCw,
  KeyRound,
  Lock,
  Palette,
  Download,
  Info,
  HelpCircle,
  Shield,
  LogOut,
  Sun,
  Moon,
  User,
  Home,
  Trophy,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { InstallAppCard } from "../components/member/InstallAppCard";
import {
  Avatar,
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
import { normalizeGender } from "../utils/format";

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

interface MenuItem {
  key: string;
  label: string;
  description?: string;
  Icon: (props: { size?: number; className?: string }) => React.ReactNode;
  to?: string;
  action?: "changePassword" | "changeUsername" | "backup" | "about" | "theme" | "toggleTheme";
  group: "tampilan" | "ibadah" | "data" | "akun" | "tentang";
  render?: "toggle";
}

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export default function MemberOthersPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Halaman ini selalu di /member/* — tetap di konteks jamaah
  const profilePath = "/member/profil";

  const MENU: MenuItem[] = [
    // Grup Tampilan
    {
      key: "mode-tampilan",
      label: "Mode Tampilan",
      description: theme === "dark" ? "Mode gelap aktif" : "Mode terang aktif",
      Icon: theme === "dark" ? Sun : Moon,
      action: "toggleTheme",
      group: "tampilan",
      render: "toggle",
    },
    {
      key: "theme",
      label: "Preset Tema",
      description: "Pilih warna tampilan",
      Icon: Palette,
      action: "theme",
      group: "tampilan",
    },

    // Grup Ibadah
    {
      key: "quran",
      label: "Al-Quran",
      description: "Baca 114 surah & mushaf",
      Icon: ScrollText,
      to: "/member/quran",
      group: "ibadah",
    },
    {
      key: "doa",
      label: "Doa & Dzikir",
      description: "Pagi, sore, harian",
      Icon: Sparkles,
      to: "/member/doa",
      group: "ibadah",
    },
    {
      key: "sholat",
      label: "Waktu Sholat",
      description: "Jadwal sholat hari ini",
      Icon: Calendar,
      to: "/member/prayer",
      group: "ibadah",
    },
    {
      key: "puasa",
      label: "Puasa Sunnah",
      description: "Jadwal 60 hari ke depan",
      Icon: Calendar,
      to: "/member/puasa",
      group: "ibadah",
    },
    {
      key: "kiblat",
      label: "Arah Kiblat",
      description: "Kompas real-time",
      Icon: Compass,
      to: "/member/kiblat",
      group: "ibadah",
    },
    {
      key: "mood",
      label: "Tenangkan Hati",
      description: "Ayat & doa untuk hatimu",
      Icon: Heart,
      to: "/member/mood",
      group: "ibadah",
    },

    // Grup Data Saya
    {
      key: "progres",
      label: "Progres Saya",
      description: "Streak ibadah & badge",
      Icon: Trophy,
      to: "/member/progres",
      group: "data",
    },
    {
      key: "absensi-saya",
      label: "Absensi Saya",
      description: "Rekap kehadiran pengajian",
      Icon: CalendarCheck,
      to: "/member/absensi",
      group: "data",
    },
    {
      key: "profil",
      label: "Biodata Saya",
      description: "Lihat & edit data pribadi",
      Icon: User,
      to: profilePath,
      group: "data",
    },
    {
      key: "sholat-jurnal",
      label: "Jurnal Sholat",
      description: "Tracker 5 waktu + streak",
      Icon: CalendarCheck,
      to: "/member/sholat-jurnal",
      group: "data",
    },
    {
      key: "tahfidz",
      label: "Tahfidz",
      description: "Progress hafalan Al-Quran",
      Icon: BookOpen,
      to: "/member/tahfidz",
      group: "data",
    },
    {
      key: "jadwal",
      label: "Jadwal Pengajian",
      description: "Kalender & daftar bulanan",
      Icon: Calendar,
      to: "/member/jadwal",
      group: "data",
    },
    {
      key: "dzikir",
      label: "Dzikir Counter",
      description: "Tasbih digital",
      Icon: RefreshCw,
      to: "/member/dzikir",
      group: "data",
    },

    // Grup Akun & Lainnya
    {
      key: "change-password",
      label: "Ganti Password",
      description: "Ubah password akun",
      Icon: KeyRound,
      action: "changePassword",
      group: "akun",
    },
    {
      key: "change-username",
      label: "Ganti Username",
      description: "Ubah username login",
      Icon: Lock,
      action: "changeUsername",
      group: "akun",
    },
    {
      key: "backup",
      label: "Backup Data",
      description: "Export / import data",
      Icon: Download,
      action: "backup",
      group: "akun",
    },
    {
      key: "about",
      label: "Tentang Aplikasi",
      description: "Info versi & fitur",
      Icon: Info,
      action: "about",
      group: "tentang",
    },
    {
      key: "panduan",
      label: "Panduan Penggunaan",
      description: "Cara pakai aplikasi",
      Icon: HelpCircle,
      to: "/member/panduan",
      group: "tentang",
    },
    {
      key: "privasi",
      label: "Kebijakan Privasi",
      description: "Bagaimana data Anda dikelola",
      Icon: Shield,
      to: "/member/privasi",
      group: "tentang",
    },
  ];

  // Menu kembali ke admin — hanya untuk non-MEMBER yang punya member_id
  if (user?.role && user.role !== "MEMBER") {
    MENU.push({
      key: "back-admin",
      label: "Kembali ke Admin",
      description: "Keluar dari mode jamaah",
      Icon: Home,
      to: "/",
      group: "akun",
    });
  }

  function handleMenuClick(item: MenuItem) {
    if (item.to) {
      navigate(item.to);
      return;
    }
    switch (item.action) {
      case "changePassword":
        setChangePasswordOpen(true);
        break;
      case "changeUsername":
        setChangeUsernameOpen(true);
        break;
      case "backup":
        setBackupOpen(true);
        break;
      case "theme":
        setThemeSheetOpen(true);
        break;
      case "about":
        setAboutOpen(true);
        break;
      case "toggleTheme":
        toggleTheme();
        break;
    }
  }

  function renderGroup(title: string, group: MenuItem["group"]) {
    const items = MENU.filter((m) => m.group === group);
    if (items.length === 0) return null;
    return (
      <section>
        <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
          {title}
        </p>
        <GroupedList>
          {items.map((m, i) => {
            const Icon = m.Icon;
            return (
              <ListRow
                key={m.key}
                onClick={() => handleMenuClick(m)}
                insetDivider={i !== items.length - 1}
                leading={
                  <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                    <Icon size={16} />
                  </span>
                }
              >
                {m.render === "toggle" ? (
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
        {/* Profile header */}
        <GroupedList>
          <ListRow
            insetDivider={false}
            className="py-3.5"
            onClick={() => navigate(profilePath)}
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
            </div>
          </ListRow>
        </GroupedList>

        {renderGroup("Tampilan", "tampilan")}
        {renderGroup("Ibadah", "ibadah")}
        {renderGroup("Data Saya", "data")}
        {renderGroup("Akun", "akun")}
        {renderGroup("Tentang", "tentang")}

        {/* Logout */}
        <div className="mt-4">
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
        </div>

        <div className="px-4 pb-2">
          <InstallAppCard />
        </div>

        <div className="text-center pt-5 pb-3">
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
      <BackupDataSheet open={backupOpen} onClose={() => setBackupOpen(false)} />
      <ThemePickerSheet
        open={themeSheetOpen}
        onClose={() => setThemeSheetOpen(false)}
      />
      <AboutAppModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

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
    PENGAWAS: "Pengawas",
    MEMBER: "Member",
  };
  return role ? map[role] || role : "";
}
