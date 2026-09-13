import { call } from "./api";
import type { Member, MemberUserStatus } from "../types";

export interface MemberFilters {
  search?: string;
  kategori?: string;
  jenis_kelamin?: string;
  kelompok?: string;
  desa?: string;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export const memberApi = {
  list: (filters: MemberFilters = {}) => call<Member[]>("getMembers", filters),

  listPNKB: (filters: MemberFilters = {}) =>
    call<Member[]>("getPNKBMembers", filters),

  listPaged: (filters: MemberFilters = {}) =>
    call<PagedResponse<Member>>("getMembersPaged", filters),

  listPNKBPaged: (filters: MemberFilters = {}) =>
    call<PagedResponse<Member>>("getPNKBMembersPaged", filters),

  listForAttendance: (filters: MemberFilters = {}) =>
    call<Member[]>("getAttendanceMembers", filters),

  detail: (member_id: string) => call<Member>("getMemberDetail", { member_id }),

  create: (payload: Partial<Member>) => call<Member>("createMember", payload),

  update: (member_id: string, payload: Partial<Member>) =>
    call<Member>("updateMember", { member_id, ...payload }),

  deactivate: (member_id: string) =>
    call<Member>("deactivateMember", { member_id }),

  getUserStatus: (member_id: string) =>
    call<MemberUserStatus>("getMemberUserStatus", { member_id }),
};
