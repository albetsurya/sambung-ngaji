import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../common";

export function MemberRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Memeriksa sesi..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "MEMBER") {
    return <Navigate to="/" replace />;
  }

  if (!user.member_id) {
    return (
      <div className="app-shell min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-ios-nav font-semibold text-surface-text mb-2">
          Akun Belum Terhubung
        </p>
        <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed">
          Akun Anda belum terhubung ke data jamaah. Silakan hubungi admin.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
