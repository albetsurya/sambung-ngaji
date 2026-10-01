import { restGet, restPost, restPut, restDelete } from "../../../services/apiClient";
import type { Member, MemberUserStatus } from "../../../types";

export interface MemberFilters {
  search?: string;
  kategori?: string;
  jenis_kelamin?: string;
  kelompok?: string;
  group_id?: string;
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
  list: (filters: MemberFilters = {}) =>
    restGet<Member[]>("/api/v1/members", filters),

  listPNKB: (filters: MemberFilters = {}) =>
    restGet<Member[]>("/api/v1/members/pnkb", filters),

  listPaged: (filters: MemberFilters = {}) =>
    restGet<PagedResponse<Member>>("/api/v1/members/paged", filters),

  listPNKBPaged: (filters: MemberFilters = {}) =>
    restGet<PagedResponse<Member>>("/api/v1/members/pnkb-paged", filters),

  listForAttendance: (filters: MemberFilters = {}) =>
    restGet<Member[]>("/api/v1/members/attendance", filters),

  detail: (member_id: string) =>
    restGet<Member>("/api/v1/members/detail", { member_id }),

  create: (payload: Partial<Member>) =>
    restPost<Member>("/api/v1/members", payload),

  update: (member_id: string, payload: Partial<Member>) =>
    restPut<Member>("/api/v1/members", { member_id, ...payload }),

  deactivate: (member_id: string) =>
    restPost<Member>("/api/v1/members/deactivate", { member_id }),

  delete: (member_id: string) =>
    restDelete<{ deleted: boolean }>("/api/v1/members", { member_id }),

  getUserStatus: (member_id: string) =>
    restGet<MemberUserStatus>("/api/v1/users/member-status", { member_id }),

  listForExport: (filters: MemberFilters = {}) =>
    restGet<Member[]>("/api/v1/members/export", filters),
};
