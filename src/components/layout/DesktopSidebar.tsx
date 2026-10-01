import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";
import { useEnvironment } from "../../hooks/useEnvironment";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Home,
  Users,
  CalendarCheck,
  Megaphone,
  MoreHorizontal,
  BookOpen,
  RefreshCw,
  Calendar,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Building2,
  User as UserIcon,
  FileText,
  Landmark,
  Heart,
  ScrollText,
} from "../ui/FontAwesomeIcons";
import { RoleBadge } from "../ui";

const ADMIN_ITEMS = [
  { key: "beranda", label: "Beranda", to: "/", icon: Home },
  { key: "jamaah", label: "Jamaah", to: "/jamaah", icon: Users },
  { key: "absensi", label: "Absensi", to: "/absensi", icon: CalendarCheck },
  {
    key: "pengumuman",
    label: "Pengumuman",
    to: "/pengumuman",
    icon: Megaphone,
  },
  { key: "kas", label: "Kas", to: "/finance/ledger", icon: Landmark },
  { key: "shodaqoh", label: "Shodaqoh", to: "/finance/monthly-dues", icon: Heart },
  { key: "zakat", label: "Zakat", to: "/finance/zakat", icon: ScrollText },
  { key: "lainnya", label: "Lainnya", to: "/lainnya", icon: MoreHorizontal },
];

const KELOLA_ITEMS = [
  { label: "Kelola Kelompok", to: "/kelompok-saya", icon: Building2 },
];

const MEMBER_ITEMS = [
  { key: "beranda", label: "Beranda", to: "/member", icon: Home },
  { key: "quran", label: "Al-Quran", to: "/member/quran", icon: BookOpen },
  { key: "sholat", label: "Jadwal Sholat", to: "/member/prayer", icon: Calendar },
  { key: "dzikir", label: "Dzikir & Doa", to: "/member/dzikir", icon: RefreshCw },
  { key: "progres", label: "Progres Saya", to: "/member/progres", icon: Sparkles },
  { key: "lainnya", label: "Lainnya", to: "/member/lainnya", icon: MoreHorizontal },
];

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDevelopment } = useEnvironment();
  const { canSeeNav, isGlobal, isSuperAdmin, role, groupId } = usePermission();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isMemberContext = location.pathname.startsWith("/member");
  const items = isMemberContext ? MEMBER_ITEMS : ADMIN_ITEMS;
  const visible = isMemberContext
    ? items
    : items.filter((i) => canSeeNav(i.key));

  /* Admin ber-kelompok: hub Kelompok Saya tepat di bawah Beranda. */
  const isHubUser =
    !isMemberContext &&
    (role === "ADMIN" || role === "PENGAWAS") &&
    !!groupId;
  const navItems =
    isHubUser && visible.length > 0
      ? [
          visible[0],
          {
            key: "kelompok-saya",
            label: "Kelompok Saya",
            to: "/kelompok-saya",
            icon: Building2,
          },
          ...visible.slice(1),
        ]
      : visible;

  const isAdmin = role && role !== "MEMBER";

  return (
    <aside className="hidden md:flex flex-col fixed top-0 bottom-0 left-0 w-64 border-r border-surface-border bg-surface-card z-30 select-none">
      
      <div className="flex items-center justify-between h-16 px-5 border-b border-surface-border">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(isMemberContext ? "/member" : "/")}>
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-accent/30">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-ios-body text-surface-text tracking-tight leading-tight">
              Sambung Ngaji
            </span>
            <span className="text-[11px] text-surface-muted font-medium">
              {isMemberContext ? "Mode Jamaah" : "Portal Pengurus"}
            </span>
          </div>
        </div>

        {isDevelopment && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-warning-soft text-warning border border-warning/20">
            DEV
          </span>
        )}
      </div>

      
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-surface-muted/70">
            Navigasi Utama
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.to === "/" || item.to === "/member"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-ios-subhead transition-all duration-150 group ${
                      isActive
                        ? "bg-accent/10 text-accent font-semibold shadow-xs"
                        : "text-surface-muted hover:text-surface-text hover:bg-surface-card2"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        strokeWidth={isActive ? 2.3 : 1.8}
                        className={`transition-colors ${
                          isActive ? "text-accent" : "text-surface-muted group-hover:text-surface-text"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isSuperAdmin && !isMemberContext && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-surface-muted/70">
              Kelola
            </div>
            <nav className="space-y-1">
              {KELOLA_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to + item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-ios-subhead transition-all duration-150 group ${
                        isActive
                          ? "bg-accent/10 text-accent font-semibold shadow-xs"
                          : "text-surface-muted hover:text-surface-text hover:bg-surface-card2"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.3 : 1.8}
                          className={`transition-colors ${
                            isActive ? "text-accent" : "text-surface-muted group-hover:text-surface-text"
                          }`}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-surface-muted/70">
              Konteks Tampilan
            </div>
            <button
              onClick={() => navigate(isMemberContext ? "/" : "/member")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-ios-footnote text-surface-muted hover:text-surface-text hover:bg-surface-card2 transition-colors border border-surface-border/60"
            >
              <RefreshCw size={15} />
              <span className="truncate">
                {isMemberContext ? "Beralih ke Admin" : "Beralih ke Jamaah"}
              </span>
            </button>
          </div>
        )}
      </div>

      
      <div className="p-3 border-t border-surface-border bg-surface-card2/50 space-y-2">
        {user ? (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-card border border-surface-border">
            <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-ios-footnote shrink-0">
              {user.nama ? user.nama.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ios-footnote font-semibold text-surface-text truncate">
                {user.nama || user.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-1.5 rounded-lg text-surface-muted hover:text-surface-text hover:bg-surface-card2 transition-colors"
              title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-ios-caption text-surface-muted">Tampilan Desktop</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-surface-muted hover:text-surface-text hover:bg-surface-card2 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
