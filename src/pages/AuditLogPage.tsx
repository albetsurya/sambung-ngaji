import { useQuery } from "@tanstack/react-query";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  EmptyState,
  GroupedList,
  ListRow,
  ErrorState,
} from "../components/common";
import { auditApi } from "../services/domainApi";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/common/Skeleton";
import { queryKeys } from "../lib/queryClient";

export default function AuditLogPage() {
  const {
    data: logs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auditLogs(100),
    queryFn: () => auditApi.list({ limit: 100 }),
    staleTime: 60_000,
  });

  return (
    <AppLayout hideNav>
      <Header
        title="Audit Log"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />
      <div className="py-3">
        {isLoading && <GroupedListSkeleton rows={6} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat audit log"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && logs.length === 0 && (
          <EmptyState title="Belum ada aktivitas" />
        )}

        {!isLoading && !error && logs.length > 0 && (
          <GroupedList>
            {logs.map((l, i) => (
              <ListRow key={l.log_id} insetDivider={i !== logs.length - 1}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-ios-body font-medium text-surface-text truncate">
                    {l.action}
                  </p>
                  <p className="text-ios-caption text-surface-muted shrink-0">
                    {new Date(l.timestamp).toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="text-ios-footnote text-surface-muted mt-0.5 truncate">
                  {l.target_type} · {l.target_id} · oleh {l.user_id}
                </p>
              </ListRow>
            ))}
          </GroupedList>
        )}
      </div>
    </AppLayout>
  );
}
