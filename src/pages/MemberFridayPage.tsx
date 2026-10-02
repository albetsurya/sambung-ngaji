import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mosque } from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import {
  EmptyState,
  ErrorState,
  Badge,
} from "../components/ui";
import { CalendarSkeleton } from "../components/ui/Skeleton";
import { fridayApi } from "../services/domainApi";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { formatDateLongText } from "../utils/format";
import { goBack } from "../utils/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  FRIDAY_ROLES,
  missingRoles,
  isFridayComplete,
  todayIso,
} from "../features/friday/utils/friday";

export default function MemberFridayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.fridaySchedules(),
    queryFn: () => fridayApi.list(),
    staleTime: 5 * 60_000,
  });

  const today = todayIso();
  const upcoming = useMemo(
    () =>
      schedules
        .filter((s) => s.tanggal >= today)
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal)),
    [schedules, today],
  );

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Petugas Jumat"
        onBack={() => goBack(navigate, user ? "/member" : "/")}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          !user ? (
              <MasukButton />
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-3 pb-8">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
            <Mosque size={18} />
          </span>
          <p className="text-ios-footnote text-surface-muted leading-relaxed">
            Informasi petugas sholat Jumat. Hubungi takmir bila ada perubahan
            atau koreksi nama.
          </p>
        </div>

        {isLoading && <CalendarSkeleton />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat jadwal petugas"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && upcoming.length === 0 && (
          <EmptyState
            title="Belum ada jadwal mendatang"
            description="Jadwal petugas Jumat berikutnya akan tampil di sini."
          />
        )}

        {!isLoading &&
          !error &&
          upcoming.map((s, i) => {
            const missing = missingRoles(s);
            const complete = isFridayComplete(s);
            return (
              <div
                key={s.tanggal}
                className="rounded-2xl border border-surface-border bg-surface-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-ios-body font-semibold text-surface-text">
                      {formatDateLongText(s.tanggal)}
                    </p>
                    <p className="text-ios-caption text-surface-muted">
                      {i === 0 ? "Jumat terdekat" : "Sholat Jumat"}
                    </p>
                  </div>
                  {complete ? (
                    <Badge>Terkonfirmasi</Badge>
                  ) : (
                    <Badge color="amber">{missing.length} belum diisi</Badge>
                  )}
                </div>

                <div className="divide-y divide-surface-border/60">
                  {FRIDAY_ROLES.map((r) => {
                    const name = (s[r.key] || "").trim();
                    return (
                      <div
                        key={r.key}
                        className="flex items-center justify-between gap-2 py-1.5"
                      >
                        <span className="text-ios-footnote text-surface-muted">
                          {r.label}
                        </span>
                        <span className="text-ios-footnote font-medium text-surface-text text-right truncate">
                          {name || "-"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {s.catatan?.trim() && (
                  <p className="mt-2 text-ios-footnote text-surface-muted italic">
                    {s.catatan}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </AppLayout>
  );
}
