import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  members: (filters?: object) => (filters ? ["members", filters] : ["members"]),
  membersPaged: (filters?: object) =>
    filters ? ["members-paged", filters] : ["members-paged"],
  memberDetail: (id: string) => ["member", id],
  memberUserStatus: (id: string) => ["member-user-status", id],
  groups: () => ["groups"],
  pendingMembers: (status?: string) =>
    status ? ["pending-members", { status }] : ["pending-members"],
  pendingDetail: (id: string) => ["pending-member", id],
  memberRequests: (status?: string) =>
    status ? ["member-requests", { status }] : ["member-requests"],
  dashboard: () => ["dashboard"],
  meetings: (filters?: Record<string, unknown>) =>
    filters ? ["meetings", filters] : ["meetings"],
  attendance: (meetingId: string) => ["attendance", meetingId],
  attendancePage: (meetingId: string) => ["attendance-page", meetingId],
  attendanceMembers: () => ["attendance-members"],
  attendanceByMember: (memberId: string) => ["attendance-member", memberId],
  users: () => ["users"],
  userDetail: (userId: string) => ["user-detail", userId],
  auditLogs: (limit: number) => ["audit-logs", { limit }],
  settings: () => ["settings"],
  aiUsage: () => ["ai-usage"],
  monitoring: (memberId: string) => ["monitoring", memberId],
  monitoringPaged: (memberId: string, filters?: object) =>
    filters
      ? ["monitoring-paged", memberId, filters]
      : ["monitoring-paged", memberId],
  memberMoods: (memberId: string) => ["member-moods", memberId],
  announcements: () => ["announcements"],
  announcementsPaged: (filters?: object) =>
    filters ? ["announcements-paged", filters] : ["announcements-paged"],
  memberSelfDashboard: (userId: string) =>
    ["member-self-dashboard", userId] as const,
  memberSelfProfile: (userId: string) =>
    ["member-self-profile", userId] as const,
};
