import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../types";
export const FOCUS_GROUP_KEY = "superadmin_focus_group";
export function getSuperAdminFocusGroup(): string | null {
  try {
    return localStorage.getItem(FOCUS_GROUP_KEY);
  } catch {
    return null;
  }
}
export function setSuperAdminFocusGroup(groupId: string | null) {
  try {
    if (groupId) {
      localStorage.setItem(FOCUS_GROUP_KEY, groupId);
    } else {
      localStorage.removeItem(FOCUS_GROUP_KEY);
    }
  } catch {
    /* abaikan */
  }
  window.dispatchEvent(new Event("focusgroupchange"));
}
export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TIM_KU: "Tim KU",
  TIM_PNKB: "Tim PNKB",
  TIM_ABSENSI: "Tim Absensi",
  PENGAWAS: "Pengawas",
  MEMBER: "Member",
};
const NAV_BY_ROLE: Record<Role, string[]> = {
  SUPER_ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "keuangan", "lainnya"],
  ADMIN: ["beranda", "jamaah", "absensi", "pengumuman", "keuangan", "lainnya"],
  TIM_KU: ["kas", "shodaqoh", "zakat", "lainnya"],
  TIM_PNKB: ["beranda", "jamaah", "lainnya"],
  TIM_ABSENSI: ["beranda", "jamaah", "absensi", "jadwal", "lainnya"],
  PENGAWAS: ["beranda", "jamaah", "absensi", "pengumuman", "lainnya"],
  MEMBER: [],
};
export function usePermission() {
  const { user } = useAuth();
  const role = user?.role as Role | undefined;
  const groupId = user?.group_id ?? null;
  const [focusGroupId, setFocusGroupId] = useState<string | null>(
    getSuperAdminFocusGroup,
  );
  useEffect(() => {
    const handleGroupChange = () => {
      setFocusGroupId(getSuperAdminFocusGroup());
    };
    window.addEventListener("focusgroupchange", handleGroupChange);
    window.addEventListener("storage", handleGroupChange);
    return () => {
      window.removeEventListener("focusgroupchange", handleGroupChange);
      window.removeEventListener("storage", handleGroupChange);
    };
  }, []);
  function canSeeNav(key: string) {
    if (!role) return false;
    return NAV_BY_ROLE[role]?.includes(key) || false;
  }
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isAdminLike = role === "SUPER_ADMIN" || role === "ADMIN";
  const isTimKu = role === "TIM_KU";
  const isPengawas = role === "PENGAWAS";
  const isMember = role === "MEMBER";
  const assignedGroup = isSuperAdmin ? focusGroupId : groupId;
  const isGlobal = isSuperAdmin && !focusGroupId;
  const canViewAllMembers =
    isGlobal ||
    role === "ADMIN" ||
    role === "PENGAWAS" ||
    role === "TIM_PNKB" ||
    role === "TIM_ABSENSI";
  const canEditMembers =
    isGlobal ||
    role === "ADMIN" ||
    role === "TIM_PNKB" ||
    role === "TIM_ABSENSI";
  const canWriteMonitoring =
    isGlobal || role === "ADMIN" || role === "TIM_PNKB" || role === "PENGAWAS";
  const canManageUsers = isGlobal || isSuperAdmin;
  const canAccessFinance = isSuperAdmin || role === "TIM_KU";
  return {
    role,
    groupId,
    focusGroupId,
    assignedGroup,
    isGlobal,
    canSeeNav,
    isSuperAdmin,
    isAdminLike,
    isTimKu,
    isPengawas,
    isMember,
    canViewAllMembers,
    canEditMembers,
    canWriteMonitoring,
    canManageUsers,
    canAccessFinance,
    setSuperAdminFocusGroup,
  };
}
