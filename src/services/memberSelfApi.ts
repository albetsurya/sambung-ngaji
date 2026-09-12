import { call } from "./api";
import type {
  Member,
  MyAttendanceEntry,
  MonitoringEntry,
  Meeting,
} from "../types";

export const memberSelfApi = {
  getProfile: () => call<Member>("getMyProfile", {}),

  updateProfile: (payload: Partial<Member>) =>
    call<Member>("updateMyProfile", payload),

  getAttendance: () => call<MyAttendanceEntry[]>("getMyAttendance", {}),

  getMonitoring: () => call<MonitoringEntry[]>("getMyMonitoring", {}),

  getUpcomingMeetings: (limit = 10) =>
    call<Meeting[]>("getUpcomingMeetings", { limit }),

  deletePhoto: () => call<{ deleted: boolean }>("deletePhoto", {}),
};
