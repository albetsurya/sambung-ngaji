import { queryKeys } from "./queryClient";

type QueryKey = readonly unknown[];

/**
 * Mapping route → daftar query keys yang relevan.
 * Digunakan oleh useBackgroundSync dan tombol Sync di Header.
 */
export function getQueryKeysForRoute(pathname: string): QueryKey[] {
  // Dashboard
  if (pathname === "/" || pathname === "/dashboard") {
    return [queryKeys.dashboard(), queryKeys.memberSelfDashboard()];
  }

  // Member detail (prioritas — cek dulu sebelum /jamaah)
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

  // Member list
  if (pathname === "/jamaah" || pathname.startsWith("/jamaah")) {
    return [
      queryKeys.members(),
      queryKeys.membersPaged(),
      queryKeys.attendanceMembers(),
    ];
  }

  // Absensi
  if (pathname.startsWith("/absensi")) {
    return [
      queryKeys.meetings(),
      queryKeys.attendancePage(""),
      queryKeys.attendanceMembers(),
    ];
  }

  // Pengumuman
  if (pathname.startsWith("/pengumuman")) {
    return [queryKeys.announcements()];
  }

  // Profil saya
  if (pathname.startsWith("/profil-saya")) {
    return [queryKeys.memberSelfDashboard(), queryKeys.memberSelfProfile()];
  }

  // Member self (mode member)
  if (pathname.startsWith("/member")) {
    return [queryKeys.memberSelfDashboard(), queryKeys.memberSelfProfile()];
  }

  // Lainnya — sub-routes
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
  if (pathname.startsWith("/lainnya/pengaturan")) {
    return [queryKeys.settings()];
  }
  if (pathname.startsWith("/lainnya/ai-usage")) {
    return [queryKeys.aiUsage()];
  }

  // Fallback — halaman "Lainnya" index
  if (pathname === "/lainnya") {
    return [];
  }

  // Route tidak dikenal — invalidate minimal
  return [];
}

/**
 * Invalidate semua query untuk route tertentu.
 */
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
