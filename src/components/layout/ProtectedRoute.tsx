import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../ui/States";

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Memeriksa sesi..." />;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "MEMBER") {
    return <Navigate to="/member" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
