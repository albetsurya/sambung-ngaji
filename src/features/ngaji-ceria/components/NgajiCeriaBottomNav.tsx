import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { tapFeedback } from "../../../lib/haptics";
import {
  Home,
  BookOpen,
  Sparkles,
  Trophy,
  Navigation,
} from "../../../components/ui/FontAwesomeIcons";

export const NGAJI_CERIA_NAV_ITEMS = [
  { key: "beranda", label: "Beranda", to: "/member/ngaji-ceria", icon: Home },
  { key: "path", label: "Jelajah", to: "/member/ngaji-ceria/path", icon: Navigation },
  { key: "quiz", label: "Kuis", to: "/member/ngaji-ceria/quiz", icon: Sparkles },
  { key: "games", label: "Games", to: "/member/ngaji-ceria/games", icon: Trophy },
];

export function NgajiCeriaBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe pt-2 bg-gradient-to-t from-surface-bg via-surface-bg/95 to-transparent pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto flex items-center justify-around p-1.5 rounded-3xl bg-surface-card/90 backdrop-blur-xl border-2 border-accent/30 shadow-2xl shadow-accent/10">
        {NGAJI_CERIA_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/member/ngaji-ceria"
              ? location.pathname === "/member/ngaji-ceria"
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/member/ngaji-ceria"}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 h-[54px] rounded-2xl transition-all duration-200 active:scale-95"
              onClick={() => tapFeedback()}
            >
              <div
                className={`w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-white shadow-md shadow-accent/30 scale-105"
                    : "text-surface-muted hover:text-surface-text"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight transition-colors duration-200 ${
                  isActive ? "text-accent font-extrabold" : "text-surface-muted"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
