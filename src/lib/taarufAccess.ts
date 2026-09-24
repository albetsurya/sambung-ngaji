import type { Member, Role } from "../types";

/**
 * Hak akses CV Taaruf: SUPER_ADMIN, ADMIN, TIM_PNKB, atau pemilik akun
 * (user.member_id sama dengan member yang dibuka).
 */
export function canViewTaarufCv(
  role: Role | undefined,
  viewerMemberId: string | null | undefined,
  targetMemberId: string | null | undefined,
): boolean {
  if (!role || !targetMemberId) return false;
  if (role === "SUPER_ADMIN" || role === "ADMIN" || role === "TIM_PNKB") {
    return true;
  }
  return !!viewerMemberId && viewerMemberId === targetMemberId;
}

/** Fitur CV Taaruf hanya untuk biodata kategori Pra Nikah. */
export function isTaarufEligible(member: Member | null | undefined): boolean {
  return !!member && member.kategori === "PRA_NIKAH";
}
