import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  ClipboardList,
  RefreshCw,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Badge,
  EmptyState,
  ErrorState,
  GroupedList,
  ListRow,
  ChevronRow,
} from "../components/common";
import { GroupedListSkeleton } from "../components/common/Skeleton";
import { pendingApi } from "../services/pendingApi";
import type { PendingMember, PendingStatus } from "../types";
import { formatDateShort, normalizePhoneNumber } from "../utils/format";
import { ApiError } from "../services/api";

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
  const [list, setList] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<PendingStatus | "ALL">("PENDING");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = filter === "ALL" ? {} : { status: filter };
      const data = await pendingApi.list(params);
      setList(data);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal memuat pendaftar",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filter]);

  return (
    <AppLayout hideNav>
      <Header
        title="Pendaftar"
        subtitle={`${list.length} ${
          filter === "PENDING" ? "menunggu verifikasi" : "pendaftar"
        }`}
        onBack={() => history.back()}
        backLabel="Lainnya"
        right={
          <button
            onClick={load}
            aria-label="Refresh"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-accent transition-colors hover:bg-accent-soft/60 active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
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
        {loading && <GroupedListSkeleton rows={5} />}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && list.length === 0 && (
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

        {!loading && !error && list.length > 0 && (
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
                          {p.nama_lengkap}
                        </p>
                        <p className="text-ios-footnote text-surface-muted truncate">
                          {p.no_wa ? `+${p.no_wa}` : "-"}
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
