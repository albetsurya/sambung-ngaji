import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../ui/States";
import { PersonalRoute } from "./PersonalRoute";

export function MemberRoute({
  allowGuest,
  children,
}: {
  allowGuest?: boolean;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState label="Memuat..." />;
  }

  if (!user) {
    if (allowGuest) return <>{children}</>;
    return <Navigate to="/login" replace />;
  }

  if (allowGuest) return <>{children}</>;
  return <PersonalRoute>{children}</PersonalRoute>;
}
