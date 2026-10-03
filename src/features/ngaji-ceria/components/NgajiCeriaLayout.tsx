import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Fire, Star } from "../../../components/ui/FontAwesomeIcons";
import { NgajiCeriaBottomNav } from "./NgajiCeriaBottomNav";
import { MascotStar, BubblyCloud } from "./NgajiCeriaIllustrations";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";

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
    <div className="min-h-screen bg-surface-bg text-surface-text flex flex-col justify-between selection:bg-accent/20 relative overflow-x-hidden">
      {/* Playful Floating Cloud Backgrounds */}
      <BubblyCloud className="absolute top-8 -left-8 w-28 h-14 text-accent/10 pointer-events-none animate-pulse" />
      <BubblyCloud className="absolute top-28 -right-10 w-36 h-18 text-accent/10 pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 pt-safe bg-surface-bg/85 backdrop-blur-md border-b border-surface-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack || (() => navigate("/member"))}
                aria-label="Kembali"
                className="w-9 h-9 rounded-full bg-surface-card border border-surface-border flex items-center justify-center text-surface-text transition-all active:scale-90 hover:bg-surface-card2"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-lg text-accent tracking-tight">
                {title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-soft text-warning border border-warning/30 font-bold text-xs shadow-sm">
              <Fire size={14} className="animate-bounce" />
              <span>{currentStreak}</span>
            </div>

            {/* Star Points Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/30 font-bold text-xs shadow-sm">
              <Star size={14} />
              <span>120</span>
            </div>

            {rightAction}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 max-w-md w-full mx-auto relative ${hideNav ? "pb-8" : "pb-24"}`}>
        {children}
      </main>

      {/* Dedicated Bottom Navigation */}
      {!hideNav && <NgajiCeriaBottomNav />}
    </div>
  );
}
