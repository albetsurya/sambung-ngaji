import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Calendar,
  CalendarCheck,
  BookOpen,
  RefreshCw,
  KeyRound,
  Lock,
  Palette,
  Download,
  Info,
  LogOut,
  Home,
  Trophy,
  Search,
  Mosque,
  ChevronRight,
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
import { AppMaintenanceSection } from "../components/common/AppMaintenanceSection";
import { useAuth } from "../contexts/AuthContext";
import { normalizeGender } from "../utils/format";


interface MenuItem {
  key: string;
  label: string;
  description?: string;
  Icon: (props: { size?: number; className?: string }) => React.ReactNode;
  to?: string;
  action?: "changePassword" | "changeUsername" | "backup" | "about" | "theme";
  group: "tampilan" | "data" | "akun" | "tentang";
}


export default function MemberOthersPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeUsernameOpen, setChangeUsernameOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [search, setSearch] = useState("");

  const profilePath = "/member/profil";

  const MENU: MenuItem[] = [
    {
      key: "theme",
      label: "Tampilan & Tema",
      description: "Mode gelap-terang & warna",
      Icon: Palette,
      action: "theme",
      group: "tampilan",
    },

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
      key: "petugas-jumat",
      label: "Petugas Jumat",
      description: "Info petugas sholat Jumat",
      Icon: Mosque,
      to: "/member/petugas-jumat",
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
    {
      key: "puasa",
      label: "Puasa Sunnah",
      description: "Jadwal 60 hari ke depan",
      Icon: Calendar,
      to: "/member/puasa",
      group: "data",
    },

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
      description: "Info, panduan & privasi",
      Icon: Info,
      action: "about",
      group: "tentang",
    },
  ];

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

  const q = search.toLowerCase().trim();
  const visibleMenu = q
    ? MENU.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          (m.description || "").toLowerCase().includes(q),
      )
    : MENU;

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
    }
  }

  function renderGroup(title: string, group: MenuItem["group"]) {
    const items = visibleMenu.filter((m) => m.group === group);
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
              <ChevronRight size={16} className="text-surface-muted shrink-0" />
            </div>
          </ListRow>
        </GroupedList>

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

        {renderGroup("Tampilan", "tampilan")}
        {renderGroup("Data Saya", "data")}
        {renderGroup("Akun", "akun")}
        {renderGroup("Tentang", "tentang")}

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

        
        <div className="mt-4">
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
        </div>

        <div className="px-4 pb-2">
          <InstallAppCard />
        </div>

        <div className="text-center pt-5 pb-3">
          <p className="text-ios-caption text-surface-muted">
            Sambung Ngaji · v1.0.0
          </p>
        </div>
      </div>

      
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
