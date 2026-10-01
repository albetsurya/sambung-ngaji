import { restGet, restPost } from "../../../services/apiClient";
import type { PendingMember, PendingStatus } from "../../../types";

export interface ApprovePayload {
  submission_id: string;
  group_id?: string;
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
  list: (params: { status?: PendingStatus; group_id?: string } = {}) =>
    restGet<PendingMember[]>("/api/v1/pending", params),

  detail: (submission_id: string) =>
    restGet<PendingMember>("/api/v1/pending/detail", { submission_id }),

  approve: (payload: ApprovePayload) =>
    restPost<ApproveResult>("/api/v1/pending/approve", payload),

  reject: (payload: RejectPayload) =>
    restPost<{ submission_id: string; status: PendingStatus }>(
      "/api/v1/pending/reject",
      payload,
    ),
};
