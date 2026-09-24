import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  SlidersHorizontal,
  X,
  Download,
  LayoutGrid,
  List,
  Loader2,
  KeyRound,
} from "../components/common/FontAwesomeIcons";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../components/layout/AppLayout";
import {
  Card,
  Avatar,
  Badge,
  ErrorState,
  EmptyState,
  BottomSheet,
  Button,
  Segmented,
} from "../components/common";
import { memberApi, type MemberFilters } from "../services/memberApi";
import type { Member, MemberCategory } from "../types";
import {
  CATEGORY_LABEL,
  getDisplayName,
  normalizeGender,
} from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  JamaahGridSkeleton,
  JamaahListSkeleton,
  JamaahRowSkeleton,
} from "../components/common/Skeleton";
import { exportMembersToCsv } from "../utils/exportCsv";
import { useToast } from "../contexts/ToastContext";
import { queryKeys } from "../lib/queryClient";

type ViewMode = "row" | "list" | "grid";
export type GridCols = 2 | 3 | 4;

const VIEW_KEY = "members_view_mode";
const COLS_KEY = "members_grid_cols";
const DEFAULT_VIEW: ViewMode = "row";
const PAGE_SIZE = 20;
const FETCH_THRESHOLD_PX = 300;

const ROW_HEIGHTS: Record<ViewMode, number> = {
  row: 64,
  list: 76,
  grid: 148,
};

/** Slot baris grid mengikuti tinggi kartu per jumlah kolom (+8 gap). */
const GRID_ROW_HEIGHTS: Record<GridCols, number> = {
  2: 164,
  3: 138,
  4: 126,
};

