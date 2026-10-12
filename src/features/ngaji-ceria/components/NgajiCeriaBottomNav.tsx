import React from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router-dom";
import { tapFeedback } from "../../../lib/haptics";
import { NGAJI_CERIA_ASSETS } from "../data/assets";

export const NGAJI_CERIA_NAV_ITEMS = [
  {
    key: "beranda",
    label: "Jelajah",
    to: "/member/ngaji-ceria",
    icon: NGAJI_CERIA_ASSETS.iconBeranda,
  },
  {
    key: "quiz",
    label: "Kuis",
    to: "/member/ngaji-ceria/quiz",
    icon: NGAJI_CERIA_ASSETS.iconKuis,
  },
  {
    key: "games",
    label: "Games",
    to: "/member/ngaji-ceria/games",
    icon: NGAJI_CERIA_ASSETS.iconGames,
  },
  {
    key: "path",
    label: "Jilid",
    to: "/member/ngaji-ceria/path",
    icon: NGAJI_CERIA_ASSETS.iconPrestasi,
  },
  {
    key: "profile",
    label: "Profil",
    to: "/member/ngaji-ceria/profile",
    icon: NGAJI_CERIA_ASSETS.iconProfil,
  },
];

export function NgajiCeriaBottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pt-2 bg-gradient-to-t from-[#FFF8EE] via-[#FFF8EE]/90 to-transparent transition-none">
      <nav className="max-w-md mx-auto relative flex items-center justify-around px-2 py-2.5 rounded-[36px] bg-[#FFF8EE] border-4 border-white shadow-2xl shadow-[#5A3A2A]/20">
        <div className="absolute inset-x-3 bottom-0 h-2 bg-[#E2D4C0] rounded-b-[32px] pointer-events-none" />

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
              className="relative z-10 flex-1 flex flex-col items-center justify-center gap-1 h-14 transition-transform active:scale-95"
              onClick={() => tapFeedback()}
            >
              <div
                className={`relative w-11 h-11 rounded-full flex items-center justify-center p-2 ${
                  isActive
                    ? "bg-[#F58A3A] text-white shadow-md border-2 border-white"
                    : "bg-white/80 border-2 border-[#E2D4C0]"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-full h-full object-contain ${
                    isActive ? "filter brightness-0 invert" : ""
                  }`}
                />
              </div>

              <span
                className={`text-[10px] font-black tracking-tight leading-none transition-colors ${
                  isActive ? "text-[#F58A3A]" : "text-[#8C7A68]"
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
