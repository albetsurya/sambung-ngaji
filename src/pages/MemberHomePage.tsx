import { useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  ScrollText,
  RefreshCw,
  User,
  CalendarCheck,
  Heart,
  Calendar,
  Sparkles,
  Megaphone,
  HelpCircle,
  Shield,
  Home,
  Compass,
  Star,
  BookOpen,
  Settings,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
  FloatingActionGroup,
} from "../components/layout/AppLayout";
import { Avatar } from "../components/common";
import { PrayerTimesCard } from "../components/member/PrayerTimesCard";
import { useAuth } from "../contexts/AuthContext";
import { normalizeGender } from "../utils/format";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface MenuItem {
  key: string;
  label: string;
  description?: string;
  Icon: (props: { size?: number; className?: string }) => ReactNode;
  to?: string;
  disabled?: boolean;
  badge?: string;
}

/* -------------------------------------------------------------------------- */
/*                              Menu Definitions                              */
/* -------------------------------------------------------------------------- */

const IBADAH_MENU: MenuItem[] = [
  {
    key: "doa-pagi",
    label: "Doa Pagi",
    Icon: Sun,
    to: "/member/doa?waktu=pagi",
  },
  {
    key: "doa-sore",
    label: "Doa Sore",
    Icon: Moon,
    to: "/member/doa?waktu=sore",
  },
  {
    key: "quran",
    label: "Al-Quran",
    Icon: ScrollText,
    to: "/member/quran",
  },
  {
    key: "dzikir",
    label: "Dzikir",
    Icon: RefreshCw,
    to: "/member/dzikir",
  },
  {
    key: "kiblat",
    label: "Arah Kiblat",
    Icon: Compass,
    to: "/member/kiblat",
  },
  {
    key: "mood",
    label: "Tenangkan Hati",
    Icon: Heart,
    to: "/member/mood",
  },
  {
    key: "sholat-jurnal",
    label: "Jurnal Sholat",
    Icon: CalendarCheck,
    to: "/member/sholat-jurnal",
  },
  {
    key: "doa-harian",
    label: "Doa Harian",
    Icon: Star,
    disabled: true,
    badge: "Soon",
  },
  {
    key: "tahfidz",
    label: "Tahfidz",
    Icon: BookOpen,
    to: "/member/tahfidz",
  },
];

const DATA_MENU: MenuItem[] = [
  {
    key: "profil",
    label: "Profil",
    Icon: User,
    to: "/member/profil",
  },
  {
    key: "absensi",
    label: "Absensi",
    Icon: CalendarCheck,
    to: "/member/profil?tab=absensi",
  },
  {
    key: "pembinaan",
    label: "Pembinaan",
    Icon: Heart,
    to: "/member/profil?tab=pembinaan",
  },
  {
    key: "pendidikan",
    label: "Pendidikan",
    Icon: Calendar,
    to: "/member/profil?tab=pendidikan",
  },
];

