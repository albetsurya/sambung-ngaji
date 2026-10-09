import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  X,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, EmptyState } from "../components/ui";
import { RecapTableSkeleton } from "../components/ui/Skeleton";
import { meetingApi, attendanceApi } from "../services/domainApi";
import { memberApi } from "../features/member/api/memberApi";
import type { AttendanceRecord, Meeting, MemberCategory } from "../types";
import { CATEGORY_LABEL, formatDayMonth } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  buildRecapMatrix,
  exportRecapPDF,
  exportRecapExcel,
  rowsPerSheet,
  PDF_PAGE_MM,
  type RecapMatrixRow,
} from "../features/presensi/lib/monthlyAttendanceExport";

export default function RecapPrintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = usePermission();
  const isReadonly = role === "PENGAWAS";
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<null | "pdf" | "excel">(null);
  const [fontSize, setFontSize] = useState<"7" | "9" | "11">("7");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [sheetIdx, setSheetIdx] = useState(0);
  const [zoom, setZoom] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 768px)").matches
      ? 1
      : 0.5,
  );

  const sheetRef = useRef<HTMLDivElement>(null);
  const [baseSize, setBaseSize] = useState({ w: 794, h: 1123 });

  const bulan = searchParams.get("bulan") || "";
  const kategoriParam = searchParams.get("kategori") || "";
  const genderParam = searchParams.get("gender") || "";
  const kategori = (MEMBER_CATEGORIES as readonly string[]).includes(
    kategoriParam,
  )
    ? (kategoriParam as MemberCategory)
    : "";
  const gender = genderParam === "L" || genderParam === "P" ? genderParam : "";

  const monthLabel = useMemo(() => {
    const m = bulan.match(/^(\d{4})-(\d{2})$/);
    if (!m) return bulan || "-";
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
    }).format(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)));
  }, [bulan]);

  const dataQuery = useQuery({
    queryKey: ["recap-print", bulan, kategori, gender],
    queryFn: async () => {
      const from = `${bulan}-01`;
      const to = new Date(
        Date.UTC(Number(bulan.slice(0, 4)), Number(bulan.slice(5, 7)), 0),
      )
        .toISOString()
        .slice(0, 10);
      const meetingsInMonth = await meetingApi.list({ from, to });
      const meetings = meetingsInMonth.filter((m) => m.status !== "LIBUR");
      const attendanceByMeeting = new Map<string, AttendanceRecord[]>();
      await Promise.all(
        meetings.map(async (meeting) => {
          const records = await attendanceApi.byMeeting(meeting.meeting_id);
          attendanceByMeeting.set(meeting.meeting_id, records);
        }),
      );
      const members = await memberApi.list({
        kategori: kategori || undefined,
        gender: gender || undefined,
      });
      return buildRecapMatrix(members, meetings, attendanceByMeeting);
    },
    enabled: /^\d{4}-\d{2}$/.test(bulan),
    staleTime: 2 * 60_000,
  });

  const matrix = dataQuery.data ?? null;

  const perSheet = rowsPerSheet(orientation, Number(fontSize));
  const sheetWidthMm = PDF_PAGE_MM[orientation].w;
  const sheets: RecapMatrixRow[][] = useMemo(() => {
    if (!matrix) return [];
    const out: RecapMatrixRow[][] = [];
    for (let i = 0; i < matrix.rows.length; i += perSheet) {
      out.push(matrix.rows.slice(i, i + perSheet));
    }
    return out;
  }, [matrix, perSheet]);

  const safeIdx = Math.min(sheetIdx, Math.max(sheets.length - 1, 0));
  const sheetRows = sheets[safeIdx] ?? [];

  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const update = () => {
      setBaseSize({ w: el.offsetWidth, h: el.offsetHeight });
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [safeIdx, fontSize, orientation, sheetRows.length]);

  async function handleExport(kind: "pdf" | "excel") {
    if (!matrix || exporting) return;
    setExporting(kind);
    try {
      const label = kategori || "semua";
      if (kind === "pdf")
        await exportRecapPDF(
          matrix,
          monthLabel,
          label,
          Number(fontSize),
          orientation,
        );
      else await exportRecapExcel(matrix, monthLabel, label);
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal export rekap",
        "error",
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Pratinjau Cetakan"
        subtitle={`Rekap ${monthLabel}`}
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate("/more/attendance-recap", { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-3 pb-8">
        {!isReadonly && (
          <section className="rounded-2xl border border-surface-border bg-surface-card p-3">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                size="sm"
                disabled={
                  exporting !== null || !matrix || matrix.rows.length === 0
                }
                onClick={() => handleExport("pdf")}
                leftIcon={
                  exporting === "pdf" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileText size={14} />
                  )
                }
              >
                {exporting === "pdf" ? "Membuat..." : "PDF"}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                size="sm"
                disabled={
                  exporting !== null || !matrix || matrix.rows.length === 0
                }
                onClick={() => handleExport("excel")}
                leftIcon={
                  exporting === "excel" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )
                }
              >
                {exporting === "excel" ? "Membuat..." : "Excel"}
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-surface-border bg-surface-card p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-1 px-0.5">
                Font
              </p>
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value as "7" | "9" | "11");
                  setSheetIdx(0);
                }}
                className="w-full px-3 py-2 text-ios-body border border-surface-border rounded-xl bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="7">Kecil</option>
                <option value="9">Sedang</option>
                <option value="11">Besar</option>
              </select>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted mb-1 px-0.5">
                Orientasi
              </p>
              <select
                value={orientation}
                onChange={(e) => {
                  setOrientation(e.target.value as "portrait" | "landscape");
                  setSheetIdx(0);
                }}
                className="w-full px-3 py-2 text-ios-body border border-surface-border rounded-xl bg-surface-card focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="portrait">Potret</option>
                <option value="landscape">Lanskap</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted px-0.5">
              Zoom
            </p>
            <div className="flex items-center gap-1 flex-1">
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                disabled={zoom <= 0.3}
                onClick={() =>
                  setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(2)))
                }
                aria-label="Perkecil"
                className="border border-surface-border bg-surface-card"
              >
                <span className="text-[14px] font-bold leading-none px-0.5">
                  −
                </span>
              </Button>
              <p className="text-ios-footnote font-medium text-surface-text tabular-nums w-11 text-center">
                {Math.round(zoom * 100)}%
              </p>
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                disabled={zoom >= 1.5}
                onClick={() =>
                  setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))
                }
                aria-label="Perbesar"
                className="border border-surface-border bg-surface-card"
              >
                <span className="text-[14px] font-bold leading-none px-0.5">
                  +
                </span>
              </Button>
            </div>
          </div>
        </section>

        {dataQuery.isLoading ? (
          <RecapTableSkeleton rows={8} />
        ) : dataQuery.error ? (
          <EmptyState
            icon={<X size={26} className="text-danger" />}
            title="Gagal memuat pratinjau"
            description={
              dataQuery.error instanceof ApiError
                ? dataQuery.error.message
                : "Gagal memuat data rekap"
            }
            action={
              <Button onClick={() => dataQuery.refetch()}>Coba Lagi</Button>
            }
          />
        ) : !matrix || matrix.meetings.length === 0 ? (
          <EmptyState
            icon={<Calendar size={26} className="text-warning" />}
            title="Tidak ada jadwal"
            description="Tidak ada jadwal pengajian pada bulan ini."
          />
        ) : matrix.rows.length === 0 ? (
          <EmptyState
            title="Tidak ada jamaah"
            description="Tidak ada jamaah pada kategori dan gender yang dipilih."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                disabled={safeIdx <= 0}
                onClick={() => setSheetIdx(safeIdx - 1)}
                aria-label="Lembar sebelumnya"
                className="border border-surface-border bg-surface-card"
              >
                <ChevronLeft size={16} />
              </Button>
              <p className="text-ios-footnote font-medium text-surface-text tabular-nums">
                Lembar {safeIdx + 1} dari {sheets.length}
              </p>
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                disabled={safeIdx >= sheets.length - 1}
                onClick={() => setSheetIdx(safeIdx + 1)}
                aria-label="Lembar berikutnya"
                className="border border-surface-border bg-surface-card"
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            {sheetRows.length > 0 && (
              <div className="overflow-auto rounded-xl border border-surface-border bg-slate-100 p-4">
                <div className="flex min-h-[70vh] min-w-max items-center justify-center">
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: baseSize.w * zoom,
                      height: baseSize.h * zoom,
                    }}
                  >
                    <section
                      key={safeIdx}
                      ref={sheetRef}
                      className="sheet-scale rounded-xl border border-slate-300 bg-white text-slate-900 overflow-hidden shadow-sm"
                      style={{
                        width: `${sheetWidthMm}mm`,
                        minWidth: `${sheetWidthMm}mm`,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                        fontFamily:
                          'Helvetica, "Helvetica Neue", Arial, ui-sans-serif, system-ui, sans-serif',
                      }}
                    >
                      <div className="px-3 pt-3 pb-2 border-b border-slate-300">
                        <h2 className="text-[15px] font-bold leading-tight">
                          Rekap Kehadiran Bulanan
                        </h2>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Bulan: {monthLabel} | Kategori: {kategori || "semua"}
                        </p>
                        <p className="text-[10px] text-slate-600">
                          Dicetak: {new Date().toLocaleString("id-ID")} · Lembar{" "}
                          {safeIdx + 1} dari {sheets.length} ·{" "}
                          {orientation === "landscape" ? "Lanskap" : "Potret"}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full table-fixed text-left text-[10px] border-separate border-spacing-0">
                          <colgroup>
                            <col style={{ width: "8mm" }} />
                            <col style={{ width: "32mm" }} />
                          </colgroup>
                          <thead>
                            <tr className="bg-slate-700">
                              <th className="px-1 py-1.5 font-bold text-white text-center border-b border-slate-600">
                                No
                              </th>
                              <th className="px-2 py-1.5 font-bold text-white text-left border-b border-slate-600">
                                Nama
                              </th>
                              {matrix.meetings.map((m: Meeting) => (
                                <th
                                  key={m.meeting_id}
                                  className="px-1 py-1.5 font-bold text-white text-center border-b border-slate-600"
                                >
                                  <div className="tabular-nums">
                                    {formatDayMonth(m.date)}
                                  </div>
                                  <div className="font-normal text-slate-300 break-words">
                                    {m.event || "Pengajian"}
                                  </div>
                                </th>
                              ))}
                              <th className="px-1 py-1.5 font-bold text-white text-center w-10 border-b border-slate-600">
                                Hadir
                              </th>
                              <th className="px-1 py-1.5 font-bold text-white text-center w-14 border-b border-slate-600">
                                Tdk
                              </th>
                              <th className="px-1 py-1.5 font-bold text-white text-center w-10 border-b border-slate-600">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sheetRows.map((row, idx) => {
                              const no = safeIdx * perSheet + idx + 1;
                              const rateBg =
                                row.rate >= 80
                                  ? "bg-emerald-100"
                                  : row.rate >= 60
                                    ? "bg-yellow-100"
                                    : row.rate >= 40
                                      ? "bg-orange-100"
                                      : "bg-red-100";
                              const rateColor =
                                row.rate >= 80
                                  ? "text-emerald-800"
                                  : row.rate >= 60
                                    ? "text-amber-800"
                                    : row.rate >= 40
                                      ? "text-orange-800"
                                      : "text-red-800";
                              return (
                                <tr key={row.member.member_id}>
                                  <td className="px-1 py-1 text-center text-slate-500 tabular-nums border-b border-slate-100">
                                    {no}
                                  </td>
                                  <td className="px-2 py-1 font-medium border-b border-slate-100">
                                    <span className="block break-words">
                                      {row.member.full_name}
                                    </span>
                                  </td>
                                  {matrix.meetings.map((m: Meeting) => {
                                    const status = row.cells[m.meeting_id];
                                    const initial = status
                                      ? {
                                          HADIR: "H",
                                          IZIN: "I",
                                          SAKIT: "S",
                                          ALPA: "A",
                                        }[status]
                                      : "-";
                                    const statusColor =
                                      status === "HADIR"
                                        ? "text-emerald-700"
                                        : status === "IZIN"
                                          ? "text-amber-700"
                                          : status === "SAKIT"
                                            ? "text-blue-700"
                                            : status === "ALPA"
                                              ? "text-red-700"
                                              : "text-slate-400";
                                    return (
                                      <td
                                        key={m.meeting_id}
                                        className={`px-1 py-1 text-center font-semibold tabular-nums border-b border-slate-100 ${statusColor}`}
                                      >
                                        {initial}
                                      </td>
                                    );
                                  })}
                                  <td className="px-2 py-1 text-center font-semibold text-emerald-700 tabular-nums border-b border-slate-100">
                                    {row.hadir}
                                  </td>
                                  <td className="px-2 py-1 text-center font-semibold text-red-700 tabular-nums border-b border-slate-100">
                                    {row.nonHadir}
                                  </td>
                                  <td
                                    className={`px-2 py-1 text-center font-bold tabular-nums border-b border-slate-100 ${rateColor} ${rateBg}`}
                                  >
                                    {row.rate}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {matrix && matrix.rows.length > 0 && !isReadonly && (
          <p className="text-ios-caption text-surface-muted text-center">
            Hasil unduhan sama dengan lembar yang tampil.
          </p>
        )}
      </div>
    </AppLayout>
  );
}
