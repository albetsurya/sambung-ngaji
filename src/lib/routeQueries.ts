import { queryKeys } from "./queryClient";

type QueryKey = readonly unknown[];

export function getQueryKeysForRoute(pathname: string): QueryKey[] {
  if (pathname === "/" || pathname === "/dashboard") {
    return [queryKeys.dashboard(), ["member-self-dashboard"]];
  }

  if (pathname.startsWith("/jamaah/") && pathname !== "/jamaah/baru") {
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

  if (pathname === "/jamaah" || pathname.startsWith("/jamaah")) {
    return [
      queryKeys.members(),
      queryKeys.membersPaged(),
      queryKeys.attendanceMembers(),
    ];
  }

  if (pathname.startsWith("/absensi")) {
    return [
      queryKeys.meetings(),
      queryKeys.attendancePage(""),
      queryKeys.attendanceMembers(),
    ];
  }

  if (pathname.startsWith("/pengumuman")) {
    return [queryKeys.announcements()];
  }

  if (pathname.startsWith("/profil-saya")) {
    return [["member-self-dashboard"], ["member-self-profile"]];
  }

  if (pathname.startsWith("/member")) {
    if (pathname.startsWith("/member/petugas-jumat")) {
      return [
        ["member-self-dashboard"],
        ["member-self-profile"],
        queryKeys.fridaySchedules(),
      ];
    }
    return [["member-self-dashboard"], ["member-self-profile"]];
  }

  if (pathname.startsWith("/lainnya/kelompok")) {
    return [queryKeys.groups()];
  }
  if (pathname.startsWith("/lainnya/pendaftar")) {
    return [queryKeys.pendingMembers(), queryKeys.pendingMembers("PENDING")];
  }
  if (pathname.startsWith("/lainnya/users")) {
    return [queryKeys.users()];
  }
  if (pathname.startsWith("/lainnya/audit-log")) {
    return [queryKeys.auditLogs(200)];
  }
  if (pathname.startsWith("/lainnya/ai-usage")) {
    return [queryKeys.aiUsage()];
  }
  if (pathname.startsWith("/lainnya/petugas-jumat")) {
    return [queryKeys.fridaySchedules()];
  }

  if (pathname === "/lainnya") {
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
