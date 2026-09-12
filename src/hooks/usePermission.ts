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

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdminLike = role === "SUPER_ADMIN" || role === "ADMIN";
  const isPNKB = role === "TIM_PNKB";
  const isAbsensi = role === "TIM_ABSENSI";
  const isMember = role === "MEMBER";

  return {
    role,
    canSeeNav,
    isSuperAdmin,
    isAdminLike,
    isPNKB,
    isAbsensi,
    isMember,
  };
}
