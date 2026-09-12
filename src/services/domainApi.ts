import { call } from "./api";
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
} from "../types";

export const educationApi = {
  list: (member_id: string) => call<Education[]>("getEducation", { member_id }),
  save: (payload: Partial<Education>) =>
    call<Education>("saveEducation", payload),
  remove: (education_id: string) =>
    call<Education>("deleteEducation", { education_id }),
};

export const groupApi = {
  list: (includeInactive = false) =>
    call<Group[]>("getGroups", { includeInactive }),
  save: (payload: Partial<Group>) => call<Group>("saveGroup", payload),
};

export const meetingApi = {
  list: (params?: { from?: string; to?: string; group_id?: string }) =>
    call<Meeting[]>("getMeetings", params || {}),
  create: (payload: {
    tanggal: string;
    jam: string;
    group_id: string;
    acara: string;
    materi?: string;
    kategori_target?: string[];
  }) => call<Meeting>("createMeeting", payload),
  update: (payload: {
    meeting_id: string;
    jam?: string;
    group_id?: string;
    acara?: string;
    materi?: string;
    status?: string;
    catatan?: string;
    kategori_target?: string[];
  }) => call<Meeting>("updateMeeting", payload),
};

export const attendanceApi = {
  byMeeting: (meeting_id: string) =>
    call<AttendanceRecord[]>("getAttendance", { meeting_id }),
  byMember: (member_id: string) =>
    call<AttendanceRecord[]>("getAttendance", { member_id }),
  save: (payload: {
    meeting_id: string;
    member_id: string;
    status: string;
    catatan?: string;
  }) => call<AttendanceRecord>("saveAttendance", payload),
  bulkSave: (
    meeting_id: string,
    items: { member_id: string; status: string; catatan?: string }[],
  ) => call<AttendanceRecord[]>("bulkSaveAttendance", { meeting_id, items }),
  remove: (payload: { meeting_id: string; member_id: string }) =>
    call<{ deleted: number }>("deleteAttendance", payload),
  removeByMeeting: (meeting_id: string) =>
    call<{ deleted: number }>("deleteAttendanceByMeeting", { meeting_id }),
  removeByMember: (member_id: string) =>
    call<{ deleted: number }>("deleteAttendanceByMember", { member_id }),
};

export const monitoringApi = {
  list: (member_id: string) =>
    call<MonitoringEntry[]>("getMonitoring", { member_id }),
  create: (payload: Partial<MonitoringEntry>) =>
    call<MonitoringEntry>("createMonitoring", payload),
  update: (monitoring_id: string, payload: Partial<MonitoringEntry>) =>
    call<MonitoringEntry>("updateMonitoring", { monitoring_id, ...payload }),
};

export const announcementApi = {
  templates: () => call<AnnouncementTemplate[]>("getAnnouncementTemplates"),
  generate: (payload: Record<string, unknown>) =>
    call<{ generated_text: string; warning: string; hari: string }>(
      "generateAnnouncement",
      payload,
    ),
  generateWeekly: (payload: Record<string, unknown>) =>
    call<
      {
        hari: string;
        tanggal: string;
        generated_text: string;
        warning: string;
      }[]
    >("generateWeeklyAnnouncements", payload),
  create: (payload: Record<string, unknown>) =>
    call<Announcement>("createAnnouncement", payload),
  update: (announcement_id: string, payload: Record<string, unknown>) =>
    call<Announcement>("updateAnnouncement", { announcement_id, ...payload }),
  list: (params: { group_id?: string; status?: string } = {}) =>
    call<Announcement[]>("getAnnouncements", params),
};

export const uploadApi = {
  photo: (member_id: string, base64: string, mime_type: string) =>
    call<{ foto_url: string }>("uploadPhoto", { member_id, base64, mime_type }),

  delete: (member_id?: string) =>
    call<{ deleted: boolean }>("deletePhoto", member_id ? { member_id } : {}),
};

export const dashboardApi = {
  general: () => call<DashboardGeneral>("getDashboard"),
  pnkb: () => call<DashboardPNKB>("getDashboard"),
  absensi: () => call<DashboardAbsensi>("getDashboard"),
};

export const userApi = {
  list: () => call<import("../types").User[]>("getUsers"),
  create: (payload: Record<string, unknown>) =>
    call<import("../types").User>("createUser", payload),
  update: (user_id: string, payload: Record<string, unknown>) =>
    call<import("../types").User>("updateUser", { user_id, ...payload }),
  changePassword: (payload: { old_password: string; new_password: string }) =>
    call<{ changed: boolean }>("changeMyPassword", payload),

  resetPassword: (payload: { user_id: string; new_password: string }) =>
    call<{ reset: boolean; user_id: string }>("resetUserPassword", payload),
};

export const settingsApi = {
  get: () => call<Record<string, unknown>>("getSettings"),
  update: (key: string, value: unknown) =>
    call<{ key: string; value: unknown }>("updateSettings", { key, value }),
};

export interface AuditLogEntry {
  log_id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
}

export const auditApi = {
  list: (
    params: { user_id?: string; target_type?: string; limit?: number } = {},
  ) => call<AuditLogEntry[]>("getAuditLogs", params),
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
    user_nama: string;
    role: string;
    chat_count: number;
    total_tokens: number;
  }[];
}

export const aiUsageApi = {
  stats: () => call<AiUsageStats>("getAiUsageStats", {}),
};
