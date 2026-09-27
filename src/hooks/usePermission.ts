import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TIM_PNKB: "Tim PNKB",
  TIM_ABSENSI: "Tim Absensi",
  PENGAWAS: "Pengawas",
  MEMBER: "Member",
};

const NAV_BY_ROLE: Record<Role, string[]> = {
  SUPER_ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  TIM_PNKB: ["beranda", "jamaah", "lainnya"],
  TIM_ABSENSI: ["beranda", "absensi", "lainnya"],
  PENGAWAS: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  MEMBER: [],
};

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;
  const groupId = user?.group_id ?? null;

  function canSeeNav(key: string) {
    if (!role) return false;
    return NAV_BY_ROLE[role]?.includes(key) || false;
  }

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdminLike = role === "SUPER_ADMIN" || role === "ADMIN";
  const isPengawas = role === "PENGAWAS";
  const isMember = role === "MEMBER";

  const assignedGroup = isSuperAdmin ? null : groupId;
  const isGlobal = isSuperAdmin;

  const canViewAllMembers = isGlobal || role === "ADMIN" || role === "PENGAWAS";
  const canEditMembers = isGlobal || role === "ADMIN";
  const canWriteMonitoring =
    isGlobal || role === "ADMIN" || role === "TIM_PNKB" || role === "PENGAWAS";
  const canManageUsers = isGlobal;

  return {
    role,
    groupId,
    assignedGroup,
    isGlobal,
    canSeeNav,
    isSuperAdmin,
    isAdminLike,
    isPengawas,
    isMember,
    canViewAllMembers,
    canEditMembers,
    canWriteMonitoring,
    canManageUsers,
  };
}