export default function MembersListPage() {
  const navigate = useNavigate();
  const { role } = usePermission();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return DEFAULT_VIEW;
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "row" || saved === "list" || saved === "grid") return saved;
    return DEFAULT_VIEW;
  });
  const [gridCols, setGridCols] = useState<GridCols>(() => {
    if (typeof window === "undefined") return 2;
    const saved = localStorage.getItem(COLS_KEY);
    if (saved === "3") return 3;
    if (saved === "4") return 4;
    return 2;
  });
  const [actionsOpen, setActionsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const kategori: MemberCategory | "" = useMemo(() => {
    const fromUrl = searchParams.get("kategori") || "";
    return (MEMBER_CATEGORIES as readonly string[]).includes(fromUrl)
      ? (fromUrl as MemberCategory)
      : "";
  }, [searchParams]);

  const setKategori = useCallback(
    (k: MemberCategory | "") => {
      const next = new URLSearchParams(searchParams);
      if (k) next.set("kategori", k);
      else next.delete("kategori");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(COLS_KEY, String(gridCols));
  }, [gridCols]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters: MemberFilters = useMemo(() => {
    const f: MemberFilters = { limit: PAGE_SIZE };
    if (debouncedSearch) f.search = debouncedSearch;
    if (kategori) f.kategori = kategori;
    if (jenisKelamin) f.jenis_kelamin = jenisKelamin;
    return f;
  }, [debouncedSearch, kategori, jenisKelamin]);

  const isPNKB = role === "TIM_PNKB";

  const query = useInfiniteQuery({
    queryKey: queryKeys.membersPaged(filters),
    queryFn: ({ pageParam }) => {
      const params: MemberFilters = { ...filters, offset: pageParam };
      return isPNKB
        ? memberApi.listPNKBPaged(params)
        : memberApi.listPaged(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.offset + lastPage.limit : undefined,
    staleTime: 5 * 60_000,
  });

  const allMembers: Member[] = useMemo(
    () => query.data?.pages.flatMap((p) => p.items) ?? [],
    [query.data],
  );

  const total = query.data?.pages[0]?.total ?? 0;

  const canCreate = role === "SUPER_ADMIN" || role === "ADMIN";

  const activeFilterCount = useMemo(
    () => (jenisKelamin ? 1 : 0) + (kategori ? 1 : 0),
    [jenisKelamin, kategori],
  );

  const hasActiveSearch = search.length > 0;

  const gridColsClass =
    gridCols === 4
      ? "grid-cols-4"
      : gridCols === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  const getScrollElement = useCallback(() => scrollRef.current, []);
  const estimateSize = useCallback(
    () => (view === "grid" ? GRID_ROW_HEIGHTS[gridCols] : ROW_HEIGHTS[view]),
    [view, gridCols],
  );

  const virtualizer = useVirtualizer({
    count:
      view === "grid"
        ? Math.ceil(allMembers.length / gridCols)
        : allMembers.length,
    getScrollElement,
    estimateSize,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const listVisible = !query.isLoading && !query.error && allMembers.length > 0;

  const maybeFetchNext = useCallback(() => {
    if (!query.hasNextPage) return;
    if (query.isFetchingNextPage) return;
    const el = scrollRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const distanceToViewportBottom = rect.bottom - viewportHeight;

    if (distanceToViewportBottom > FETCH_THRESHOLD_PX) return;
    query.fetchNextPage();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  useEffect(() => {
    if (!listVisible) return;
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => maybeFetchNext();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [listVisible, maybeFetchNext]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [debouncedSearch, kategori, jenisKelamin]);

  const handlePress = useCallback(
    (id: string) => {
      navigate(`/jamaah/${id}`);
    },
    [navigate],
  );

  const renderItem = useCallback(
    (index: number) => {
      if (view === "row") {
        const m = allMembers[index];
        if (!m) return null;
        return <JamaahRow member={m} onPress={handlePress} />;
      }
      if (view === "list") {
        const m = allMembers[index];
        if (!m) return null;
        return <JamaahCard member={m} onPress={handlePress} />;
      }
      const start = index * gridCols;
      const rowMembers = allMembers.slice(start, start + gridCols);
      return (
        <div className={`grid ${gridColsClass} gap-2 pb-2`}>
          {rowMembers.map((m) => (
            <JamaahGridCard
              key={m.member_id}
              member={m}
              cols={gridCols}
              onPress={handlePress}
            />
          ))}
        </div>
      );
    },
    [allMembers, view, gridCols, gridColsClass, handlePress],
  );

  const showSkeleton = query.isLoading;
  const showError =
    !query.isLoading && !!query.error && allMembers.length === 0;
  const showEmpty = !query.isLoading && !query.error && allMembers.length === 0;
  const showList = listVisible;

  return (
    <AppLayout
      fab={
        canCreate ? (
          <FloatingActionButton onClick={() => navigate("/jamaah/baru")} label="Tambah Jamaah" />
        ) : undefined
      }
    >
      <Header
        title="Jamaah"
        subtitle={
          query.isLoading
            ? "Memuat..."
            : `${allMembers.length} dari ${total} jamaah`
        }
        showSyncButton
      />

      <div
        className="sticky z-20 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="px-4 pt-2 pb-2 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama jamaah"
              className="w-full min-h-[40px] rounded-xl border border-surface-border bg-surface-card pl-9 pr-9 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10"
            />
            {hasActiveSearch && (
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
            onClick={() => setActionsOpen(true)}
            aria-label="Aksi & filter"
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

        <div className="px-4 pb-2.5 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryChip
            active={kategori === ""}
            label="Semua"
            onClick={() => setKategori("")}
          />
          {MEMBER_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              active={kategori === c}
              label={CATEGORY_LABEL[c]}
              onClick={() => setKategori(c)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1">
        {showSkeleton && (
          <div className={view === "grid" ? "px-4 py-2" : "py-2"}>
            {view === "grid" ? (
              <JamaahGridSkeleton rows={gridCols * 2} cols={gridCols} />
            ) : view === "row" ? (
              <JamaahRowSkeleton rows={11} />
            ) : (
              <JamaahListSkeleton rows={8} />
            )}
          </div>
        )}

        {showError && (
          <ErrorState
            message={
              query.error instanceof ApiError
                ? query.error.message
                : "Gagal memuat daftar jamaah"
            }
            onRetry={query.refetch}
          />
        )}

        {showEmpty && (
          <EmptyState
            title={
              hasActiveSearch || kategori || jenisKelamin
                ? "Tidak ditemukan"
                : "Belum ada jamaah"
            }
            description={
              hasActiveSearch
                ? `Tidak ada jamaah dengan nama "${search}". Coba kata kunci lain.`
                : kategori
                  ? `Tidak ada jamaah dengan kategori ${CATEGORY_LABEL[kategori]}.`
                  : jenisKelamin
                    ? `Tidak ada jamaah dengan jenis kelamin ${
                        jenisKelamin === "L" ? "laki-laki" : "perempuan"
                      }.`
                    : "Tambahkan jamaah pertama untuk memulai pembinaan."
            }
            action={
              canCreate && !hasActiveSearch && !kategori && !jenisKelamin ? (
                <Button onClick={() => navigate("/jamaah/baru")}>
                  Tambah Jamaah
                </Button>
              ) : undefined
            }
          />
        )}

        {showList && (
          <div
            ref={scrollRef}
            className={`flex-1 overflow-auto py-2 ${
              view === "grid" ? "px-4" : ""
            }`}
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div
              key={`${view}-${gridCols}`}
              className="animate-[fadeIn_0.15s_ease-out]"
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualRow) => {
                const totalVirtualRows =
                  view === "grid"
                    ? Math.ceil(allMembers.length / gridCols)
                    : allMembers.length;
                const isLast = virtualRow.index === totalVirtualRows - 1;
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height:
                        view === "grid"
                          ? GRID_ROW_HEIGHTS[gridCols]
                          : ROW_HEIGHTS[view],
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={
                      view === "row" && !isLast
                        ? "border-b border-surface-border/60"
                        : ""
                    }
                  >
                    {renderItem(virtualRow.index)}
                  </div>
                );
              })}
            </div>

            {query.hasNextPage && (
              <div className="flex justify-center py-4">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  leftIcon={
                    query.isFetchingNextPage ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : undefined
                  }
                >
                  {query.isFetchingNextPage
                    ? "Memuat..."
                    : `Muat lebih banyak (${allMembers.length}/${total})`}
                </Button>
              </div>
            )}

            {!query.hasNextPage && allMembers.length > 0 && (
              <p className="text-center text-ios-footnote text-surface-muted py-4">
                Semua jamaah sudah ditampilkan ({allMembers.length})
              </p>
            )}
          </div>
        )}
      </div>

      <BottomSheet
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title="Aksi & Tampilan"
      >
        <div className="space-y-3">
          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Tampilan
            </p>
            <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
              <ViewButton
                active={view === "row"}
                onClick={() => setView("row")}
                icon={<RowsIcon size={16} />}
                label="Row"
              />
              <div className="w-px bg-surface-border" />
              <ViewButton
                active={view === "list"}
                onClick={() => setView("list")}
                icon={<List size={16} />}
                label="List"
              />
              <div className="w-px bg-surface-border" />
              <ViewButton
                active={view === "grid"}
                onClick={() => setView("grid")}
                icon={<LayoutGrid size={16} />}
                label="Grid"
              />
            </div>
          </div>

          {view === "grid" && (
            <div>
              <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
                Jumlah Kolom
              </p>
              <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
                {([2, 3, 4] as GridCols[]).map((n, idx) => (
                  <div key={n} className="flex-1 flex">
                    {idx > 0 && <div className="w-px bg-surface-border" />}
                    <button
                      onClick={() => setGridCols(n)}
                      className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 transition-all ${
                        gridCols === n
                          ? "bg-accent text-white"
                          : "text-surface-muted hover:bg-surface-card"
                      }`}
                    >
                      <GridIcon cols={n} />
                      <span className="text-ios-subhead font-medium">{n}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Filter Jenis Kelamin
            </p>
            <Segmented<"" | "L" | "P">
              ariaLabel="Filter jenis kelamin"
              value={jenisKelamin as "" | "L" | "P"}
              onChange={setJenisKelamin}
              options={[
                { value: "", label: "Semua" },
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ]}
            />
          </div>

          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Aksi
            </p>
            <button
              onClick={async () => {
                setActionsOpen(false);

                try {
                  showToast("Menyiapkan data export...");

                  const exportFilters: MemberFilters = {};
                  if (kategori) exportFilters.kategori = kategori;
                  if (jenisKelamin) exportFilters.jenis_kelamin = jenisKelamin;

                  const exportData = await memberApi.listForExport(
                    isPNKB
                      ? { ...exportFilters, kategori: "PRA_NIKAH" }
                      : exportFilters,
                  );

                  if (!exportData || exportData.length === 0) {
                    showToast("Tidak ada data untuk di-export", "error");
                    return;
                  }

                  exportMembersToCsv(exportData);
                  showToast(`${exportData.length} jamaah di-export`);
                } catch (err) {
                  showToast(
                    err instanceof ApiError ? err.message : "Gagal export data",
                    "error",
                  );
                }
              }}
              className="w-full text-left rounded-xl border border-surface-border bg-surface-card hover:bg-surface-card2 p-3.5 flex items-center gap-3 transition-all active:scale-[0.99]"
            >
              <span className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
                <Download size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-surface-text">
                  Export CSV
                </p>
                <p className="text-ios-footnote text-surface-muted">
                  Unduh {total} jamaah
                </p>
              </div>
            </button>
          </div>

          {(activeFilterCount > 0 || view === "grid") && (
            <Button
              variant="softDanger"
              fullWidth
              onClick={() => {
                setJenisKelamin("");
                setKategori("");
                setActionsOpen(false);
              }}
            >
              Reset Semua Filter
            </Button>
          )}
        </div>
      </BottomSheet>
    </AppLayout>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 transition-all ${
        active
          ? "bg-accent text-white"
          : "text-surface-muted hover:bg-surface-card"
      }`}
    >
      {icon}
      <span className="text-ios-subhead font-medium">{label}</span>
    </button>
  );
}

function RowsIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0" y="2" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="6" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="10" width="14" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function GridIcon({ cols }: { cols: GridCols }) {
  const gap = 1;
  const size = 14;
  const cellSize = (size - gap * (cols - 1)) / cols;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {Array.from({ length: cols }).map((_, i) =>
        Array.from({ length: cols }).map((_, j) => (
          <rect
            key={`${i}-${j}`}
            x={j * (cellSize + gap)}
            y={i * (cellSize + gap)}
            width={cellSize}
            height={cellSize}
            rx={0.8}
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}

const JamaahRow = memo(function JamaahRow({
  member,
  onPress,
}: {
  member: Member;
  onPress: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onPress(member.member_id)}
      className="w-full flex items-center gap-3 h-16 px-4 text-left bg-transparent active:bg-surface-card2 transition-colors"
    >
      <Avatar
        src={member.foto_url}
        name={member.nama_lengkap}
        gender={normalizeGender(member?.jenis_kelamin)}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-surface-text truncate">
          {getDisplayName(member)}
        </p>
        <p className="text-[13px] text-surface-muted truncate">
          {member.kelompok || "Belum ada kelompok"}
        </p>
      </div>
      {member.has_user && (
        <span title="Punya akun user" aria-label="Punya akun user">
          <KeyRound size={12} className="text-accent shrink-0" />
        </span>
      )}
      {member.kategori && (
        <span className="text-ios-footnote text-surface-muted flex-shrink-0">
          {CATEGORY_LABEL[member.kategori]}
        </span>
      )}
    </button>
  );
});

const JamaahCard = memo(function JamaahCard({
  member,
  onPress,
}: {
  member: Member;
  onPress: (id: string) => void;
}) {
  return (
    <div className="px-4 pb-2">
      <Card
        onClick={() => onPress(member.member_id)}
        className="flex items-center gap-3 h-[68px]"
      >
        <Avatar
          src={member.foto_url}
          name={member.nama_lengkap}
          gender={normalizeGender(member?.jenis_kelamin)}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-ios-subhead text-surface-text truncate">
            {getDisplayName(member)}
          </p>
          <p className="text-ios-caption text-surface-muted truncate">
            {member.kelompok || "Belum ada kelompok"}
          </p>
        </div>
        {member.has_user && (
          <span title="Punya akun user" aria-label="Punya akun user">
            <KeyRound size={13} className="text-accent shrink-0" />
          </span>
        )}
        {member.kategori && <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>}
      </Card>
    </div>
  );
});

const JamaahGridCard = memo(function JamaahGridCard({
  member,
  cols,
  onPress,
}: {
  member: Member;
  cols: GridCols;
  onPress: (id: string) => void;
}) {
  const avatarSize = cols === 2 ? 56 : cols === 3 ? 44 : 36;
  const padding =
    cols === 2 ? "py-4 px-3" : cols === 3 ? "py-3 px-2" : "py-2.5 px-1.5";
  const nameSize = cols === 2 ? "text-ios-subhead" : "text-ios-caption";
  const badgeSize = cols === 2 ? "text-[10px]" : "text-[9px]";

  return (
    <Card
      onClick={() => onPress(member.member_id)}
      className={`flex flex-col items-center text-center gap-1.5 ${padding}`}
    >
      <Avatar
        src={member.foto_url}
        name={member.nama_lengkap}
        size={avatarSize}
        gender={normalizeGender(member?.jenis_kelamin)}
      />
      <div className="min-w-0 w-full">
        <p
          className={`font-medium ${nameSize} text-surface-text truncate leading-tight`}
        >
          {getDisplayName(member)}
        </p>
        <p className="text-[10px] text-surface-muted truncate mt-0.5">
          {member.kelompok || "Belum ada kelompok"}
        </p>
      </div>
      {member.kategori && (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeSize} font-semibold tracking-wide bg-accent-soft text-accent truncate max-w-full`}
        >
          {member.has_user && (
            <KeyRound
              size={9}
              aria-label="Punya akun user"
            />
          )}
          {CATEGORY_LABEL[member.kategori]}
        </span>
      )}
    </Card>
  );
});

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] ${
        active
          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
          : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2"
      }`}
    >
      {label}
    </button>
  );
}
