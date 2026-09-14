import { call } from "./api";
import type { PendingMember, PendingStatus } from "../types";

export interface ApprovePayload {
  submission_id: string;
  kelompok?: string;
}

export interface ApproveResult {
  member_id: string;
  submission_id: string;
  user_id: string;
  username: string;
}

export interface RejectPayload {
  submission_id: string;
  reason?: string;
}

export const pendingApi = {
  list: (params: { status?: PendingStatus } = {}) =>
    call<PendingMember[]>("getPendingMembers", params),

  detail: (submission_id: string) =>
    call<PendingMember>("getPendingMemberDetail", { submission_id }),

  approve: (payload: ApprovePayload) =>
    call<ApproveResult>("approvePendingMember", payload),

  reject: (payload: RejectPayload) =>
    call<{ submission_id: string; status: PendingStatus }>(
      "rejectPendingMember",
      payload,
    ),
};
