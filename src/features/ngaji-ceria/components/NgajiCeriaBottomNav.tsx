import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { tapFeedback } from "../../../lib/haptics";
import { NGAJI_CERIA_ASSETS } from "../data/assets";

export const NGAJI_CERIA_NAV_ITEMS = [
  {
    key: "beranda",
    label: "Peta Jelajah",
    to: "/member/ngaji-ceria",
    icon: NGAJI_CERIA_ASSETS.jilidCovers[1],
  },
  {
    key: "quiz",
    label: "Kuis Kartu",
    to: "/member/ngaji-ceria/quiz",
    icon: NGAJI_CERIA_ASSETS.tebakSurahBaru,
  },
  {
    key: "games",
    label: "Mini Games",
    to: "/member/ngaji-ceria/games",
    icon: NGAJI_CERIA_ASSETS.qirraPop,
  },
  {
    key: "path",
    label: "Koleksi Jilid",
    to: "/member/ngaji-ceria/path",
    icon: NGAJI_CERIA_ASSETS.piala,
  },
];

export function NgajiCeriaBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pt-2 bg-gradient-to-t from-surface-bg via-surface-bg/90 to-transparent pointer-events-none">
      <nav className="pointer-events-auto max-w-md mx-auto flex items-center justify-around p-2 rounded-3xl bg-surface-card/95 backdrop-blur-xl border-2 border-accent/30 shadow-xl shadow-accent/10">
        {NGAJI_CERIA_NAV_ITEMS.map((item) => {
          const isActive =
            item.to === "/member/ngaji-ceria"
              ? location.pathname === "/member/ngaji-ceria"
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.to === "/member/ngaji-ceria"}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl transition-all duration-200 active:scale-95"
              onClick={() => tapFeedback()}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 p-1.5 ${
                  isActive
                    ? "bg-accent text-white shadow-md shadow-accent/30 scale-110 border border-white/40"
                    : "bg-surface-card2 text-surface-muted hover:bg-surface-border"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight transition-colors duration-200 ${
                  isActive ? "text-accent font-black" : "text-surface-muted"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
