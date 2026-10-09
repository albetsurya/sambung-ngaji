import React, { ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "../../../components/ui/FontAwesomeIcons";
import { NgajiCeriaBottomNav } from "./NgajiCeriaBottomNav";
import { RewardChestModal } from "./RewardChestModal";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { getRank, useNgajiProgress } from "../pages/games/_shared/progression";
import { ProgressionNotice } from "./ProgressionNotice";
import { soundManager } from "../services/soundManager";

interface NgajiCeriaLayoutProps {
  children: ReactNode;
  title?: string;
  hideNav?: boolean;
  hideHeader?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export function NgajiCeriaLayout({
  children,
  title = "Ngaji Ceria",
  hideNav = false,
  hideHeader = false,
  showBack = true,
  onBack,
  rightAction,
}: NgajiCeriaLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStreak } = useNgajiCeriaStreak();
  const progress = useNgajiProgress();
  const rank = getRank(progress.xp);
  useEffect(() => {
    if (hideNav) return;
    soundManager.playBgm("menu", 0.18);
    return () => soundManager.stopBgm();
  }, [hideNav]);

  // Aturan back: hanya di halaman tanpa bottom nav (mis. dalam game),
  // dan tidak pernah di beranda modul. Halaman bernav tidak perlu back.
  const isModuleHome =
    location.pathname === "/member/ngaji-ceria" ||
    location.pathname === "/member/ngaji-ceria/";
  const showBackButton = showBack && hideNav && !isModuleHome;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // Kembali ke halaman sebelumnya; kalau tidak ada riwayat, ke beranda modul.
    if (window.history.length > 1) navigate(-1);
    else navigate("/member/ngaji-ceria");
  };

  return (
    <div className={`${hideNav ? "h-dvh min-h-dvh overflow-hidden" : "min-h-screen"} bg-[#FFF8EE] text-[#5A3A2A] flex flex-col justify-between selection:bg-[#F58A3A]/20 relative overflow-x-clip font-sans`}>
      {/* Sticky Top Game HUD Header */}
      {!hideHeader && !hideNav && <header className="sticky top-0 z-40 shrink-0 pt-safe bg-[#FFF8EE]/95 backdrop-blur-md border-b-2 border-[#E2D4C0] shadow-sm transition-all">
        {/* TopBar SVG Banner accent overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-repeat-x bg-top" style={{ backgroundImage: `url(${NGAJI_CERIA_ASSETS.topBarLatar})`, backgroundSize: "auto 100%" }} />

        <div className="relative z-10 max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={handleBack}
                aria-label="Kembali ke halaman sebelumnya"
                title="Kembali"
                className="p-2 rounded-full bg-white border-2 border-[#E2D4C0] text-[#5A3A2A] flex items-center justify-center hover:bg-[#FFF8EE] transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft size={16} className="text-[#8C7A68]" />
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

            {/* Rank / XP HUD */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCE6DA] text-[#F58A3A] border-2 border-[#F9C2A5] font-black text-xs shadow-sm">
              <span title={rank.title}>{progress.xp} XP</span>
            </div>

            {/* Koin HUD */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF6D5] text-[#5A3A2A] border-2 border-[#FCD882] font-black text-xs shadow-sm">
              <img
                src={NGAJI_CERIA_ASSETS.koinHijaiyah}
                alt="Koin"
                className="w-4 h-4 object-contain"
              />
              <span>{progress.coins || 0}</span>
            </div>

            {rightAction}
          </div>
        </div>
      </header>}

      {/* Main Content Viewport */}
      <main className={`flex-1 min-h-0 max-w-md w-full mx-auto relative ${hideNav ? "h-full overflow-hidden pb-0" : "pb-28"}`}>
        {children}
      </main>

      {/* Floating Bottom Navigation Game Dock */}
      {!hideNav && <NgajiCeriaBottomNav />}

      {!hideNav && <RewardChestModal />}
      <ProgressionNotice />
    </div>
  );
}
