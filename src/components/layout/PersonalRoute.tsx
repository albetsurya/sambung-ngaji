import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../common";
import { User } from "../common/FontAwesomeIcons";

export function PersonalRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Memeriksa sesi..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!user.member_id) {
    return (
      <div className="app-shell min-h-screen flex flex-col items-center justify-center px-6 text-center bg-surface-bg">
        <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mb-4 text-accent">
          <User size={28} />
        </div>
        <p className="text-ios-nav font-semibold text-surface-text mb-2">
          Akun Belum Terhubung
        </p>
        <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed mb-5">
          Akun Anda belum terhubung ke data jamaah. Hubungi admin untuk
          menghubungkan akun ini ke data jamaah.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-soft text-accent text-ios-subhead font-medium transition-all hover:bg-accent-soft/80 active:scale-[0.97]"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
