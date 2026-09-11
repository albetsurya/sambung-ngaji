import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  CalendarCheck,
  Megaphone,
  MoreHorizontal,
} from "lucide-react";
import { usePermission } from "../../hooks/usePermission";

const ITEMS = [
  { key: "beranda", to: "/", icon: Home, label: "Beranda" },
  { key: "jamaah", to: "/jamaah", icon: Users, label: "Jamaah" },
  { key: "absensi", to: "/absensi", icon: CalendarCheck, label: "Absensi" },
  {
    key: "pengumuman",
    to: "/pengumuman",
    icon: Megaphone,
    label: "Pengumuman",
  },
  { key: "lainnya", to: "/lainnya", icon: MoreHorizontal, label: "Lainnya" },
];

/**
 * Bottom nav modern: floating pill dengan backdrop blur, item aktif
 * ditandai dengan pill background accent-soft — bukan hanya warna teks.
 * Lebih tegas secara visual dan terasa "hidup".
 */
export function BottomNav() {
  const { canSeeNav } = usePermission();
  const visible = ITEMS.filter((i) => canSeeNav(i.key));

  return (
    <nav className="w-full flex items-center gap-1 p-1.5 rounded-3xl bg-surface-card/90 backdrop-blur-xl border border-surface-border shadow-lg shadow-black/5">
      {visible.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === "/"}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5 h-[52px] rounded-2xl transition-all duration-200"
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
  );
}
