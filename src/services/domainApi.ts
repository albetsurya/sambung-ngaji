import { restGet, restPost, restPut, restDelete } from "./apiClient";
import type {
  Education,
  Group,
  Meeting,
  AttendanceRecord,
  MonitoringEntry,
  AnnouncementTemplate,
  Announcement,
  DashboardGeneral,
  DashboardPNKB,
  DashboardAbsensi,
  Member,
  FridaySchedule,
} from "../types";

export const groupApi = {
  list: (includeInactive = false) =>
    restGet<Group[]>("/api/v1/groups", { includeInactive }),
  save: (payload: Partial<Group>) => restPost<Group>("/api/v1/groups", payload),
};

export const meetingApi = {
  list: (params?: { from?: string; to?: string; group_id?: string }) =>
    restGet<Meeting[]>("/api/v1/meetings", params || {}),

  create: (payload: {
    date: string;
    time: string;
    group_id: string;
    event: string;
    topic?: string;
    notes?: string;
    target_categories?: string[];
    gender_target?: "L" | "P" | null;
    send_reminder?: boolean;
  }) => restPost<Meeting>("/api/v1/meetings", payload),

  update: (payload: {
    meeting_id: string;
    date?: string;
    time?: string;
    group_id?: string;
    event?: string;
    topic?: string;
    status?: string;
    notes?: string;
    target_categories?: string[];
    gender_target?: "L" | "P" | null;
    send_reminder?: boolean;
  }) => restPut<Meeting>("/api/v1/meetings", payload),

  remove: (meeting_id: string) =>
    restDelete<{ meeting_id: string; deleted_attendance: number }>("/api/v1/meetings", {
      meeting_id,
    }),

  removeBulk: (meeting_ids: string[]) =>
    restDelete<{ requested: number; deleted: number }>("/api/v1/meetings/bulk", {
      meeting_ids,
    }),
};

export interface FridaySchedulePayload {
  date: string;
  sermon_leader?: string;
  muadzin?: string;
  advisor?: string;
  parking_attendant?: string;
  footwear_attendant?: string;
  notes?: string;
}

export const fridayApi = {
  list: (params?: { from?: string; to?: string; group_id?: string }) =>
    restGet<FridaySchedule[]>("/api/v1/friday", params || {}),

  save: (payload: FridaySchedulePayload) =>
    restPost<FridaySchedule>("/api/v1/friday", payload),

  remove: (date: string) =>
    restDelete<{ date: string; deleted: boolean }>("/api/v1/friday", {
      date,
    }),

  markSent: (date: string) =>
    restPost<{ marked: boolean }>("/api/v1/friday/mark-reminder-sent", { date }),
};

export const attendanceApi = {
  getPage: (meeting_id: string) =>
    restGet<{
      meeting: Meeting;
      members: Member[];
      attendance: AttendanceRecord[];
    }>("/api/v1/attendance/page", { meeting_id }),

  byMeeting: (meeting_id: string) =>
    restGet<AttendanceRecord[]>("/api/v1/attendance", { meeting_id }),

  byMember: (member_id: string) =>
    restGet<AttendanceRecord[]>("/api/v1/attendance", { member_id }),

  save: (payload: {
    meeting_id: string;
    member_id: string;
    status: string;
    notes?: string;
  }) => restPost<AttendanceRecord>("/api/v1/attendance", payload),

  bulkSave: (
    meeting_id: string,
    items: { member_id: string; status: string; catatan?: string }[],
  ) => restPost<AttendanceRecord[]>("/api/v1/attendance/bulk", { meeting_id, items }),

  remove: (payload: { meeting_id: string; member_id: string }) =>
    restDelete<{ deleted: number }>("/api/v1/attendance", payload),

  removeByMeeting: (meeting_id: string) =>
    restDelete<{ deleted: number }>("/api/v1/attendance/meeting", { meeting_id }),

  removeByMember: (member_id: string) =>
    restDelete<{ deleted: number }>("/api/v1/attendance/member", { member_id }),
};

export interface PagedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export const monitoringApi = {
  list: (
    member_id: string,
    options: { limit?: number; offset?: number } = {},
  ) => restGet<MonitoringEntry[]>("/api/v1/monitoring", { member_id, ...options }),

