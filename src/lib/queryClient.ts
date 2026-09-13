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
  groups: () => ["groups"],
  pendingMembers: (status?: string) =>
    status ? ["pending-members", { status }] : ["pending-members"],
  pendingDetail: (id: string) => ["pending-member", id],
  dashboard: () => ["dashboard"],
  meetings: (filters?: Record<string, unknown>) =>
    filters ? ["meetings", filters] : ["meetings"],
  attendance: (meetingId: string) => ["attendance", meetingId],
  attendanceByMember: (memberId: string) => ["attendance-member", memberId],
  users: () => ["users"],
  auditLogs: (limit: number) => ["audit-logs", { limit }],
  settings: () => ["settings"],
  aiUsage: () => ["ai-usage"],
  monitoring: (memberId: string) => ["monitoring", memberId],
  announcements: () => ["announcements"],
  memberSelfDashboard: () => ["member-self-dashboard"],
  memberSelfProfile: () => ["member-self-profile"],
};
