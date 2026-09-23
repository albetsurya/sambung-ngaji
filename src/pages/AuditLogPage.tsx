import { useMemo, useState, useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  SlidersHorizontal,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  EmptyState,
  GroupedList,
  ListRow,
  ErrorState,
  Badge,
  BottomSheet,
  Button,
} from "../components/common";
import { auditApi } from "../services/domainApi";
import { ApiError } from "../services/api";
import { GroupedListSkeleton } from "../components/common/Skeleton";
import { queryKeys } from "../lib/queryClient";

type TimeFilter = "" | "today" | "7d" | "30d";

const TIME_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "today", label: "Hari ini" },
  { value: "7d", label: "7 hari" },
  { value: "30d", label: "30 hari" },
];

const TIME_RANGES_MS: Record<Exclude<TimeFilter, "">, number> = {
  today: 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/* ------------------------- Action color helper ------------------------- */

function getActionColor(action: string): "emerald" | "amber" | "red" | "ink" {
  const a = (action || "").toUpperCase();
  if (a.includes("DELETE") || a.includes("REJECT") || a === "DEACTIVATE_MEMBER")
    return "red";
  if (a.startsWith("CREATE") || a === "LOGIN" || a === "APPROVE_PENDING")
    return "emerald";
  if (a.startsWith("UPDATE") || a.startsWith("BULK_SAVE")) return "amber";
  return "ink";
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function AuditLogPage() {
  /* ---------------------------- Filter state ---------------------------- */
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);
  const [targetFilter, setTargetFilter] = useState<string[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  /* -------------------------------- Query -------------------------------- */
  const {
    data: rawLogs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auditLogs(500),
    queryFn: () => auditApi.list({ limit: 500 }),
    staleTime: 60_000,
  });

  /* --------------------- Unique options untuk filter --------------------- */
  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    rawLogs.forEach((l) => {
      if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [rawLogs]);

  const targetOptions = useMemo(() => {
    const set = new Set<string>();
    rawLogs.forEach((l) => {
      if (l.target_type) set.add(l.target_type);
    });
    return Array.from(set).sort();
  }, [rawLogs]);

  /* ---------------------------- Filter logic ---------------------------- */
  const filteredLogs = useMemo(() => {
    const now = Date.now();

    return rawLogs.filter((l) => {
      // 1. Search
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        const matches =
          l.action?.toLowerCase().includes(q) ||
          l.user_nama?.toLowerCase().includes(q) ||
          l.user_id?.toLowerCase().includes(q) ||
          l.target_id?.toLowerCase().includes(q) ||
          l.target_type?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Time filter
      if (timeFilter) {
        const t = new Date(l.timestamp).getTime();
        if (isNaN(t)) return false;
        if (now - t > TIME_RANGES_MS[timeFilter]) return false;
      }

      // 3. Action filter
      if (actionFilter.length > 0 && !actionFilter.includes(l.action)) {
        return false;
      }

      // 4. Target type filter
      if (targetFilter.length > 0 && !targetFilter.includes(l.target_type)) {
        return false;
      }

      return true;
    });
  }, [rawLogs, deferredSearch, timeFilter, actionFilter, targetFilter]);

  /* ------------------------ Active filter counter ------------------------ */
  const activeFilterCount =
    (timeFilter ? 1 : 0) + actionFilter.length + targetFilter.length;

  const hasActiveFilters = activeFilterCount > 0 || search.length > 0;

  /* ---------------------------- Reset filter ---------------------------- */
  function resetAllFilters() {
    setSearch("");
    setTimeFilter("");
    setActionFilter([]);
    setTargetFilter([]);
  }

  function toggleActionFilter(action: string) {
    setActionFilter((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
  }

  function toggleTargetFilter(target: string) {
    setTargetFilter((prev) =>
      prev.includes(target)
        ? prev.filter((t) => t !== target)
        : [...prev, target],
    );
  }

  /* -------------------------------- Render -------------------------------- */
  return (
    <AppLayout hideNav>
      <Header
        title="Audit Log"
        onBack={() => history.back()}
        backLabel="Kembali"
      />

      {/* ---------------------- Search + Filter Bar ---------------------- */}
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari action, user, atau target..."
            className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-surface-muted hover:bg-surface-card2 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          onClick={() => setFilterSheetOpen(true)}
          aria-label="Filter"
          className="relative bg-surface-card border border-surface-border hover:bg-surface-card2"
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* ---------------------- Active filter summary ---------------------- */}
      {hasActiveFilters && (
        <div className="px-4 pb-2 flex items-center justify-between gap-2">
          <p className="text-ios-caption text-surface-muted truncate">
            {filteredLogs.length} dari {rawLogs.length} log
          </p>
          <Button variant="ghost" size="xs" onClick={resetAllFilters}>
            Reset filter
          </Button>
        </div>
      )}

      {/* ----------------------------- List ----------------------------- */}
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

        {!isLoading && !error && rawLogs.length === 0 && (
          <EmptyState title="Belum ada aktivitas" />
        )}

        {!isLoading &&
          !error &&
          rawLogs.length > 0 &&
          filteredLogs.length === 0 && (
            <EmptyState
              title="Tidak ada hasil"
              description="Coba ubah kata kunci atau reset filter."
            />
          )}

        {!isLoading && !error && filteredLogs.length > 0 && (
          <GroupedList>
            {filteredLogs.map((l, i) => (
              <ListRow
                key={l.log_id}
                insetDivider={i !== filteredLogs.length - 1}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={getActionColor(l.action)}>{l.action}</Badge>
                    </div>
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {l.user_nama || l.user_id || "-"}
                    </p>
                    <p className="text-ios-footnote text-surface-muted truncate">
                      {l.target_type}
                      {l.target_id ? ` · ${l.target_id}` : ""}
                    </p>
                  </div>
                  <p className="text-ios-caption text-surface-muted shrink-0 text-right">
                    {formatTime(l.timestamp)}
                  </p>
                </div>
              </ListRow>
            ))}
          </GroupedList>
        )}

        {/* Bottom note */}
        {!isLoading && !error && filteredLogs.length > 0 && (
          <p className="text-center text-ios-caption text-surface-muted py-4">
            {filteredLogs.length === rawLogs.length
              ? `Menampilkan ${rawLogs.length} aktivitas terbaru`
              : `${filteredLogs.length} dari ${rawLogs.length} aktivitas`}
          </p>
        )}
      </div>

      {/* ---------------------- Filter Sheet ---------------------- */}
      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Audit Log"
      >
        {/* Waktu */}
        <div className="mb-4">
          <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
            Waktu
          </p>
          <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
            {TIME_OPTIONS.map((opt, idx) => {
              const active = timeFilter === opt.value;
              return (
                <div key={opt.value || "all"} className="flex-1 flex">
                  {idx > 0 && <div className="w-px bg-surface-border" />}
                  <button
                    onClick={() => setTimeFilter(opt.value)}
                    className={`flex-1 min-h-[40px] text-ios-footnote font-medium transition-all duration-200 ${
                      active
                        ? "bg-accent text-white"
                        : "text-surface-muted hover:bg-surface-card"
                    }`}
                  >
                    {opt.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action filter */}
        {actionOptions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-ios-footnote font-medium text-surface-muted">
                Aksi
              </p>
              {actionFilter.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setActionFilter([])}
                >
                  Reset
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {actionOptions.map((action) => {
                const active = actionFilter.includes(action);
                return (
                  <button
                    key={action}
                    onClick={() => toggleActionFilter(action)}
                    className={`px-3 py-1.5 rounded-full text-ios-caption font-medium border transition-all duration-200 active:scale-[0.97] ${
                      active
                        ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                        : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                    }`}
                  >
                    {action}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Target type filter */}
        {targetOptions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 px-0.5">
              <p className="text-ios-footnote font-medium text-surface-muted">
                Tipe Target
              </p>
              {targetFilter.length > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setTargetFilter([])}
                >
                  Reset
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {targetOptions.map((target) => {
                const active = targetFilter.includes(target);
                return (
                  <button
                    key={target}
                    onClick={() => toggleTargetFilter(target)}
                    className={`px-3 py-1.5 rounded-full text-ios-caption font-medium border transition-all duration-200 active:scale-[0.97] ${
                      active
                        ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
                        : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
                    }`}
                  >
                    {target}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-surface-border">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setTimeFilter("");
              setActionFilter([]);
              setTargetFilter([]);
            }}
          >
            Reset Filter
          </Button>
          <Button fullWidth onClick={() => setFilterSheetOpen(false)}>
            Terapkan ({filteredLogs.length})
          </Button>
        </div>
      </BottomSheet>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HELPER                                        */
/* -------------------------------------------------------------------------- */

function formatTime(timestamp: string): string {
  if (!timestamp) return "-";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;

    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const time = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return time;

    const date = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    return `${date} · ${time}`;
  } catch {
    return timestamp;
  }
}
