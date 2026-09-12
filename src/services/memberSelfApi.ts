import { call } from "./api";
import type {
  Member,
  MyAttendanceEntry,
  MonitoringEntry,
  Meeting,
} from "../types";

interface DashboardData {
  profile: Member;
  attendance: MyAttendanceEntry[];
  monitoring: MonitoringEntry[];
  upcoming: Meeting[];
}

let getDashboardPromise: Promise<DashboardData> | null = null;

function getDashboardCached(): Promise<DashboardData> {
  if (!getDashboardPromise) {
    getDashboardPromise = call<DashboardData>("getMyDashboard", {}).finally(
      () => {
        getDashboardPromise = null;
      },
    );
  }
  return getDashboardPromise;
}

export const memberSelfApi = {
  getDashboard: getDashboardCached,

  getProfile: () => call<Member>("getMyProfile", {}),

  updateProfile: (payload: Partial<Member>) =>
    call<Member>("updateMyProfile", payload),

  getAttendance: () => call<MyAttendanceEntry[]>("getMyAttendance", {}),

  getMonitoring: () => call<MonitoringEntry[]>("getMyMonitoring", {}),

  getUpcomingMeetings: (limit = 10) =>
    call<Meeting[]>("getUpcomingMeetings", { limit }),

  deletePhoto: () => call<{ deleted: boolean }>("deletePhoto", {}),
};
