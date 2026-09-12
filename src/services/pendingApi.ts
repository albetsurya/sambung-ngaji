import { call } from "./api";
import type { PendingMember, PendingStatus } from "../types";

export const pendingApi = {
  list: (params: { status?: PendingStatus } = {}) =>
    call<PendingMember[]>("getPendingMembers", params),

  detail: (submission_id: string) =>
    call<PendingMember>("getPendingMemberDetail", { submission_id }),

  approve: (payload: {
    submission_id: string;
    kelompok?: string;
    create_user?: boolean;
    username?: string;
    password?: string;
  }) =>
    call<{
      member_id: string;
      submission_id: string;
      created_user: { user_id: string; username: string } | null;
    }>("approvePendingMember", payload),

  reject: (payload: { submission_id: string; reason?: string }) =>
    call<{ submission_id: string; status: PendingStatus }>(
      "rejectPendingMember",
      payload,
    ),
};