  listPaged: (
    member_id: string,
    options: { limit?: number; offset?: number } = {},
  ) =>
    restGet<PagedResponse<MonitoringEntry>>("/api/v1/monitoring", {
      member_id,
      paged: true,
      ...options,
    }),

  create: (payload: Partial<MonitoringEntry>) =>
    restPost<MonitoringEntry>("/api/v1/monitoring", payload),

  update: (monitoring_id: string, payload: Partial<MonitoringEntry>) =>
    restPut<MonitoringEntry>("/api/v1/monitoring", { monitoring_id, ...payload }),
};

export const announcementApi = {
  templates: () => restGet<AnnouncementTemplate[]>("/api/v1/announcements/templates"),

  generate: (payload: Record<string, unknown>) =>
    restPost<{ generated_text: string; warning: string; day: string }>(
      "/api/v1/announcements/generate",
      payload,
    ),

  generateWeekly: (payload: Record<string, unknown>) =>
    restPost<
      {
        day: string;
        date: string;
        generated_text: string;
        warning: string;
      }[]
    >("/api/v1/announcements/generate-weekly", payload),

  create: (payload: Record<string, unknown>) =>
    restPost<Announcement>("/api/v1/announcements", payload),

  update: (announcement_id: string, payload: Record<string, unknown>) =>
    restPut<Announcement>("/api/v1/announcements", { announcement_id, ...payload }),

  list: (params: { group_id?: string; status?: string } = {}) =>
    restGet<Announcement[]>("/api/v1/announcements", params),

  listPaged: (
    params: {
      group_id?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) =>
    restGet<PagedResponse<Announcement>>("/api/v1/announcements", {
      ...params,
      paged: true,
    }),
};

export const uploadApi = {
  photo: async (
    member_id: string | undefined,
    base64: string,
    mime_type: string,
    old_photo_url?: string,
  ) => {
    return restPost<{ foto_url: string }>("/api/v1/photo", {
      member_id: member_id || "",
      base64,
      mime_type,
      _old_photo_url: old_photo_url || "",
    });
  },

  delete: (member_id?: string) =>
    restDelete<{ deleted: boolean }>("/api/v1/photo", member_id ? { member_id } : {}),
};

export interface MoodEntry {
  mood_id: string;
  member_id: string;
  mood_key: string;
  date: string;
  created_at: string;
}

export const moodApi = {
  save: (mood_key: string, date?: string) =>
    restPost<MoodEntry>("/api/v1/moods", { mood_key, ...(date ? { date } : {}) }),

  listMy: (limit = 100) => restGet<MoodEntry[]>("/api/v1/moods/my", { limit }),

  listMember: (member_id: string, limit = 100) =>
    restGet<MoodEntry[]>("/api/v1/moods/member", { member_id, limit }),
};

export interface MemberRequestEntry {
  request_id: string;
  user_id: string;
  name: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  member_id?: string;
  reason?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface RequestBecomeMemberResult {
  auto_created?: string;
  request_sent?: string;
  message: string;
}

export const memberRequestApi = {
  becomeMember: () => restPost<RequestBecomeMemberResult>("/api/v1/member-requests/become"),

  list: (status?: string, params: { group_id?: string } = {}) =>
    restGet<MemberRequestEntry[]>("/api/v1/member-requests", {
      ...(status ? { status } : {}),
      ...params,
    }),

  approve: (request_id: string) =>
    restPost<MemberRequestEntry>("/api/v1/member-requests/approve", { request_id }),

  reject: (request_id: string, reason?: string) =>
    restPost<{ rejected: boolean }>("/api/v1/member-requests/reject", {
      request_id,
      ...(reason ? { reason } : {}),
    }),
};

export const dashboardApi = {
  general: (params?: { group_id?: string }) =>
    restGet<DashboardGeneral>("/api/v1/dashboard", params),
  pnkb: () => restGet<DashboardPNKB>("/api/v1/dashboard"),
  absensi: () => restGet<DashboardAbsensi>("/api/v1/dashboard"),
};

export const userApi = {
  list: (params: { group_id?: string } = {}) =>
    restGet<import("../types").User[]>("/api/v1/users", params),

  detail: (user_id: string) =>
    restGet<import("../types").User>("/api/v1/users/detail", { user_id }),

  create: (payload: Record<string, unknown>) =>
    restPost<import("../types").User>("/api/v1/users", payload),

  update: (user_id: string, payload: Record<string, unknown>) =>
    restPut<import("../types").User>("/api/v1/users", { user_id, ...payload }),

  updateRole: (user_id: string, role: string) =>
    restPut<import("../types").User>("/api/v1/users/role", { user_id, role }),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    restPost<{ changed: boolean }>("/api/v1/auth/change-password", payload),

  changeUsername: (payload: { password: string; new_username: string }) =>
    restPost<{ changed: boolean; username: string }>("/api/v1/auth/change-username", payload),

  resetPassword: (payload: { user_id: string; new_password: string }) =>
    restPost<{ reset: boolean; user_id: string }>("/api/v1/users/reset-password", payload),

  deletePermanent: (user_id: string) =>
    restDelete<{ deleted: boolean; user_id: string }>("/api/v1/users", {
      user_id,
    }),
};

export interface AuditLogEntry {
  log_id: string;
  user_id: string;
  user_name?: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
}

export const auditApi = {
  list: (
    params: { user_id?: string; target_type?: string; limit?: number } = {},
  ) => restGet<AuditLogEntry[]>("/api/v1/audit-logs", params),
};

export interface AiUsageStats {
  today: {
    chat_count: number;
    total_tokens: number;
  };
  month: {
    chat_count: number;
    total_tokens: number;
  };
  by_provider: {
    provider: string;
    chat_count: number;
    total_tokens: number;
  }[];
  by_role: {
    role: string;
    chat_count: number;
    total_tokens: number;
  }[];
  top_users: {
    user_id: string;
    user_name: string;
    role: string;
    chat_count: number;
    total_tokens: number;
  }[];
}

export const aiUsageApi = {
  stats: () => restGet<AiUsageStats>("/api/v1/ai/usage"),
};

export interface BulkMeetingPreviewItem {
  date: string;
  tanggal_display: string;
  day: string;
  sudah_ada: boolean;
}

export interface BulkMeetingPreviewResponse {
  total_dates: number;
  total_new: number;
  total_existing: number;
  meetings: BulkMeetingPreviewItem[];
}

export interface BulkMeetingCreateResponse {
  created: number;
  skipped: number;
  meetings: {
    meeting_id: string;
    date: string;
    tanggal_display: string;
    day: string;
  }[];
}

export const bulkMeetingApi = {
  preview: (params: {
    tahun: number;
    bulan: number;
    day: string[];
    time: string;
    group_id: string;
    event: string;
    topic?: string;
    notes?: string;
    target_categories?: string[];
  }) => restPost<BulkMeetingPreviewResponse>("/api/v1/meetings/bulk-preview", params),

  create: (params: {
    tahun: number;
    bulan: number;
    day: string[];
    time: string;
    group_id: string;
    event: string;
    topic?: string;
    notes?: string;
    target_categories?: string[];
  }) => restPost<BulkMeetingCreateResponse>("/api/v1/meetings/bulk-create", params),
};

export const announcementTemplateApi = {
  list: () => restGet<AnnouncementTemplate[]>("/api/v1/announcements/templates"),

  listAll: (includeInactive = true) =>
    restGet<AnnouncementTemplate[]>("/api/v1/announcements/templates/all", {
      include_inactive: includeInactive ? "true" : "false",
    }),

  detail: (template_id: string) =>
    restGet<AnnouncementTemplate>("/api/v1/announcements/templates/detail", {
      template_id,
    }),

  create: (payload: {
    template_name: string;
    kode: string;
    template_body: string;
    is_active?: boolean;
  }) => restPost<AnnouncementTemplate>("/api/v1/announcements/templates", payload),

  update: (
    template_id: string,
    payload: {
      template_name?: string;
      kode?: string;
      template_body?: string;
      is_active?: boolean;
    },
  ) =>
    restPut<AnnouncementTemplate>("/api/v1/announcements/templates", {
      template_id,
      ...payload,
    }),

  remove: (template_id: string) =>
    restDelete<{ deleted: boolean; template_id: string }>(
      "/api/v1/announcements/templates",
      { template_id },
    ),

  createFromAnnouncement: (payload: {
    source_announcement_id?: string;
    template_body?: string;
    template_name: string;
    kode: string;
  }) => restPost<AnnouncementTemplate>("/api/v1/announcements/templates/from-announcement", payload),
};
