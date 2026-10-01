import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { ErrorState } from "../components/ui";
import { AttendanceListSkeleton } from "../components/ui/Skeleton";
import {
  AttendanceTab,
  type AttendanceItem,
} from "../features/member/components/MemberTabs";
import { memberSelfApi } from "../features/member/api/memberSelfApi";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { formatDateShort } from "../utils/format";


export default function MemberAttendancePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: attendance = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.memberSelfDashboard(user?.user_id || ""), "attendance"],
    queryFn: () => memberSelfApi.getAttendance(),
    enabled: !!user?.user_id,
    staleTime: 60_000,
  });

  const items: AttendanceItem[] = useMemo(
    () =>
      attendance
        .map(
          (a): AttendanceItem => ({
            id: a.attendance_id,
            date: a.tanggal,
            label: a.acara || "Pengajian",
            sublabel: [a.hari, a.tanggal ? formatDateShort(a.tanggal) : "", a.jam]
              .filter(Boolean)
              .join(" · "),
            status: a.status,
            libur: a.status_meeting === "LIBUR",
          }),
        )
        .sort((a, b) => (b.date || "").localeCompare(a.date || "")),
    [attendance],
  );

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Absensi Saya"
        subtitle={
          isLoading
            ? "Memuat..."
            : `${items.length} pertemuan tercatat`
        }
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/member", { replace: true });
        }}
        backLabel="Kembali"
        hideBackOnDesktop
        showSyncButton={false}
      />

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <AttendanceListSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat absensi"
            }
            onRetry={refetch}
          />
        ) : (
          <AttendanceTab
            items={items}
            emptyMessage="Belum ada riwayat absensi. Kehadiranmu di setiap pengajian akan tercatat di sini."
          />
        )}
      </div>
    </AppLayout>
  );
}
