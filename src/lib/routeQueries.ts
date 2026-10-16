import { queryKeys } from "./queryClient";

type QueryKey = readonly unknown[];

export function getQueryKeysForRoute(pathname: string): QueryKey[] {
  if (pathname === "/" || pathname === "/dashboard") {
    return [queryKeys.dashboard(), ["member-self-dashboard"]];
  }

  if (pathname.startsWith("/members/") && pathname !== "/members/new") {
    const parts = pathname.split("/");
    const memberId = parts[2];
    if (memberId && memberId !== "baru") {
      return [
        queryKeys.memberDetail(memberId),
        queryKeys.monitoring(memberId),
        queryKeys.attendanceByMember(memberId),
        queryKeys.memberUserStatus(memberId),
      ];
    }
  }

  if (pathname === "/members" || pathname.startsWith("/members")) {
    return [
      queryKeys.members(),
      queryKeys.membersPaged(),
      queryKeys.attendanceMembers(),
    ];
  }

  if (pathname.startsWith("/attendance")) {
    return [
      queryKeys.meetings(),
      queryKeys.attendancePage(""),
      queryKeys.attendanceMembers(),
    ];
  }

  if (pathname.startsWith("/announcements")) {
    return [queryKeys.announcements()];
  }

  if (pathname.startsWith("/my-profile")) {
    return [["member-self-dashboard"], ["member-self-profile"]];
  }

  if (pathname === "/member" || pathname.startsWith("/member/")) {
    if (pathname.startsWith("/member/petugas-jumat")) {
      return [
        ["member-self-dashboard"],
        ["member-self-profile"],
        queryKeys.fridaySchedules(),
      ];
    }
    return [["member-self-dashboard"], ["member-self-profile"]];
  }

  if (pathname.startsWith("/more/groups")) {
    return [queryKeys.groups()];
  }
  if (pathname.startsWith("/more/registrants")) {
    return [queryKeys.pendingMembers(), queryKeys.pendingMembers("PENDING")];
  }
  if (pathname.startsWith("/more/users")) {
    return [queryKeys.users()];
  }
  if (pathname.startsWith("/more/audit-log")) {
    return [queryKeys.auditLogs(200)];
  }
  if (pathname.startsWith("/more/ai-usage")) {
    return [queryKeys.aiUsage()];
  }
  if (pathname.startsWith("/more/friday-officers")) {
    return [queryKeys.fridaySchedules()];
  }

  if (pathname === "/more") {
    return [];
  }

  return [];
}

export function invalidateRouteQueries(
  queryClient: {
    invalidateQueries: (opts: { queryKey: QueryKey }) => Promise<void> | void;
  },
  pathname: string,
): void {
  const keys = getQueryKeysForRoute(pathname);
  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}
