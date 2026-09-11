// memberApi.ts
import { call } from "./api";
import type { Member } from "../types";

export interface MemberFilters {
  search?: string;
  kategori?: string;
  kelompok?: string;
  jenis_kelamin?: string;
  desa?: string;
  includeInactive?: boolean;
}

export const memberApi = {
  list: (filters: MemberFilters = {}) => {
    console.log("📋 Calling getMembers with filters:", filters);
    return call<Member[]>("getMembers", filters);
  },

  listPNKB: (filters: MemberFilters = {}) => {
    console.log("📋 Calling getPNKBMembers with filters:", filters);
    return call<Member[]>("getPNKBMembers", filters);
  },

  listForAttendance: (filters: MemberFilters = {}) => {
    console.log("📋 Calling getAttendanceMembers with filters:", filters);
    return call<Member[]>("getAttendanceMembers", filters);
  },

  detail: (member_id: string) => {
    console.log("📋 Calling getMemberDetail for:", member_id);
    return call<Member>("getMemberDetail", { member_id });
  },

  create: (payload: Partial<Member>) => {
    console.log("📋 Calling createMember with payload:", payload);
    return call<Member>("createMember", payload);
  },

  update: (member_id: string, payload: Partial<Member>) => {
    console.log("📋 Calling updateMember for:", member_id);
    return call<Member>("updateMember", { member_id, ...payload });
  },

  deactivate: (member_id: string) => {
    console.log("📋 Calling deactivateMember for:", member_id);
    return call<Member>("deactivateMember", { member_id });
  },
};
