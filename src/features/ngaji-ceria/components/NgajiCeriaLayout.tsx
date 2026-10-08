import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "../../../components/ui/FontAwesomeIcons";
import { NgajiCeriaBottomNav } from "./NgajiCeriaBottomNav";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { NGAJI_CERIA_ASSETS } from "../data/assets";

interface NgajiCeriaLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function NgajiCeriaLayout({
  children,
  title = "Ngaji Ceria",
  hideNav = false,
  showBack = true,
  onBack,
  rightAction,
}: NgajiCeriaLayoutProps) {
  const navigate = useNavigate();
  const { currentStreak } = useNgajiCeriaStreak();

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-[#5A3A2A] flex flex-col justify-between selection:bg-[#F58A3A]/20 relative overflow-x-hidden font-sans">
      {/* Sticky Top Game HUD Header */}
      <header className="sticky top-0 z-40 pt-safe bg-[#FFF8EE]/95 backdrop-blur-md border-b-2 border-[#E2D4C0] shadow-sm transition-all">
        {/* TopBar SVG Banner accent overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-repeat-x bg-top" style={{ backgroundImage: `url(${NGAJI_CERIA_ASSETS.topBarLatar})`, backgroundSize: "auto 100%" }} />

        <div className="relative z-10 max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack || (() => navigate("/member"))}
                aria-label="Keluar ke Menu Utama"
                className="px-2.5 py-1.5 rounded-full bg-white border-2 border-[#E2D4C0] text-xs font-black text-[#5A3A2A] flex items-center gap-1 hover:bg-[#FFF8EE] transition-all active:scale-95 shadow-sm"
              >
                <X size={14} className="text-[#8C7A68]" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
            <span className="font-display font-black text-sm sm:text-base text-[#5A3A2A] tracking-tight truncate max-w-[120px] sm:max-w-none">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Nyawa / Hearts HUD */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCEAEA] text-[#D32F2F] border-2 border-[#F5B6B6] font-black text-xs shadow-sm">
              <img
                src={NGAJI_CERIA_ASSETS.hatiNyawa}
                alt="Nyawa"
                className="w-4 h-4 object-contain"
              />
              <span>5</span>
            </div>

            {/* Streak HUD */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF6D5] text-[#5A3A2A] border-2 border-[#FCD882] font-black text-xs shadow-sm">
              <img
                src={NGAJI_CERIA_ASSETS.apiStreak}
                alt="Streak"
                className="w-4 h-4 object-contain"
              />
              <span>{currentStreak}d</span>
            </div>

            {/* Koin / XP HUD */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCE6DA] text-[#F58A3A] border-2 border-[#F9C2A5] font-black text-xs shadow-sm">
              <img
                src={NGAJI_CERIA_ASSETS.koinHijaiyah}
                alt="Koin"
                className="w-4 h-4 object-contain"
              />
              <span>120</span>
            </div>

            {rightAction}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className={`flex-1 max-w-md w-full mx-auto relative ${hideNav ? "pb-6" : "pb-28"}`}>
        {children}
      </main>

      {/* Floating Bottom Navigation Game Dock */}
      {!hideNav && <NgajiCeriaBottomNav />}
    </div>
  );
}
