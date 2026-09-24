import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../common";
import type { Role } from "../../types";

/**
 * RoleRoute — batasi route ke role tertentu (cermin backend rolePermissions).
 * Backend tetap penegak utama; ini agar user tak berhak tidak mendarat di
 * halaman error, melainkan dikembalikan ke beranda.
 */
export function RoleRoute({
  allowed,
  children,
}: {
  allowed: Role[];
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen label="Memeriksa sesi..." />;
  }

  if (!user || !allowed.includes(user.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
