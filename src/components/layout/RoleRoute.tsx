import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../common";
import type { Role } from "../../types";

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
