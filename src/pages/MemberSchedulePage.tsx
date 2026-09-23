import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  List,
  Calendar,
  Zap,
  Users,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { BottomSheet, Card, ErrorState, Badge } from "../components/common";
import { MemberCalendarView } from "../components/member/MemberCalendarView";
import { MemberScheduleListView } from "../components/member/MemberScheduleListView";
import { meetingApi } from "../services/domainApi";
import { memberSelfApi } from "../services/memberSelfApi";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import { goBack } from "../utils/navigation";
import { MEMBER_CATEGORIES } from "../constants";
import { CATEGORY_LABEL } from "../utils/format";
import {
  CalendarSkeleton,
  MeetingCardSkeleton,
} from "../components/common/Skeleton";
import type { Meeting, MemberCategory } from "../types";

/* -------------------------------------------------------------------------- */
/*                              Types                                          */
/* -------------------------------------------------------------------------- */

type ViewMode = "calendar" | "list";
type KategoriFilter = "all" | MemberCategory;
type GenderFilter = "" | "L" | "P";

const VIEW_KEY = "member-schedule-view";

function loadView(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === "list" || v === "calendar") return v;
  } catch {
    // ignore
  }
  return "calendar";
}

function persistView(v: ViewMode) {
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {
    // ignore
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

/* -------------------------------------------------------------------------- */
/*                              Main Component                                 */
/* -------------------------------------------------------------------------- */

export default function MemberSchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<ViewMode>(() => loadView());
  const [kategoriFilter, setKategoriFilter] = useState<KategoriFilter>("all");
  const kategoriInitialized = useRef(false);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("");
  const [selected, setSelected] = useState<Meeting | null>(null);

  const backPath = "/member";
  const handleBack = () => goBack(navigate, backPath);

  /* ---------------------- Fetch user's kategori ---------------------- */

  const { data: selfDashboard } = useQuery({
    queryKey: queryKeys.memberSelfDashboard(user?.user_id || ""),
    queryFn: () => memberSelfApi.getDashboard(),
    enabled: !!user?.user_id,
    staleTime: 5 * 60_000,
  });

  const userKategori = selfDashboard?.profile?.kategori as
    | MemberCategory
    | undefined;

  // Auto-aktifkan kategori user sekali saat data tersedia.
  // Setelah itu, jangan override pilihan manual user.
  useEffect(() => {
    if (kategoriInitialized.current) return;
    if (userKategori) {
      setKategoriFilter(userKategori);
      kategoriInitialized.current = true;
    }
  }, [userKategori]);

  /* ------------------------- Fetch meetings ------------------------- */

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

  /* ---------------------------- Filtering ---------------------------- */

  const effectiveKategori: MemberCategory | "all" = kategoriFilter;

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      // Kategori filter
      if (effectiveKategori !== "all") {
        const targets = normalizeTargets(m.kategori_target);
        // Meeting tanpa target = tampil untuk semua
        if (targets.length > 0 && !targets.includes(effectiveKategori)) {
          return false;
        }
      }
      // Gender filter
      if (genderFilter) {
        if (m.gender_target && m.gender_target !== genderFilter) return false;
      }
      return true;
    });
  }, [meetings, effectiveKategori, genderFilter]);

  /* ---------------------------- Handlers ---------------------------- */

  function handleViewChange(v: ViewMode) {
    setView(v);
    persistView(v);
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
      />

      <div className="px-4 py-4 space-y-3 pb-8">
        {/* Tab Kalender / List */}
        <div className="flex rounded-2xl bg-surface-card2 border border-surface-border overflow-hidden">
          <button
            onClick={() => handleViewChange("calendar")}
            className={
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
              (view === "calendar"
                ? "bg-accent text-white"
                : "text-surface-muted hover:bg-surface-card")
            }
          >
            <CalendarIcon size={14} />
            Kalender
          </button>
          <div className="w-px bg-surface-border" />
          <button
            onClick={() => handleViewChange("list")}
            className={
              "flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-ios-footnote font-medium transition-all duration-200 " +
              (view === "list"
                ? "bg-accent text-white"
                : "text-surface-muted hover:bg-surface-card")
            }
          >
            <List size={14} />
            Daftar
          </button>
        </div>

        {/* Kategori filter */}
        <div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
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
        </div>

        {/* Gender filter */}
        <div>
          <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
            {(
              [
                { value: "", label: "Semua" },
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ] as { value: GenderFilter; label: string }[]
            ).map((opt, idx) => {
              const active = genderFilter === opt.value;
              return (
                <div key={opt.value || "all"} className="flex-1 flex">
                  {idx > 0 && <div className="w-px bg-surface-border" />}
                  <button
                    onClick={() => setGenderFilter(opt.value)}
                    className={
                      "flex-1 min-h-[38px] flex items-center justify-center text-ios-footnote font-medium transition-all duration-200 " +
                      (active
                        ? "bg-accent text-white"
                        : "text-surface-muted hover:bg-surface-card")
                    }
                  >
                    {opt.label}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
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

        {/* Info footer */}
        {!isLoading && !error && filtered.length > 0 && (
          <p className="text-center text-ios-caption text-surface-muted pt-2">
            Menampilkan {filtered.length} jadwal
            {effectiveKategori !== "all" &&
              ` untuk kategori ${CATEGORY_LABEL[effectiveKategori]}`}
          </p>
        )}
      </div>

      {/* Detail Sheet */}
      <MeetingDetailSheet
        meeting={selected}
        onClose={() => setSelected(null)}
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Filter Chip                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Detail Sheet                                   */
/* -------------------------------------------------------------------------- */

function MeetingDetailSheet({
  meeting,
  onClose,
}: {
  meeting: Meeting | null;
  onClose: () => void;
}) {
  if (!meeting) return null;

  const targets = normalizeTargets(meeting.kategori_target);

  return (
    <BottomSheet open={!!meeting} onClose={onClose} title="Detail Jadwal">
      <div className="mb-4 p-4 rounded-2xl bg-accent-soft/60 border border-accent/15">
        <p className="text-[11px] font-medium text-accent uppercase tracking-wide mb-1">
          {meeting.hari}
        </p>
        <p className="text-lg font-semibold text-surface-text mb-2">
          {meeting.acara || "Pengajian"}
        </p>
        <div className="flex items-center gap-3 text-ios-footnote text-surface-muted flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} />
            {meeting.tanggal}
          </span>
          {meeting.jam && (
            <span className="inline-flex items-center gap-1.5">
              <Zap size={12} />
              {meeting.jam}
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

      {meeting.materi && (
        <Card className="mb-3">
          <p className="text-ios-caption text-surface-muted mb-1">Materi</p>
          <p className="text-ios-body text-surface-text">{meeting.materi}</p>
        </Card>
      )}

      {meeting.catatan && (
        <Card>
          <p className="text-ios-caption text-surface-muted mb-1">Catatan</p>
          <p className="text-ios-body text-surface-text">{meeting.catatan}</p>
        </Card>
      )}

      <button
        onClick={onClose}
        className="w-full mt-4 min-h-[44px] rounded-xl border border-surface-border bg-surface-card text-ios-subhead font-medium text-surface-text transition-colors hover:bg-surface-card2 active:scale-[0.98]"
      >
        Tutup
      </button>
    </BottomSheet>
  );
}
