import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Search,
  SlidersHorizontal,
  X,
  Download,
  LayoutGrid,
  List,
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
} from "../components/common";
import { memberApi } from "../services/memberApi";
import type { Member, MemberCategory } from "../types";
import { CATEGORY_LABEL, normalizeGender } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import { JamaahListSkeleton } from "../components/common/Skeleton";
import { exportMembersToCsv } from "../utils/exportCsv";
import { useToast } from "../contexts/ToastContext";
import { queryKeys } from "../lib/queryClient";

type ViewMode = "list" | "grid";
type GridCols = 2 | 3 | 4;

const VIEW_KEY = "members_view_mode";
const COLS_KEY = "members_grid_cols";

export default function MembersListPage() {
  const navigate = useNavigate();
  const { role } = usePermission();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const deferredSearch = useDeferredValue(debouncedSearch);
  const [kategori, setKategori] = useState<MemberCategory | "">("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const saved = localStorage.getItem(VIEW_KEY);
    return saved === "grid" ? "grid" : "list";
  });
  const [gridCols, setGridCols] = useState<GridCols>(() => {
    if (typeof window === "undefined") return 2;
    const saved = localStorage.getItem(COLS_KEY);
    if (saved === "3") return 3;
    if (saved === "4") return 4;
    return 2;
  });
  const [actionsOpen, setActionsOpen] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

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

  const {
    data: allMembers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.members(),
    queryFn: () =>
      role === "TIM_PNKB" ? memberApi.listPNKB({}) : memberApi.list({}),
    staleTime: 5 * 60_000,
  });

  const members = useMemo(() => {
    return allMembers.filter((m) => {
      if (kategori && m.kategori !== kategori) return false;
      if (jenisKelamin && m.jenis_kelamin !== jenisKelamin) return false;
      if (deferredSearch) {
        const q = deferredSearch.toLowerCase();
        const namaMatch = m.nama_lengkap.toLowerCase().includes(q);
        const panggilanMatch = (m.nama_panggilan || "")
          .toLowerCase()
          .includes(q);
        if (!namaMatch && !panggilanMatch) return false;
      }
      return true;
    });
  }, [allMembers, kategori, jenisKelamin, deferredSearch]);

  const deferredMembers = useDeferredValue(members);

  const totalCount = allMembers.length;

  const canCreate = role === "SUPER_ADMIN" || role === "ADMIN";

  const activeFilterCount = useMemo(
    () => (jenisKelamin ? 1 : 0),
    [jenisKelamin],
  );

  const hasActiveSearch = search.length > 0;

  const gridColsClass =
    gridCols === 4
      ? "grid-cols-4"
      : gridCols === 3
        ? "grid-cols-3"
        : "grid-cols-2";

  useEffect(() => {
    if (allMembers.length === 0) {
      setShowSkeleton(true);
      return;
    }
    const t = setTimeout(() => setShowSkeleton(false), 120);
    return () => clearTimeout(t);
  }, [allMembers.length]);

  const showInitialSkeleton = showSkeleton;

  const rowHeight = view === "grid" ? 140 : 76;

  const virtualizer = useVirtualizer({
    count:
      view === "grid"
        ? Math.ceil(deferredMembers.length / gridCols)
        : deferredMembers.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 6,
  });

  const virtualItems = virtualizer.getVirtualItems();

 const renderItem = useCallback(
   (index: number) => {
     if (view === "list") {
       const m = deferredMembers[index];
       if (!m) return null;
       return <JamaahCard member={m} onPress={handlePress} />;
     }
     const start = index * gridCols;
     const rowMembers = deferredMembers.slice(start, start + gridCols);
     return (
       <div className={`grid ${gridColsClass} gap-2`}>
         {rowMembers.map((m) => (
           <JamaahGridCard
             key={m.member_id}
             member={m}
             cols={gridCols}
             onClick={() => navigate(`/jamaah/${m.member_id}`)}
           />
         ))}
       </div>
     );
   },
   [deferredMembers, view, gridCols, gridColsClass, navigate],
 );

  return (
    <AppLayout
      fab={
        canCreate ? (
          <FloatingActionButton onClick={() => navigate("/jamaah/baru")} />
        ) : undefined
      }
    >
      <Header
        title="Jamaah"
        subtitle={
          showInitialSkeleton
            ? "Memuat..."
            : `${members.length} dari ${totalCount} jamaah`
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
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => setActionsOpen(true)}
            aria-label="Aksi & filter"
            className="relative min-h-[40px] w-[40px] rounded-xl bg-surface-card border border-surface-border text-surface-text flex items-center justify-center transition-colors hover:bg-surface-card2 active:scale-[0.97]"
          >
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
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

      <div className="flex flex-col flex-1 min-h-0">
        {showInitialSkeleton && (
          <div className="px-4 py-2">
            {view === "grid" ? (
              <JamaahGridSkeleton rows={gridCols * 2} cols={gridCols} />
            ) : (
              <JamaahListSkeleton rows={8} />
            )}
          </div>
        )}

        {!isLoading && error && allMembers.length === 0 && (
          <ErrorState
            message={
              error instanceof ApiError
                ? error.message
                : "Gagal memuat daftar jamaah"
            }
            onRetry={refetch}
          />
        )}

        {!showInitialSkeleton && !error && members.length === 0 && (
          <EmptyState
            title={hasActiveSearch ? "Tidak ditemukan" : "Belum ada jamaah"}
            description={
              hasActiveSearch
                ? `Tidak ada jamaah dengan nama "${search}". Coba kata kunci lain.`
                : "Tambahkan jamaah pertama untuk memulai pembinaan."
            }
            action={
              canCreate && !hasActiveSearch ? (
                <Button onClick={() => navigate("/jamaah/baru")}>
                  Tambah Jamaah
                </Button>
              ) : undefined
            }
          />
        )}

        {!showSkeleton && members.length > 0 && (
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto px-4 py-2"
            style={{ height: "calc(100vh - 220px)" }}
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualItems.map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderItem(virtualRow.index)}
                </div>
              ))}
            </div>

            <p className="text-center text-ios-footnote text-surface-muted py-4">
              Semua jamaah sudah ditampilkan ({members.length})
            </p>
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
              <button
                onClick={() => setView("list")}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 transition-all ${
                  view === "list"
                    ? "bg-accent text-white"
                    : "text-surface-muted hover:bg-surface-card"
                }`}
              >
                <List size={15} />
                <span className="text-ios-subhead font-medium">List</span>
              </button>
              <div className="w-px bg-surface-border" />
              <button
                onClick={() => setView("grid")}
                className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 transition-all ${
                  view === "grid"
                    ? "bg-accent text-white"
                    : "text-surface-muted hover:bg-surface-card"
                }`}
              >
                <LayoutGrid size={15} />
                <span className="text-ios-subhead font-medium">Grid</span>
              </button>
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
            <div className="flex gap-2">
              <button
                onClick={() => setJenisKelamin("")}
                className={`flex-1 min-h-[40px] rounded-xl border text-ios-subhead font-medium transition-all active:scale-[0.97] ${
                  jenisKelamin === ""
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-card text-surface-text border-surface-border hover:bg-surface-card2"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setJenisKelamin("L")}
                className={`flex-1 min-h-[40px] rounded-xl border text-ios-subhead font-medium transition-all active:scale-[0.97] ${
                  jenisKelamin === "L"
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-card text-surface-text border-surface-border hover:bg-surface-card2"
                }`}
              >
                Laki-laki
              </button>
              <button
                onClick={() => setJenisKelamin("P")}
                className={`flex-1 min-h-[40px] rounded-xl border text-ios-subhead font-medium transition-all active:scale-[0.97] ${
                  jenisKelamin === "P"
                    ? "bg-accent text-white border-accent"
                    : "bg-surface-card text-surface-text border-surface-border hover:bg-surface-card2"
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div>
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-0.5">
              Aksi
            </p>
            <button
              onClick={() => {
                setActionsOpen(false);
                if (members.length === 0) {
                  showToast("Tidak ada data untuk di-export", "error");
                  return;
                }
                exportMembersToCsv(members);
                showToast(`${members.length} jamaah di-export`);
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
                  Unduh {members.length} jamaah yang sudah dimuat
                </p>
              </div>
            </button>
          </div>

          {(activeFilterCount > 0 || view === "grid") && (
            <button
              onClick={() => {
                setJenisKelamin("");
                setKategori("");
                setActionsOpen(false);
              }}
              className="w-full min-h-[44px] rounded-xl border border-danger/30 bg-danger-soft text-danger text-ios-subhead font-medium transition-all hover:bg-danger-soft/80 active:scale-[0.97]"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </BottomSheet>
    </AppLayout>
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

function JamaahCard({
  member,
  onClick,
}: {
  member: Member;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} className="flex items-center gap-3 h-[68px]">
      <Avatar
        src={member.foto_url}
        name={member.nama_lengkap}
        gender={normalizeGender(member?.jenis_kelamin)}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-surface-text truncate">
          {member.nama_lengkap}
        </p>
        <p className="text-xs text-surface-muted truncate">
          {member.kelompok || "Belum ada kelompok"}
        </p>
      </div>
      {member.kategori && <Badge>{CATEGORY_LABEL[member.kategori]}</Badge>}
    </Card>
  );
}

function JamaahGridCard({
  member,
  cols,
  onClick,
}: {
  member: Member;
  cols: GridCols;
  onClick: () => void;
}) {
  const avatarSize = cols === 2 ? 56 : cols === 3 ? 44 : 36;
  const padding =
    cols === 2 ? "py-4 px-3" : cols === 3 ? "py-3 px-2" : "py-2.5 px-1.5";
  const nameSize = cols === 2 ? "text-sm" : "text-xs";
  const badgeSize = cols === 2 ? "text-[10px]" : "text-[9px]";

  return (
    <Card
      onClick={onClick}
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
          {member.nama_lengkap}
        </p>
        <p className="text-[10px] text-surface-muted truncate mt-0.5">
          {member.kelompok || "Belum ada kelompok"}
        </p>
      </div>
      {member.kategori && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${badgeSize} font-semibold tracking-wide bg-accent-soft text-accent truncate max-w-full`}
        >
          {CATEGORY_LABEL[member.kategori]}
        </span>
      )}
    </Card>
  );
}

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

function JamaahGridSkeleton({
  rows = 6,
  cols = 2,
}: {
  rows?: number;
  cols?: GridCols;
}) {
  const colsClass =
    cols === 4 ? "grid-cols-4" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  const avatarSize =
    cols === 2 ? "w-14 h-14" : cols === 3 ? "w-11 h-11" : "w-9 h-9";
  const padding = cols === 2 ? "p-3" : cols === 3 ? "p-2" : "p-1.5";
  const gap = cols === 2 ? "gap-3" : cols === 3 ? "gap-2" : "gap-1.5";

  return (
    <div className={`grid ${colsClass} ${gap}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-surface-card rounded-2xl border border-surface-border shadow-sm ${padding} flex flex-col items-center gap-2`}
        >
          <div
            className={`${avatarSize} rounded-full bg-surface-card2 animate-pulse`}
          />
          <div className="h-3 w-3/4 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-2.5 w-1/2 rounded-md bg-surface-card2 animate-pulse" />
          <div className="h-4 w-12 rounded-full bg-surface-card2 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
