import { useEffect, useState } from "react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  LoadingState,
  EmptyState,
  GroupedList,
  ListRow,
  ErrorState,
} from "../components/common";
import { auditApi, type AuditLogEntry } from "../services/domainApi";
import { useToast } from "../contexts/ToastContext";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/common/Skeleton";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    auditApi
      .list({ limit: 100 })
      .then(setLogs)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Gagal memuat audit log",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout hideNav>
      <Header
        title="Audit Log"
        onBack={() => history.back()}
        backLabel="Lainnya"
      />
      <div className="py-3">
        {loading && <GroupedListSkeleton rows={6} />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && logs.length === 0 && (
          <EmptyState title="Belum ada aktivitas" />
        )}
        {!loading && !error && logs.length > 0 && (
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
