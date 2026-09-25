import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Download,
  FileText,
  Loader2,
  X,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, EmptyState, Segmented } from "../components/common";
import { RecapTableSkeleton } from "../components/common/Skeleton";
import { meetingApi, attendanceApi } from "../services/domainApi";
import { memberApi } from "../services/memberApi";
import type {
  AttendanceRecord,
  Meeting,
  MemberCategory,
} from "../types";
import { CATEGORY_LABEL, formatDayMonth } from "../utils/format";
import { MEMBER_CATEGORIES } from "../constants";
import { useToast } from "../contexts/ToastContext";
import { usePermission } from "../hooks/usePermission";
import { ApiError } from "../services/api";
import {
  buildRecapMatrix,
  exportRecapPDF,
  exportRecapExcel,
  type RecapMatrixRow,
} from "../lib/monthlyAttendanceExport";

/**
 * Halaman pratinjau cetakan rekap absensi.
 * Tabel di sini = isi file PDF/Excel yang akan diunduh
 * (kolom dan angka yang sama, dari data yang sama).
 * Deep-linkable: ?bulan=YYYY-MM&kategori=&gender=
 */
export default function RecapPrintPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role } = usePermission();
  const isReadonly = role === "PENGAWAS";
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<null | "pdf" | "excel">(null);
  const [fontSize, setFontSize] = useState<"7" | "9" | "11">("7");

  const bulan = searchParams.get("bulan") || "";
  const kategoriParam = searchParams.get("kategori") || "";
  const genderParam = searchParams.get("gender") || "";
  const kategori = (MEMBER_CATEGORIES as readonly string[]).includes(kategoriParam)
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
        jenis_kelamin: gender || undefined,
      });
      return buildRecapMatrix(members, meetings, attendanceByMeeting);
    },
    enabled: /^\d{4}-\d{2}$/.test(bulan),
    staleTime: 2 * 60_000,
  });

  const matrix = dataQuery.data ?? null;

  /* Lembaran ala PDF: baris dipecah per halaman mengikuti tata file
     PDF (A4 portrait), agar terlihat tiap lembar isi berapa baris.
     Angka baris = hasil ukur aktual file PDF per ukuran font.
     Kalau konfigurasi exportRecapPDF berubah, samakan angka ini. */
  const ROWS_PER_SHEET: Record<typeof fontSize, number> = {
    "7": 38,
    "9": 29,
    "11": 24,
  };
  const SHEET_ZOOM: Record<typeof fontSize, number> = {
    "7": 1,
    "9": 1.2,
    "11": 1.4,
  };
  const sheets: RecapMatrixRow[][] = useMemo(() => {
    if (!matrix) return [];
    const per = ROWS_PER_SHEET[fontSize];
    const out: RecapMatrixRow[][] = [];
    for (let i = 0; i < matrix.rows.length; i += per) {
      out.push(matrix.rows.slice(i, i + per));
    }
    return out;
  }, [matrix, fontSize]);

  async function handleExport(kind: "pdf" | "excel") {
    if (!matrix || exporting) return;
    setExporting(kind);
    try {
      const label = kategori || "semua";
      if (kind === "pdf") await exportRecapPDF(matrix, monthLabel, label, Number(fontSize));
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
          else navigate("/lainnya/rekap-absensi", { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        <section className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <p className="text-ios-footnote text-surface-muted leading-relaxed">
            Bulan <strong className="text-surface-text">{monthLabel}</strong>
            {" · "}Kategori{" "}
            <strong className="text-surface-text">
              {kategori ? CATEGORY_LABEL[kategori] : "Semua"}
            </strong>
            {" · "}
            {matrix
              ? `${matrix.rows.length} jamaah · ${matrix.meetings.length} pertemuan`
              : "memuat..."}
          </p>
          <p className="text-ios-caption text-surface-muted mt-1 leading-relaxed">
            Tiap lembar di bawah menggambarkan halaman file PDF yang akan
            diunduh — termasuk pembagian baris per lembar.
          </p>
        </section>

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted mb-2 px-1">
            Ukuran font cetakan
          </p>
          <Segmented
            ariaLabel="Ukuran font cetakan"
            size="sm"
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: "7", label: "Kecil" },
              { value: "9", label: "Sedang" },
              { value: "11", label: "Besar" },
            ]}
          />
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
            action={<Button onClick={() => dataQuery.refetch()}>Coba Lagi</Button>}
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
          <div className="space-y-4">
            {sheets.map((sheetRows, sheetIdx) => (
              <section
                key={sheetIdx}
                className="rounded-2xl border border-slate-200 bg-white text-slate-900 overflow-hidden"
              >
                <div className="px-4 pt-4 pb-3 border-b border-slate-200">
                  <h2 className="text-[16px] font-bold leading-tight">
                    Rekap Kehadiran Bulanan
                  </h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Bulan: {monthLabel} | Kategori: {kategori || "semua"}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Dicetak:{" "}
                    {new Date().toLocaleString("id-ID")} · Lembar{" "}
                    {sheetIdx + 1} dari {sheets.length}
                  </p>
                </div>
                <div
                  className="overflow-x-auto"
                  style={{ zoom: SHEET_ZOOM[fontSize] }}
                >
                  <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-slate-800">
                        <th className="px-1 py-2 font-bold text-white text-center w-8 border-b border-slate-700">
                          No
                        </th>
                        <th className="px-2 py-2 font-bold text-white text-left min-w-[88px] border-b border-slate-700">
                          Nama
                        </th>
                        {matrix.meetings.map((m: Meeting) => (
                          <th
                            key={m.meeting_id}
                            className="px-2 py-2 font-bold text-white text-center min-w-[56px] whitespace-nowrap border-b border-slate-700"
                          >
                            <div className="tabular-nums">
                              {formatDayMonth(m.tanggal)}
                            </div>
                            <div className="font-normal text-slate-300 truncate max-w-[64px] mx-auto">
                              {m.acara || "Pengajian"}
                            </div>
                          </th>
                        ))}
                        <th className="px-2 py-2 font-bold text-white text-center w-12 border-b border-slate-700">
                          Hadir
                        </th>
                        <th className="px-2 py-2 font-bold text-white text-center w-16 border-b border-slate-700">
                          Tdk Hadir
                        </th>
                        <th className="px-2 py-2 font-bold text-white text-center w-12 border-b border-slate-700">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheetRows.map((row, idx) => {
                        const no = sheetIdx * ROWS_PER_SHEET[fontSize] + idx + 1;
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
                            <td className="px-1 py-1.5 text-center text-slate-500 tabular-nums border-b border-slate-100">
                              {no}
                            </td>
                            <td className="px-2 py-1.5 font-medium border-b border-slate-100">
                              <span className="block truncate max-w-[88px]">
                                {row.member.nama_lengkap}
                              </span>
                            </td>
                            {matrix.meetings.map((m: Meeting) => {
                              const status = row.cells[m.meeting_id];
                              const initial = status
                                ? { HADIR: "H", IZIN: "I", SAKIT: "S", ALPA: "A" }[
                                    status
                                  ]
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
                                  className={`px-2 py-1.5 text-center font-semibold tabular-nums border-b border-slate-100 ${statusColor}`}
                                >
                                  {initial}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1.5 text-center font-semibold text-emerald-700 tabular-nums border-b border-slate-100">
                              {row.hadir}
                            </td>
                            <td className="px-2 py-1.5 text-center font-semibold text-red-700 tabular-nums border-b border-slate-100">
                              {row.nonHadir}
                            </td>
                            <td
                              className={`px-2 py-1.5 text-center font-bold tabular-nums border-b border-slate-100 ${rateColor} ${rateBg}`}
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
            ))}
          </div>
        )}

        {matrix && matrix.rows.length > 0 && !isReadonly && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              fullWidth
              disabled={exporting !== null}
              onClick={() => handleExport("pdf")}
              leftIcon={
                exporting === "pdf" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <FileText size={15} />
                )
              }
            >
              {exporting === "pdf" ? "Membuat..." : "Unduh PDF"}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              disabled={exporting !== null}
              onClick={() => handleExport("excel")}
              leftIcon={
                exporting === "excel" ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )
              }
            >
              {exporting === "excel" ? "Membuat..." : "Unduh Excel"}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
