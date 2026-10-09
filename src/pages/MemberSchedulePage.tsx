import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  List,
  Calendar,
  Zap,
  Users,
  SlidersHorizontal,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import { BottomSheet, Button, Card, ErrorState, Badge, Segmented } from "../components/ui";
import { MemberCalendarView } from "../features/member/components/MemberCalendarView";
import { MemberScheduleListView } from "../features/member/components/MemberScheduleListView";
import { meetingApi } from "../services/domainApi";
import { memberSelfApi } from "../features/member/api/memberSelfApi";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { goBack } from "../utils/navigation";
import { MEMBER_CATEGORIES } from "../constants";
import { CATEGORY_LABEL } from "../utils/format";
import {
  CalendarSkeleton,
  MeetingCardSkeleton,
} from "../components/ui/Skeleton";
import type { Meeting, MemberCategory } from "../types";


type ViewMode = "calendar" | "list";
type KategoriFilter = "all" | MemberCategory;
type GenderFilter = "" | "L" | "P";

const VIEW_KEY = "member-schedule-view";

function loadView(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "list" || v === "calendar") return v;
  } catch {
  }
  return "calendar";
}

function persistView(v: ViewMode) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {
  }
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeTargets(raw: unknown): MemberCategory[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as MemberCategory[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as MemberCategory[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}


export default function MemberSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<ViewMode>(() => loadView());
  const [kategoriFilter, setKategoriFilter] = useState<KategoriFilter>("all");
  const kategoriInitialized = useRef(false);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("");
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const backPath = user ? "/member" : "/";
  const handleBack = () => goBack(navigate, backPath);


  const { data: selfDashboard } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    enabled: !!user?.user_id,
    staleTime: 5 * 60_000,
  });

  const userKategori = selfDashboard?.profile?.kategori as
    | MemberCategory
    | undefined;

  useEffect(() => {
    if (kategoriInitialized.current) return;
    if (userKategori) {
      setKategoriFilter(userKategori);
      kategoriInitialized.current = true;
    }
  }, [userKategori]);


  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 4, 0);
    return { from: isoDate(from), to: isoDate(to) };
  }, []);

  const {
    data: meetings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["member-schedule", range],
    queryFn: () => meetingApi.list({ from: range.from, to: range.to }),
    staleTime: 2 * 60_000,
  });


  const effectiveKategori: MemberCategory | "all" = kategoriFilter;

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (effectiveKategori !== "all") {
        const targets = normalizeTargets(m.target_categories);
        if (targets.length > 0 && !targets.includes(effectiveKategori)) {
          return false;
        }
      }
      if (genderFilter) {
        if (m.gender_target && m.gender_target !== genderFilter) return false;
      }
      return true;
    });
  }, [meetings, effectiveKategori, genderFilter]);


  function handleViewChange(v: ViewMode) {
    setView(v);
    persistView(v);
  }

  const activeFilterCount =
    (kategoriFilter !== "all" ? 1 : 0) + (genderFilter !== "" ? 1 : 0);
  const filterSummary =
    kategoriFilter === "all" && genderFilter === ""
      ? "Semua jadwal"
      : [
          kategoriFilter === "all" ? null : CATEGORY_LABEL[kategoriFilter],
          genderFilter === ""
            ? null
            : genderFilter === "L"
              ? "Laki-laki"
              : "Perempuan",
        ]
          .filter(Boolean)
          .join(" · ");

  function resetFilter() {
    setKategoriFilter("all");
    setGenderFilter("");
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Jadwal Pengajian"
        subtitle={
          isLoading
            ? "Memuat..."
            : `${filtered.length} dari ${meetings.length} jadwal`
        }
        onBack={handleBack}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          !user ? (
              <MasukButton />
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-3 pb-8">
        
        <Segmented
          ariaLabel="Tampilan jadwal"
          value={view}
          onChange={handleViewChange}
          options={[
            { value: "calendar", label: "Kalender", icon: <CalendarIcon size={14} /> },
            { value: "list", label: "Daftar", icon: <List size={14} /> },
          ]}
        />

        
        <button
          onClick={() => setFilterOpen(true)}
          className="w-full min-h-[44px] rounded-2xl border border-surface-border bg-surface-card px-3.5 flex items-center gap-2.5 text-left transition-all active:scale-[0.99] hover:bg-surface-card2"
        >
          <span className="relative shrink-0 text-surface-muted">
            <SlidersHorizontal size={16} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </span>
          <span className="flex-1 min-w-0 text-ios-footnote text-surface-muted truncate">
            Filter: <span className="text-surface-text font-medium">{filterSummary}</span>
          </span>
        </button>

        
        {isLoading &&
          (view === "calendar" ? (
            <CalendarSkeleton />
          ) : (
            <div className="space-y-2.5">
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
              <MeetingCardSkeleton />
            </div>
          ))}

        {!isLoading && error && (
          <ErrorState
            message={
              error instanceof ApiError ? error.message : "Gagal memuat jadwal"
            }
            onRetry={refetch}
          />
        )}

        {!isLoading && !error && view === "calendar" && (
          <MemberCalendarView meetings={filtered} onSelect={setSelected} />
        )}

        {!isLoading && !error && view === "list" && (
          <MemberScheduleListView meetings={filtered} onSelect={setSelected} />
        )}

        
        {!isLoading && !error && filtered.length > 0 && (
          <p className="text-center text-ios-caption text-surface-muted pt-2">
            Menampilkan {filtered.length} jadwal
            {effectiveKategori !== "all" &&
              ` untuk kategori ${CATEGORY_LABEL[effectiveKategori]}`}
          </p>
        )}
      </div>

      
      <MeetingDetailSheet
        meeting={selected}
        onClose={() => setSelected(null)}
      />

      
      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Jadwal"
      >
        <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
          Kategori
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
          <FilterChip
            active={kategoriFilter === "all"}
            label="Semua"
            onClick={() => setKategoriFilter("all")}
          />
          {MEMBER_CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={kategoriFilter === c}
              label={CATEGORY_LABEL[c]}
              onClick={() => setKategoriFilter(c)}
            />
          ))}
        </div>

        <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
          Jenis Kelamin
        </p>
        <Segmented<GenderFilter>
          ariaLabel="Filter jenis kelamin"
          size="sm"
          value={genderFilter}
          onChange={setGenderFilter}
          options={[
            { value: "", label: "Semua" },
            { value: "L", label: "Laki-laki" },
            { value: "P", label: "Perempuan" },
          ]}
        />

        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={resetFilter}
            disabled={activeFilterCount === 0}
          >
            Atur Ulang
          </Button>
          <Button fullWidth onClick={() => setFilterOpen(false)}>
            Terapkan
          </Button>
        </div>
      </BottomSheet>
    </AppLayout>
  );
}


