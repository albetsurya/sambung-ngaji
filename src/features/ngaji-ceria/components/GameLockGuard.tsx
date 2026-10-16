import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { NgajiCeriaLayout } from "./NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { isGameOpen, tierForRole, type AccessTier } from "../data/gameAccess";
import { LoginPromptModal } from "./LoginPromptModal";

export function useGameAccess(routeId: string): { tier: AccessTier; isSuperAdmin: boolean; isLoggedIn: boolean; isOpen: boolean } {
  const { user } = useAuth();
  const tier = tierForRole(user?.role);
  return { tier, isSuperAdmin: tier === "superadmin", isLoggedIn: tier !== "guest", isOpen: isGameOpen(routeId, tier) };
}

export function useJilidAccess(jilidId: number): { tier: AccessTier; isLoggedIn: boolean; isOpen: boolean; isComingSoon: boolean } {
  const { user } = useAuth();
  const tier = tierForRole(user?.role);
  const comingSoon = jilidId >= 6;
  return {
    tier,
    isLoggedIn: tier !== "guest",
    isComingSoon: comingSoon,
    isOpen: !comingSoon && (tier !== "guest" || jilidId <= 2),
  };
}

/**
 * Penjaga akses game: member/superadmin lolos ke semua game,
 * tamu hanya ke game yang terbuka, sisanya melihat layar kunci + ajakan masuk.
 */
export function GameLockGuard({ gameId, title, children }: { gameId: string; title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const { isOpen, isLoggedIn } = useGameAccess(gameId);
  const [promptOpen, setPromptOpen] = useState(false);
  if (isOpen) return <>{children}</>;
  return <NgajiCeriaLayout title={title} showBack onBack={() => navigate("/member/ngaji-ceria/games")}>
    <div data-testid="game-locked" className="flex min-h-[60dvh] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <img src={NGAJI_CERIA_ASSETS.iconGames} alt="" aria-hidden="true" draggable={false} className="h-20 w-20 object-contain opacity-60 grayscale" />
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-amber-300">🔒 Masuk untuk Akses Penuh</span>
      <h2 className="font-display text-xl font-black text-[#5A3A2A]">{title}</h2>
      <p className="max-w-xs text-sm leading-relaxed text-[#5A3A2A]/70">
        {isLoggedIn
          ? "Game ini belum tersedia untuk akunmu."
          : "Masuk untuk membuka game ini. Tamu dapat memainkan Ritme Ngaji, Quiz Ngaji, Puzzle Huruf (Arabic Wordle), dan Hijaiyah Pop."}
      </p>
      {!isLoggedIn && <button type="button" onClick={() => setPromptOpen(true)} className="game-button mt-2 bg-[#2E7D32]">Masuk untuk Akses Penuh</button>}
      <button type="button" onClick={() => navigate("/member/ngaji-ceria/games")} className="game-button mt-2 border-2 border-[#E2D4C0] bg-white text-[#5A3A2A]">Pilih Game Lain</button>
    </div>
    <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
  </NgajiCeriaLayout>;
}
