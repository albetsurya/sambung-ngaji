import { restGet, restPut, restDelete } from "./apiClient";
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
    getDashboardPromise = restGet<DashboardData>("/api/v1/dashboard/my").finally(
      () => {
        getDashboardPromise = null;
      },
    );
  }
  return getDashboardPromise;
}

export const memberSelfApi = {
  getDashboard: getDashboardCached,

  getProfile: () => restGet<Member>("/api/v1/auth/me"),

  updateProfile: (payload: Partial<Member>) =>
    restPut<Member>("/api/v1/auth/me", payload),

  getAttendance: () => restGet<MyAttendanceEntry[]>("/api/v1/auth/my-attendance"),

  getMonitoring: () => restGet<MonitoringEntry[]>("/api/v1/auth/my-monitoring"),

  getUpcomingMeetings: (limit = 10) =>
    restGet<Meeting[]>("/api/v1/auth/upcoming-meetings", { limit }),

  deletePhoto: () => restDelete<{ deleted: boolean }>("/api/v1/photo"),
};
