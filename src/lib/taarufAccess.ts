import type { Member, Role } from "../types";

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

export function isTaarufEligible(member: Member | null | undefined): boolean {
  return !!member && member.kategori === "PRA_NIKAH";
}
