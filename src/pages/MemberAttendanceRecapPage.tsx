import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  Calendar,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, EmptyState } from "../components/common";
import { RecapTableSkeleton } from "../components/common/Skeleton";
import { meetingApi, attendanceApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type {
  Meeting,
  AttendanceRecord,
  MemberCategory,
} from "../types";
import {
  formatDateLongText,
  formatDayMonth,
  getTodayIso,
} from "../utils/format";
import { CATEGORY_LABEL } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  buildRecapMatrix,
  exportRecapPDF,
  exportRecapExcel,
  type RecapMatrix,
} from "../lib/monthlyAttendanceExport";

/* -------------------------------------------------------------------------- */
/*                              Config                                        */
/* -------------------------------------------------------------------------- */

function defaultMonth(): string {
  return getTodayIso().slice(0, 7);
}

const PAGE_SIZE = 20;
const FETCH_THRESHOLD_PX = 600;

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

export default function MemberAttendanceRecapPage() {
  const navigate = useNavigate();
  const { role } = usePermission();
  const isReadonly = role === "PENGAWAS";
  const { showToast } = useToast();

  const [recapMonth, setRecapMonth] = useState(defaultMonth);
  const [recapKategori, setRecapKategori] = useState<MemberCategory | "">("");
  const [recapGender, setRecapGender] = useState<"" | "L" | "P">("");
  const [exporting, setExporting] = useState<null | "pdf" | "excel">(null);

  /* Jadwal + absensi per meeting dalam bulan — bounded, diambil sekali */
  const meetingsQuery = useQuery({
    queryKey: ["recap-meetings", recapMonth],
    queryFn: async () => {
      const from = `${recapMonth}-01`;
      const to = new Date(
        Date.UTC(
          Number(recapMonth.slice(0, 4)),
          Number(recapMonth.slice(5, 7)),
          0,
        ),
      )
        .toISOString()
        .slice(0, 10);

      const meetingsInMonth = await meetingApi.list({ from, to });
      const meetings = meetingsInMonth.filter(
        (m) => m.status !== "LIBUR",
      );

      const attendanceByMeeting = new Map<string, AttendanceRecord[]>();
      await Promise.all(
        meetings.map(async (meeting) => {
          const records = await attendanceApi.byMeeting(meeting.meeting_id);
          attendanceByMeeting.set(meeting.meeting_id, records);
        }),
      );

      return { meetings, attendanceByMeeting };
    },
    staleTime: 2 * 60_000,
  });

  /* Jamaah — paginasi 20/halaman, pola MembersListPage */
  const membersQuery = useInfiniteQuery({
    queryKey: ["recap-members", recapKategori, recapGender],
    queryFn: ({ pageParam }) =>
      memberApi.listPaged({
        limit: PAGE_SIZE,
        offset: pageParam,
        kategori: recapKategori || undefined,
        jenis_kelamin: recapGender || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.offset + lastPage.limit : undefined,
    staleTime: 5 * 60_000,
  });

  const allMembers = useMemo(
    () => membersQuery.data?.pages.flatMap((p) => p.items) ?? [],
    [membersQuery.data],
  );
  const totalMembers = membersQuery.data?.pages[0]?.total ?? 0;

  const recapMatrix: RecapMatrix | null = useMemo(() => {
    const m = meetingsQuery.data;
    if (!m || !membersQuery.data) return null;
    return buildRecapMatrix(allMembers, m.meetings, m.attendanceByMeeting);
  }, [meetingsQuery.data, membersQuery.data, allMembers]);

  const tableVisible =
    recapMatrix !== null && recapMatrix.meetings.length > 0;

  /* Auto-fetch halaman berikut saat scroll mendekati bawah */
  const maybeFetchNext = useCallback(() => {
    if (!membersQuery.hasNextPage || membersQuery.isFetchingNextPage) return;
    if (!tableVisible) return;
    const distance =
      document.documentElement.scrollHeight -
      (window.innerHeight + window.scrollY);
    if (distance > FETCH_THRESHOLD_PX) return;
    membersQuery.fetchNextPage();
  }, [
    membersQuery.hasNextPage,
    membersQuery.isFetchingNextPage,
    membersQuery.fetchNextPage,
    tableVisible,
  ]);

  useEffect(() => {
    window.addEventListener("scroll", maybeFetchNext, { passive: true });
    return () => window.removeEventListener("scroll", maybeFetchNext);
  }, [maybeFetchNext]);

  /* Export selalu data penuh, bukan cuma halaman yang termuat */
  async function exportFull(kind: "pdf" | "excel") {
    const m = meetingsQuery.data;
    if (!m || m.meetings.length === 0) return;
    setExporting(kind);
    try {
      const members = await memberApi.list({
        kategori: recapKategori || undefined,
        jenis_kelamin: recapGender || undefined,
      });
      const full = buildRecapMatrix(members, m.meetings, m.attendanceByMeeting);
      const label = recapKategori || "semua";
      if (kind === "pdf") await exportRecapPDF(full, recapMonth, label);
      else await exportRecapExcel(full, recapMonth, label);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal export rekap",
        "error",
      );
    } finally {
      setExporting(null);
    }
  }

  function retryAll() {
    meetingsQuery.refetch();
    membersQuery.refetch();
  }

  const isLoadingInitial =
    meetingsQuery.isLoading ||
    (membersQuery.isLoading && allMembers.length === 0);
  const loadError =
    meetingsQuery.error ??
    (allMembers.length === 0 ? membersQuery.error : null);

  const prevMonth = useCallback(() => {
    const [y, m] = recapMonth.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 2, 1));
    setRecapMonth(d.toISOString().slice(0, 7));
  }, [recapMonth]);

  const nextMonth = useCallback(() => {
    const [y, m] = recapMonth.split("-").map(Number);
    const d = new Date(Date.UTC(y, m, 1));
    const max = getTodayIso().slice(0, 7);
    if (d.toISOString().slice(0, 7) <= max) {
      setRecapMonth(d.toISOString().slice(0, 7));
    }
  }, [recapMonth]);

  const currentMonthLabel = useMemo(() => {
    const [y, m] = recapMonth.split("-").map(Number);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
    }).format(new Date(Date.UTC(y, m - 1, 1)));
  }, [recapMonth]);

  const hasData =
    recapMatrix !== null &&
    recapMatrix.meetings.length > 0 &&
    recapMatrix.rows.length > 0;

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Rekap Kehadiran"
        subtitle="Ringkasan absensi bulanan per jamaah"
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/absensi", { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Filter bulan — pola segmented seperti filter gender di Jadwal/Absensi */}
        <section>
          <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
            <button
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="w-12 min-h-[40px] flex items-center justify-center text-surface-muted transition-colors hover:bg-surface-card hover:text-accent active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-px bg-surface-border" />
            <div className="flex-1 min-h-[40px] flex items-center justify-center text-ios-footnote font-medium text-surface-text tabular-nums">
              {currentMonthLabel}
            </div>
            <div className="w-px bg-surface-border" />
            <button
              onClick={nextMonth}
              disabled={recapMonth >= getTodayIso().slice(0, 7)}
              aria-label="Bulan berikutnya"
              className="w-12 min-h-[40px] flex items-center justify-center text-surface-muted transition-colors hover:bg-surface-card hover:text-accent active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        {/* Filter kategori — pola chip seperti halaman Jadwal/Absensi */}
        <section>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            <FilterChip
              active={recapKategori === ""}
              label="Semua"
              onClick={() => setRecapKategori("")}
            />
            {MEMBER_CATEGORIES.map((c: MemberCategory) => (
              <FilterChip
                key={c}
                active={recapKategori === c}
                label={CATEGORY_LABEL[c]}
                onClick={() => setRecapKategori(c)}
              />
            ))}
          </div>
        </section>
        {/* Filter gender — pola segmented seperti halaman Absensi */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted mb-2 px-1">
            Gender
          </p>
          <GenderSegmented value={recapGender} onChange={setRecapGender} />
        </section>

        {/* Content */}
        {isLoadingInitial ? (
          <RecapTableSkeleton rows={8} />
        ) : loadError ? (
          <EmptyState
            icon={<X size={26} className="text-danger" />}
            title="Gagal memuat rekap"
            description={
              loadError instanceof ApiError
                ? loadError.message
                : "Gagal memuat rekap bulanan"
            }
            action={
              <Button onClick={retryAll} leftIcon={<Calendar size={14} />}>
                Coba Lagi
              </Button>
            }
          />
        ) : recapMatrix === null ? (
          <RecapTableSkeleton rows={8} />
        ) : recapMatrix.meetings.length === 0 ? (
          <EmptyState
            icon={<Calendar size={26} className="text-warning" />}
            title="Tidak ada jadwal"
            description="Tidak ada jadwal pengajian pada bulan ini."
          />
        ) : recapMatrix.rows.length === 0 ? (
          <EmptyState
            title="Tidak ada jamaah"
            description="Tidak ada jamaah pada kategori dan gender yang dipilih."
          />
        ) : (
          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {/* Toolbar tabel: ringkasan + export */}
            <div className="flex items-center justify-between gap-2 pl-3 pr-2 py-1.5 border-b border-surface-border">
              <p className="text-ios-caption text-surface-muted tabular-nums truncate">
                {recapMatrix.rows.length} jamaah · {recapMatrix.meetings.length}{" "}
                pertemuan
              </p>
              {hasData && !isReadonly && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => exportFull("pdf")}
                    disabled={exporting !== null}
                    aria-label="Export PDF"
                    title="Export PDF"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-all hover:bg-surface-card2 hover:text-surface-text active:scale-95 disabled:opacity-40"
                  >
                    {exporting === "pdf" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileText size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => exportFull("excel")}
                    disabled={exporting !== null}
                    aria-label="Export Excel"
                    title="Export Excel"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-all hover:bg-surface-card2 hover:text-surface-text active:scale-95 disabled:opacity-40"
                  >
                    {exporting === "excel" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-ios-caption border-separate border-spacing-0">
                <thead>
                  <tr className="bg-surface-card2">
                    <th className="sticky left-0 z-20 bg-surface-card2 px-1 py-2 font-semibold text-surface-text text-center w-8 min-w-8 max-w-8 overflow-hidden whitespace-nowrap border-b border-surface-border">
                      No
                    </th>
                    <th className="sticky left-8 z-20 bg-surface-card2 px-2 py-2 font-semibold text-surface-text text-left min-w-[88px] border-b border-surface-border shadow-[1px_0_0_rgb(var(--c-border))]">
                      Nama
                    </th>
                    {recapMatrix.meetings.map((m: Meeting) => (
                      <th
                        key={m.meeting_id}
                        className="px-2 py-2 font-semibold text-surface-text text-center min-w-[56px] whitespace-nowrap border-b border-surface-border"
                        title={`${formatDateLongText(m.tanggal)} - ${m.acara || "Pengajian"}`}
                      >
                        <div className="text-[11px] tabular-nums">
                          {formatDayMonth(m.tanggal)}
                        </div>
                        <div className="text-[9px] font-normal text-surface-muted truncate max-w-[64px] mx-auto">
                          {m.acara || "Pengajian"}
                        </div>
                      </th>
                    ))}
                    <th className="px-2 py-2 font-semibold text-surface-text text-center w-12 border-b border-surface-border">
                      Hadir
                    </th>
                    <th className="px-2 py-2 font-semibold text-surface-text text-center w-16 border-b border-surface-border">
                      Tdk Hadir
                    </th>
                    <th className="sticky right-0 z-20 bg-surface-card2 px-2 py-2 font-semibold text-surface-text text-center w-12 border-b border-surface-border shadow-[-1px_0_0_rgb(var(--c-border))]">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recapMatrix.rows.map((row, idx) => {
                    const rateColor =
                      row.rate >= 80
                        ? "text-emerald-600"
                        : row.rate >= 60
                          ? "text-amber-600"
                          : row.rate >= 40
                            ? "text-orange-600"
                            : "text-red-600";
                    const rateBg =
                      row.rate >= 80
                        ? "bg-emerald-50"
                        : row.rate >= 60
                          ? "bg-amber-50"
                          : row.rate >= 40
                            ? "bg-orange-50"
                            : "bg-red-50";
                    return (
                      <tr
                        key={row.member.member_id}
                        className="hover:bg-surface-card2/50"
                      >
                        <td className="sticky left-0 z-10 bg-surface-card px-1 py-1.5 text-center text-surface-muted tabular-nums w-8 min-w-8 max-w-8 overflow-hidden whitespace-nowrap border-b border-surface-border">
                          {idx + 1}
                        </td>
                        <td className="sticky left-8 z-10 bg-surface-card px-2 py-1.5 font-medium text-surface-text border-b border-surface-border shadow-[1px_0_0_rgb(var(--c-border))]">
                          <span className="block truncate max-w-[88px]">
                            {row.member.nama_lengkap}
                          </span>
                        </td>
                        {recapMatrix.meetings.map((m: Meeting) => {
                          const status = row.cells[m.meeting_id];
                          const initial = status
                            ? { HADIR: "H", IZIN: "I", SAKIT: "S", ALPA: "A" }[
                                status
                              ]
                            : "-";
                          const statusColor =
                            status === "HADIR"
                              ? "text-emerald-600"
                              : status === "IZIN"
                                ? "text-amber-600"
                                : status === "SAKIT"
                                  ? "text-blue-600"
                                  : status === "ALPA"
                                    ? "text-red-600"
                                    : "text-surface-muted";
                          return (
                            <td
                              key={m.meeting_id}
                              className={`px-2 py-1.5 text-center font-semibold tabular-nums border-b border-surface-border ${statusColor}`}
                            >
                              {initial}
                            </td>
                          );
                        })}
                        <td className="px-2 py-1.5 text-center font-semibold text-emerald-600 tabular-nums border-b border-surface-border">
                          {row.hadir}
                        </td>
                        <td className="px-2 py-1.5 text-center font-semibold text-red-600 tabular-nums border-b border-surface-border">
                          {row.nonHadir}
                        </td>
                        <td
                          className={`sticky right-0 z-10 px-2 py-1.5 text-center font-bold tabular-nums border-b border-surface-border shadow-[-1px_0_0_rgb(var(--c-border))] ${rateColor} ${rateBg}`}
                        >
                          {row.rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginasi — pola MembersListPage: auto saat scroll + tombol */}
        {tableVisible && membersQuery.hasNextPage && (
          <div className="flex justify-center pt-1">
            <button
              onClick={() => membersQuery.fetchNextPage()}
              disabled={membersQuery.isFetchingNextPage}
              className="min-h-[40px] px-5 rounded-xl bg-accent text-white text-ios-subhead font-medium transition-all hover:bg-accent-dark active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {membersQuery.isFetchingNextPage ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Memuat...
                </>
              ) : (
                `Muat lebih banyak (${allMembers.length}/${totalMembers})`
              )}
            </button>
          </div>
        )}

        {tableVisible &&
          !membersQuery.hasNextPage &&
          allMembers.length > 0 && (
            <p className="text-center text-ios-footnote text-surface-muted pt-1">
              Semua jamaah sudah ditampilkan ({allMembers.length})
            </p>
          )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Gender Segmented                              */
/* -------------------------------------------------------------------------- */

function GenderSegmented({
  value,
  onChange,
}: {
  value: "" | "L" | "P";
  onChange: (v: "" | "L" | "P") => void;
}) {
  const options: { value: "" | "L" | "P"; label: string }[] = [
    { value: "", label: "Semua" },
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  return (
    <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
      {options.map((opt, idx) => {
        const active = value === opt.value;
        return (
          <div key={opt.value} className="flex-1 flex">
            {idx > 0 && <div className="w-px bg-surface-border" />}
            <button
              onClick={() => onChange(opt.value)}
              className={`flex-1 min-h-[36px] flex items-center justify-center text-ios-footnote font-medium transition-all duration-200 active:scale-[0.98] ${
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
  );
}

/* -------------------------------------------------------------------------- */
/*                              Filter Chip                                   */
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
