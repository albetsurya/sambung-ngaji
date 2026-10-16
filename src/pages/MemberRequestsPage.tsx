import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  RefreshCw,
  Check,
  X,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Badge,
  EmptyState,
  ErrorState,
  GroupedList,
  ListRow,
  Button,
  ConfirmDialog,
} from "../components/ui";
import { PendingMembersSkeleton } from "../components/ui/Skeleton";
import { memberRequestApi } from "../services/domainApi";
import type { MemberRequestEntry } from "../services/domainApi";
import { usePermission } from "../hooks/usePermission";
import { formatDateShort } from "../utils/format";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { useToast } from "../contexts/ToastContext";

const STATUS_BADGE: Record<
  MemberRequestEntry["status"],
  { label: string; color: "amber" | "emerald" | "red" }
> = {
  PENDING: { label: "Menunggu", color: "amber" },
  APPROVED: { label: "Disetujui", color: "emerald" },
  REJECTED: { label: "Ditolak", color: "red" },
};

export default function MemberRequestsPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { assignedGroup } = usePermission();
  const [pendingAction, setPendingAction] = useState<MemberRequestEntry | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<MemberRequestEntry | null>(
    null,
  );

  const {
    data: list = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.memberRequests("PENDING", assignedGroup),
    queryFn: () =>
      memberRequestApi.list(
        "PENDING",
        assignedGroup ? { group_id: assignedGroup } : {},
      ),
    staleTime: 30_000,
  });

  const approve = useMutation({
    mutationFn: (id: string) => memberRequestApi.approve(id),
    onSuccess: () => {
      showToast("Permintaan disetujui.");
      setPendingAction(null);
      qc.invalidateQueries({ queryKey: queryKeys.memberRequests() });
      qc.invalidateQueries({ queryKey: queryKeys.members() });
      qc.invalidateQueries({ queryKey: queryKeys.membersPaged() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
      qc.invalidateQueries({ queryKey: queryKeys.users() });
    },
    onError: (e) =>
      showToast(
        e instanceof Error ? e.message : "Gagal menyetujui permintaan",
        "error",
      ),
  });

  const reject = useMutation({
    mutationFn: (id: string) => memberRequestApi.reject(id),
    onSuccess: () => {
      showToast("Permintaan ditolak.");
      setRejectTarget(null);
      qc.invalidateQueries({ queryKey: queryKeys.memberRequests() });
    },
    onError: (e) =>
      showToast(e instanceof Error ? e.message : "Gagal menolak permintaan", "error"),
  });

  return (
    <AppLayout hideNav>
      <Header
        title="Permintaan Member"
        subtitle={`${list.length} menunggu`}
        onBack={() => history.back()}
        backLabel="Kembali"
        right={
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            onClick={() => refetch()}
            aria-label="Refresh"
          >
            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          </Button>
        }
      />

      <div className="py-3">
        {isLoading && <PendingMembersSkeleton rows={5} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat permintaan"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && list.length === 0 && (
          <EmptyState
            title="Tidak ada permintaan"
            description="Permintaan menjadi member dari user tanpa data member akan muncul di sini."
          />
        )}

        {!isLoading && !error && list.length > 0 && (
          <GroupedList>
            {list.map((r, i) => {
              const badge = STATUS_BADGE[r.status];
              return (
                <ListRow
                  key={r.request_id}
                  insetDivider={i !== list.length - 1}
                  leading={
                    <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                      <UserPlus size={16} />
                    </span>
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {r.name || "-"}
                      </p>
                      <p className="text-ios-footnote text-surface-muted truncate">
                        {r.created_at ? formatDateShort(r.created_at) : "-"}
                      </p>
                    </div>
                    <Badge color={badge.color}>{badge.label}</Badge>
                  </div>
                  {r.status === "PENDING" && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPendingAction(r)}
                        disabled={approve.isPending}
                      >
                        <Check size={14} /> Setujui
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="flex-1"
                        onClick={() => setRejectTarget(r)}
                        disabled={reject.isPending}
                      >
                        <X size={14} /> Tolak
                      </Button>
                    </div>
                  )}
                </ListRow>
              );
            })}
          </GroupedList>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingAction}
        title="Setujui member?"
        description={
          pendingAction
            ? `Data member untuk "${pendingAction.name}" akan dibuat dan akunnya ditautkan.`
            : ""
        }
        confirmLabel="Setujui"
        onCancel={() => setPendingAction(null)}
        onConfirm={() => pendingAction && approve.mutate(pendingAction.request_id)}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Tolak permintaan?"
        description={
          rejectTarget
            ? `Permintaan "${rejectTarget.name}" akan ditolak.`
            : ""
        }
        confirmLabel="Tolak"
        onCancel={() => setRejectTarget(null)}
        onConfirm={() =>
          rejectTarget && reject.mutate(rejectTarget.request_id)
        }
      />
    </AppLayout>
  );
}