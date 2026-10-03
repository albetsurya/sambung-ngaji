import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User as UserIcon,
  RefreshCw,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Badge,
  EmptyState,
  ErrorState,
  GroupedList,
  ListRow,
  ChevronRow,
  Button,
} from "../components/ui";
import { PendingMembersSkeleton } from "../components/ui/Skeleton";
import { pendingApi } from "../features/admin/api/pendingApi";
import { usePermission } from "../hooks/usePermission";
import type { PendingMember, PendingStatus } from "../types";
import { formatDateShort } from "../utils/format";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";

const STATUS_FILTERS: {
  key: PendingStatus | "ALL";
  label: string;
  color: "ink" | "amber" | "emerald" | "red";
}[] = [
  { key: "PENDING", label: "Pending", color: "amber" },
  { key: "APPROVED", label: "Approved", color: "emerald" },
  { key: "REJECTED", label: "Rejected", color: "red" },
  { key: "ALL", label: "Semua", color: "ink" },
];

const STATUS_BADGE: Record<
  PendingStatus,
  { label: string; color: "amber" | "emerald" | "red" }
> = {
  PENDING: { label: "Menunggu", color: "amber" },
  APPROVED: { label: "Disetujui", color: "emerald" },
  REJECTED: { label: "Ditolak", color: "red" },
};

export default function PendingMembersPage() {
  const navigate = useNavigate();
  const { assignedGroup } = usePermission();
  const [filter, setFilter] = useState<PendingStatus | "ALL">("PENDING");

  const statusParam = filter === "ALL" ? undefined : filter;

  const {
    data: list = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.pendingMembers(statusParam, assignedGroup),
    queryFn: () => {
      const params: { status?: PendingStatus; group_id?: string } = {};
      if (statusParam) params.status = statusParam;
      if (assignedGroup) params.group_id = assignedGroup;
      return pendingApi.list(params);
    },
    staleTime: 60_000,
  });

  return (
    <AppLayout hideNav>
      <Header
        title="Pendaftar"
        subtitle={`${list.length} ${
          filter === "PENDING" ? "menunggu verifikasi" : "pendaftar"
        }`}
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

      <div className="sticky z-20 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                    : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="py-3">
        {isLoading && <PendingMembersSkeleton rows={5} />}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat pendaftar"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && list.length === 0 && (
          <EmptyState
            title={
              filter === "PENDING"
                ? "Tidak ada pendaftar baru"
                : "Belum ada pendaftar"
            }
            description={
              filter === "PENDING"
                ? "Semua pendaftar sudah diverifikasi."
                : "Pendaftar akan muncul di sini setelah mengisi form."
            }
          />
        )}

        {!isLoading && !error && list.length > 0 && (
          <GroupedList>
            {list.map((p, i) => {
              const badge = STATUS_BADGE[p.status];
              return (
                <ListRow
                  key={p.submission_id}
                  onClick={() =>
                    navigate(`/lainnya/pendaftar/${p.submission_id}`)
                  }
                  insetDivider={i !== list.length - 1}
                  leading={
                    <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
                      <UserIcon size={16} />
                    </span>
                  }
                >
                  <ChevronRow>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {p.full_name}
                        </p>
                        <p className="text-ios-footnote text-surface-muted truncate">
                          {p.whatsapp_number ? `+${p.whatsapp_number}` : "-"}
                          {p.submitted_at
                            ? ` · ${formatDateShort(p.submitted_at)}`
                            : ""}
                        </p>
                      </div>
                      <Badge color={badge.color}>{badge.label}</Badge>
                    </div>
                  </ChevronRow>
                </ListRow>
              );
            })}
          </GroupedList>
        )}
      </div>
    </AppLayout>
  );
}