function FilterChip({
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
      className={
        "whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border transition-all duration-200 active:scale-[0.97] " +
        (active
          ? "bg-accent text-white border-accent shadow-sm shadow-accent/30"
          : "bg-surface-card text-surface-text/80 border-surface-border hover:bg-surface-card2")
      }
    >
      {label}
    </button>
  );
}


function MeetingDetailSheet({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  if (!meeting) return null;

  const targets = normalizeTargets(meeting.target_categories);

  return (
    <BottomSheet open={!!meeting} onClose={onClose} title="Detail Jadwal">
      <div className="mb-4 p-4 rounded-2xl bg-accent-soft/60 border border-accent/15">
        <p className="text-[11px] font-medium text-accent uppercase tracking-wide mb-1">
          {meeting.day}
        </p>
        <p className="text-ios-nav font-semibold text-surface-text mb-2">
          {meeting.event || "Pengajian"}
        </p>
        <div className="flex items-center gap-3 text-ios-footnote text-surface-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} />
            {meeting.date}
          </span>
          {meeting.time && (
            <span className="inline-flex items-center gap-1.5">
              <Zap size={12} />
              {meeting.time}
            </span>
          )}
        </div>
      </div>

      {targets.length > 0 && (
        <div className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-2 inline-flex items-center gap-1.5">
            <Users size={12} />
            Kategori yang diundang
          </p>
          <div className="flex flex-wrap gap-1.5">
            {targets.map((k) => (
              <Badge key={k}>{CATEGORY_LABEL[k]}</Badge>
            ))}
          </div>
        </div>
      )}

      {meeting.gender_target && (
        <div className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-2">
            Gender target
          </p>
          <Badge>
            {meeting.gender_target === "L" ? "Laki-laki" : "Perempuan"}
          </Badge>
        </div>
      )}

      {meeting.topic && (
        <Card className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-1">Materi</p>
          <p className="text-ios-body text-surface-text">{meeting.topic}</p>
        </Card>
      )}

      {meeting.notes && (
        <Card>
          <p className="text-ios-caption text-surface-muted mb-1">Catatan</p>
          <p className="text-ios-body text-surface-text">{meeting.notes}</p>
        </Card>
      )}

      <Button
        onClick={onClose}
        variant="secondary"
        size="sm"
        fullWidth
        className="mt-4"
      >
        Tutup
      </Button>
    </BottomSheet>
  );
}
