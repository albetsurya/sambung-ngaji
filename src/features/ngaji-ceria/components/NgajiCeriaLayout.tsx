import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft } from "../../../components/ui/FontAwesomeIcons";
import { NgajiCeriaBottomNav } from "./NgajiCeriaBottomNav";
import { BubblyCloud } from "./NgajiCeriaIllustrations";
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
    <div className="min-h-screen bg-surface-bg text-surface-text flex flex-col justify-between selection:bg-accent/20 relative overflow-x-hidden font-sans">
      {/* Background Decorative Cloud Elements */}
      <BubblyCloud className="absolute top-10 -left-6 w-28 h-14 text-accent/10 pointer-events-none animate-pulse" />
      <BubblyCloud className="absolute top-36 -right-8 w-36 h-18 text-accent/10 pointer-events-none" />

      {/* Floating Top Game HUD */}
      <header className="sticky top-0 z-30 pt-safe bg-surface-bg/90 backdrop-blur-lg border-b border-surface-border shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack || (() => navigate("/member"))}
                aria-label="Keluar ke Menu Utama"
                className="px-3 py-1.5 rounded-full bg-surface-card border border-surface-border text-xs font-bold text-surface-text flex items-center gap-1.5 hover:bg-surface-card2 transition-all active:scale-95 shadow-sm"
              >
                <X size={14} className="text-surface-muted" />
                <span>Keluar</span>
              </button>
            )}
            <span className="font-display font-black text-base text-accent tracking-tight ml-1">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Lives / Nyawa HUD */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-soft text-danger border border-danger/20 font-black text-xs shadow-sm">
              <img src={NGAJI_CERIA_ASSETS.hatiNyawa} alt="Nyawa" className="w-4 h-4 object-contain" />
              <span>5</span>
            </div>

            {/* Streak HUD */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-soft text-warning border border-warning/20 font-black text-xs shadow-sm">
              <img src={NGAJI_CERIA_ASSETS.apiStreak} alt="Streak" className="w-4 h-4 object-contain" />
              <span>{currentStreak} Hari</span>
            </div>

            {/* Koin / XP HUD */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20 font-black text-xs shadow-sm">
              <img src={NGAJI_CERIA_ASSETS.koinHijaiyah} alt="Koin" className="w-4 h-4 object-contain" />
              <span>120</span>
            </div>

            {rightAction}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className={`flex-1 max-w-md w-full mx-auto relative ${hideNav ? "pb-6" : "pb-24"}`}>
        {children}
      </main>

      {/* Floating Bottom Navigation Game Dock */}
      {!hideNav && <NgajiCeriaBottomNav />}
    </div>
  );
}
