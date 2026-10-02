import { NavLink, useLocation } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import { useEnvironment } from "../../hooks/useEnvironment";
import { tapFeedback } from "../../lib/haptics";
import {
  Home,
  Users,
  CalendarCheck,
  Megaphone,
  MoreHorizontal,
  BookOpen,
  RefreshCw,
  Calendar,
  Wallet,
  Heart,
  ClipboardList,
} from "../ui/FontAwesomeIcons";
const ADMIN_ITEMS = [
  { key: "beranda", label: "Beranda", to: "/", icon: Home },
  { key: "jamaah", label: "Jamaah", to: "/jamaah", icon: Users },
  { key: "absensi", label: "Absensi", to: "/absensi", icon: CalendarCheck },
  { key: "jadwal", label: "Jadwal", to: "/lainnya/jadwal", icon: Calendar },
  {
    key: "pengumuman",
    label: "Pengumuman",
    to: "/pengumuman",
    icon: Megaphone,
  },
  { key: "keuangan", label: "Keuangan", to: "/finance", icon: Wallet },
  { key: "kas", label: "Kas", to: "/finance/ledger", icon: Wallet },
  { key: "shodaqoh", label: "Shodaqoh", to: "/finance/monthly-dues", icon: Heart },
  { key: "zakat", label: "Zakat", to: "/finance/zakat", icon: ClipboardList },
  { key: "lainnya", label: "Lainnya", to: "/lainnya", icon: MoreHorizontal },
];
const MEMBER_ITEMS = [
  { key: "beranda", label: "Beranda", to: "/member", icon: Home },
  { key: "quran", label: "Al-Quran", to: "/member/quran", icon: BookOpen },
  { key: "sholat", label: "Sholat", to: "/member/prayer", icon: Calendar },
  { key: "dzikir", label: "Dzikir", to: "/member/dzikir", icon: RefreshCw },
  { key: "lainnya", label: "Lainnya", to: "/member/lainnya", icon: MoreHorizontal },
];
export function BottomNav() {
  const location = useLocation();
  const { isDevelopment } = useEnvironment();
  const { canSeeNav } = usePermission();
  const isMemberContext = location.pathname.startsWith("/member");
  const items = isMemberContext ? MEMBER_ITEMS : ADMIN_ITEMS;
  const visible = isMemberContext
    ? items
    : items.filter((i) => canSeeNav(i.key));
  return (
    <div className="relative w-full">
      {isDevelopment && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 px-2.5 py-0.5 rounded-full bg-warning text-white text-[9px] font-bold uppercase tracking-wider shadow-md shadow-warning/30 whitespace-nowrap flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
          DEV Server
        </div>
      )}
      <nav
        className={`w-full flex items-center gap-1 p-1.5 rounded-3xl bg-surface-card/90 backdrop-blur-xl shadow-lg shadow-black/5 ${
          isDevelopment
            ? "border-2 border-warning/40"
            : "border border-surface-border"
        }`}
      >
        {visible.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/" || item.to === "/member"}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 h-[52px] rounded-2xl transition-all duration-200 active:scale-90"
              onClick={() => tapFeedback()}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-accent" : "text-surface-muted"
                    }`}
                  />
                  <span
                    className={`text-ios-tab transition-all duration-200 ${
                      isActive
                        ? "text-accent font-semibold"
                        : "text-surface-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full bg-accent transition-all duration-200 ${
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
