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
  Member,
  FridaySchedule,
  FridayReminderStatus,
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

/* -------------------------------------------------------------------------- */
/*                              MEETING API                                   */
/* -------------------------------------------------------------------------- */
/*
 * Backend actions (dari Code.js):
 * - getMeetings   → list
 * - createMeeting → create
 * - updateMeeting → update  (terima: meeting_id, tanggal, jam, group_id, acara, materi, status, catatan, kategori_target)
 * - deleteMeeting → remove  (terima: meeting_id)
 */

export const meetingApi = {
  list: (params?: { from?: string; to?: string; group_id?: string }) =>
    call<Meeting[]>("getMeetings", params || {}),

  create: (payload: {
    tanggal: string;
    jam: string;
    group_id: string;
    acara: string;
    materi?: string;
    catatan?: string;
    kategori_target?: string[];
    gender_target?: "" | "L" | "P";
    send_reminder?: boolean;
  }) => call<Meeting>("createMeeting", payload),

  update: (payload: {
    meeting_id: string;
    tanggal?: string;
    jam?: string;
    group_id?: string;
    acara?: string;
    materi?: string;
    status?: string;
    catatan?: string;
    kategori_target?: string[];
    gender_target?: "" | "L" | "P";
    send_reminder?: boolean;
  }) => call<Meeting>("updateMeeting", payload),

  remove: (meeting_id: string) =>
    call<{ meeting_id: string; deleted_attendance: number }>("deleteMeeting", {
      meeting_id,
    }),

  removeBulk: (meeting_ids: string[]) =>
    call<{ requested: number; deleted: number }>("deleteMeetingsBulk", {
      meeting_ids,
    }),
};

/* -------------------------------------------------------------------------- */
/*                              FRIDAY API (Petugas Jumat)                  */
/* -------------------------------------------------------------------------- */
/*
 * Backend actions:
 * - getFridaySchedules → list (terima: from, to — YYYY-MM-DD, opsional)
 * - saveFridaySchedule → upsert by tanggal (terima: tanggal wajib hari Jumat,
 *   khatib_imam, muadzin, penasihat, petugas_parkir, penata_sandal, catatan)
 * - deleteFridaySchedule → remove (terima: tanggal)
 */

export interface FridaySchedulePayload {
  tanggal: string;
  khatib_imam?: string;
  muadzin?: string;
  penasihat?: string;
  petugas_parkir?: string;
  penata_sandal?: string;
  catatan?: string;
}

export const fridayApi = {
  list: (params?: { from?: string; to?: string }) =>
    call<FridaySchedule[]>("getFridaySchedules", params || {}),

  save: (payload: FridaySchedulePayload) =>
    call<FridaySchedule>("saveFridaySchedule", payload),

  remove: (tanggal: string) =>
    call<{ tanggal: string; deleted: boolean }>("deleteFridaySchedule", {
      tanggal,
    }),

  getReminderStatus: () =>
    call<FridayReminderStatus>("getFridayReminderStatus", {}),

  markSent: (tanggal: string) =>
    call<{ marked: boolean }>("markFridayReminderSent", { tanggal }),
};

export const attendanceApi = {
  getPage: (meeting_id: string) =>
    call<{
      meeting: Meeting;
      members: Member[];
      attendance: AttendanceRecord[];
    }>("getAttendancePage", { meeting_id }),
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
  ) => call<MonitoringEntry[]>("getMonitoring", { member_id, ...options }),

  listPaged: (
    member_id: string,
    options: { limit?: number; offset?: number } = {},
  ) =>
    call<PagedResponse<MonitoringEntry>>("getMonitoring", {
      member_id,
      paged: true,
      ...options,
    }),

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
  listPaged: (
    params: {
      group_id?: string;
      status?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) =>
    call<PagedResponse<Announcement>>("getAnnouncements", {
      ...params,
      paged: true,
    }),
};

export const uploadApi = {
  photo: async (
    member_id: string | undefined,
    base64: string,
    mime_type: string,
    old_foto_url?: string,
  ) => {
    return call<{ foto_url: string }>("uploadPhoto", {
      member_id: member_id || "",
      base64,
      mime_type,
      _old_foto_url: old_foto_url || "",
    });
  },

  delete: (member_id?: string) =>
    call<{ deleted: boolean }>("deletePhoto", member_id ? { member_id } : {}),
};

export interface MoodEntry {
  mood_id: string;
  member_id: string;
  mood_key: string;
  tanggal: string;
  created_at: string;
}

export const moodApi = {
  save: (mood_key: string, tanggal?: string) =>
    call<MoodEntry>("saveMood", { mood_key, ...(tanggal ? { tanggal } : {}) }),
  listMy: (limit = 100) => call<MoodEntry[]>("getMyMoods", { limit }),
  listMember: (member_id: string, limit = 100) =>
    call<MoodEntry[]>("getMemberMoods", { member_id, limit }),
};