const LAINNYA_MENU: MenuItem[] = [
  {
    key: "pengumuman",
    label: "Pengumuman",
    description: "Belum tersedia",
    Icon: Megaphone,
    disabled: true,
    badge: "Soon",
  },
  {
    key: "panduan",
    label: "Panduan Penggunaan",
    description: "Cara pakai aplikasi",
    Icon: HelpCircle,
    to: "/member/panduan",
  },
  {
    key: "privasi",
    label: "Kebijakan Privasi",
    description: "Bagaimana data Anda dikelola",
    Icon: Shield,
    to: "/member/privasi",
  },
  {
    key: "settings",
    label: "Pengaturan",
    description: "Akun, tampilan, & lainnya",
    Icon: Settings,
    to: "/member/settings",
  },
];

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function MemberHomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = getGreeting();
  const displayName = user?.nama || "Jamaah";
  const isNonMember = !!user?.role && user.role !== "MEMBER";

  // Untuk non-member: tambah entry "Kembali ke Admin" di section Lainnya
  const lainnyaMenu: MenuItem[] = isNonMember
    ? [
        ...LAINNYA_MENU,
        {
          key: "back-admin",
          label: "Kembali ke Admin",
          description: "Keluar dari tampilan jamaah",
          Icon: Home,
          to: "/",
        },
      ]
    : LAINNYA_MENU;

  function handlePress(item: MenuItem) {
    if (item.disabled || !item.to) return;
    navigate(item.to);
  }

  return (
    <AppLayout
      hideNav
      fab={
        <FloatingActionGroup>
          <FloatingActionButton
            onClick={() => navigate("/member/ai")}
            label="Tanya AI"
            variant="secondary"
            icon={<Sparkles size={18} strokeWidth={2.2} />}
          />
        </FloatingActionGroup>
      }
    >
      <Header
        title="Assalamu'alaikum"
        subtitle={
          isNonMember
            ? `${greeting}, ${displayName} · Mode Jamaah`
            : `${greeting}, ${displayName}`
        }
        showSyncButton={false}
        right={
          <button
            onClick={() => navigate("/member/profil")}
            aria-label="Buka profil"
            className="rounded-full overflow-hidden transition-all hover:opacity-80 active:scale-95"
          >
            <Avatar
              name={user?.nama || "?"}
              size={32}
              gender={normalizeGender(user?.jenis_kelamin)}
            />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-5 pb-8">
        {/* Waktu sholat */}
        <PrayerTimesCard />

        {/* Ibadah harian */}
        <MenuGrid title="Ibadah Harian" items={IBADAH_MENU} onPress={handlePress} />

        {/* Data saya */}
        <MenuGrid title="Data Saya" items={DATA_MENU} onPress={handlePress} />

        {/* Lainnya */}
        <MenuList title="Lainnya" items={lainnyaMenu} onPress={handlePress} />
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Menu Grid                                   */
/* -------------------------------------------------------------------------- */

function MenuGrid({
  title,
  items,
  onPress,
}: {
  title: string;
  items: MenuItem[];
  onPress: (item: MenuItem) => void;
}) {
  return (
    <section>
      <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
        {title}
      </p>
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <button
              key={item.key}
              onClick={() => onPress(item)}
              disabled={item.disabled}
              className={`relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 min-h-[88px] transition-all active:scale-[0.97] ${
                item.disabled
                  ? "border-surface-border bg-surface-card/50 opacity-60 cursor-not-allowed"
                  : "border-surface-border bg-surface-card hover:bg-surface-card2 hover:border-accent/30"
              }`}
            >
              {item.badge && (
                <span className="absolute top-1.5 right-1.5 px-1.5 py-[1px] rounded-full bg-warning-soft text-warning text-[8px] font-bold uppercase tracking-wide leading-tight">
                  {item.badge}
                </span>
              )}

              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.disabled
                    ? "bg-surface-card2 text-surface-muted"
                    : "bg-accent-soft text-accent"
                }`}
              >
                <Icon size={18} />
              </span>
              <span
                className={`text-[11px] font-medium text-center leading-tight ${
                  item.disabled ? "text-surface-muted" : "text-surface-text"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Menu List                                   */
/* -------------------------------------------------------------------------- */

function MenuList({
  title,
  items,
  onPress,
}: {
  title: string;
  items: MenuItem[];
  onPress: (item: MenuItem) => void;
}) {
  return (
    <section>
      <p className="px-1 mb-2.5 text-ios-footnote font-semibold text-surface-text">
        {title}
      </p>
      <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
        {items.map((item, i) => {
          const Icon = item.Icon;
          return (
            <button
              key={item.key}
              onClick={() => onPress(item)}
              disabled={item.disabled}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-all ${
                item.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-surface-card2 active:scale-[0.995]"
              } ${i !== items.length - 1 ? "border-b border-surface-border" : ""}`}
            >
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.disabled
                    ? "bg-surface-card2 text-surface-muted"
                    : "bg-accent-soft text-accent"
                }`}
              >
                <Icon size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-ios-body font-medium truncate ${
                    item.disabled ? "text-surface-muted" : "text-surface-text"
                  }`}
                >
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-ios-caption text-surface-muted truncate">
                    {item.description}
                  </p>
                )}
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning text-[9px] font-bold uppercase tracking-wide shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Helper                                     */
/* -------------------------------------------------------------------------- */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}
