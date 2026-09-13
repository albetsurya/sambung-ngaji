import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";

const NAV_BY_ROLE: Record<Role, string[]> = {
  SUPER_ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  TIM_PNKB: ["beranda", "jamaah", "lainnya"],
  TIM_ABSENSI: ["beranda", "absensi", "lainnya"],
  MEMBER: [],
};

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;

  function canSeeNav(key: string) {
    if (!role) return false;
    return NAV_BY_ROLE[role]?.includes(key) || false;
  }

  const isAdminLike = role === "SUPER_ADMIN" || role === "ADMIN";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isPengawas = role === "PENGAWAS";
  const canViewAllMembers =
    role === "SUPER_ADMIN" || role === "ADMIN" || role === "PENGAWAS";
  const canEditMembers = role === "SUPER_ADMIN" || role === "ADMIN";
  const canWriteMonitoring =
    role === "SUPER_ADMIN" ||
    role === "ADMIN" ||
    role === "TIM_PNKB" ||
    role === "PENGAWAS";

  return {
    role,
    canSeeNav,
    isSuperAdmin,
    isAdminLike,
    isPengawas,
    canViewAllMembers,
    canEditMembers,
    canWriteMonitoring,
  };
}