export interface MemberRequestEntry {
  request_id: string;
  user_id: string;
  nama: string;
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
  becomeMember: () => call<RequestBecomeMemberResult>("requestBecomeMember", {}),
  list: (status?: string) =>
    call<MemberRequestEntry[]>("getMemberRequests", status ? { status } : {}),
  approve: (request_id: string) =>
    call<MemberRequestEntry>("approveMemberRequest", { request_id }),
  reject: (request_id: string, reason?: string) =>
    call<{ rejected: boolean }>("rejectMemberRequest", {
      request_id,
      ...(reason ? { reason } : {}),
    }),
};

export const dashboardApi = {
  general: () => call<DashboardGeneral>("getDashboard"),
  pnkb: () => call<DashboardPNKB>("getDashboard"),
  absensi: () => call<DashboardAbsensi>("getDashboard"),
};

export const userApi = {
  list: () => call<import("../types").User[]>("getUsers"),

  detail: (user_id: string) =>
    call<import("../types").User>("getUserDetail", { user_id }),

  create: (payload: Record<string, unknown>) =>
    call<import("../types").User>("createUser", payload),

  update: (user_id: string, payload: Record<string, unknown>) =>
    call<import("../types").User>("updateUser", { user_id, ...payload }),

  updateRole: (user_id: string, role: string) =>
    call<import("../types").User>("updateUserRole", { user_id, role }),

  changePassword: (payload: { old_password: string; new_password: string }) =>
    call<{ changed: boolean }>("changeMyPassword", payload),

  changeUsername: (payload: { password: string; new_username: string }) =>
    call<{ changed: boolean; username: string }>("changeMyUsername", payload),

  resetPassword: (payload: { user_id: string; new_password: string }) =>
    call<{ reset: boolean; user_id: string }>("resetUserPassword", payload),

  deletePermanent: (user_id: string) =>
    call<{ deleted: boolean; user_id: string }>("deleteUserPermanent", {
      user_id,
    }),
};

export interface AuditLogEntry {
  log_id: string;
  user_id: string;
  user_nama?: string; // ← BARU
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

/* -------------------------------------------------------------------------- */
/*                          BULK MEETING API                                  */
/* -------------------------------------------------------------------------- */

export interface BulkMeetingPreviewItem {
  tanggal: string;
  tanggal_display: string;
  hari: string;
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
    tanggal: string;
    tanggal_display: string;
    hari: string;
  }[];
}

export const bulkMeetingApi = {
  preview: (params: {
    tahun: number;
    bulan: number;
    hari: string[];
    jam: string;
    group_id: string;
    acara: string;
    materi?: string;
    catatan?: string;
    kategori_target?: string[];
  }) => call<BulkMeetingPreviewResponse>("previewBulkMeetings", params),

  create: (params: {
    tahun: number;
    bulan: number;
    hari: string[];
    jam: string;
    group_id: string;
    acara: string;
    materi?: string;
    catatan?: string;
    kategori_target?: string[];
  }) => call<BulkMeetingCreateResponse>("bulkCreateMeetings", params),
};

/* -------------------------------------------------------------------------- */
/*                      ANNOUNCEMENT TEMPLATE CRUD                            */
/* -------------------------------------------------------------------------- */

export const announcementTemplateApi = {
  /** List template aktif (untuk dropdown create announcement). */
  list: () => call<AnnouncementTemplate[]>("getAnnouncementTemplates", {}),

  /** List semua template (termasuk inactive) — untuk halaman kelola. */
  listAll: (includeInactive = true) =>
    call<AnnouncementTemplate[]>("getAllAnnouncementTemplates", {
      include_inactive: includeInactive ? "true" : "false",
    }),

  /** Detail 1 template (untuk edit). */
  detail: (template_id: string) =>
    call<AnnouncementTemplate>("getAnnouncementTemplateDetail", {
      template_id,
    }),

  create: (payload: {
    nama_template: string;
    kode: string;
    isi_template: string;
    status_aktif?: boolean;
  }) => call<AnnouncementTemplate>("createAnnouncementTemplate", payload),

  update: (
    template_id: string,
    payload: {
      nama_template?: string;
      kode?: string;
      isi_template?: string;
      status_aktif?: boolean;
    },
  ) =>
    call<AnnouncementTemplate>("updateAnnouncementTemplate", {
      template_id,
      ...payload,
    }),

  remove: (template_id: string) =>
    call<{ deleted: boolean; template_id: string }>(
      "deleteAnnouncementTemplate",
      { template_id },
    ),

  createFromAnnouncement: (payload: {
    source_announcement_id?: string;
    isi_template?: string;
    nama_template: string;
    kode: string;
  }) => call<AnnouncementTemplate>("createTemplateFromAnnouncement", payload),
};
