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
import { Button, EmptyState } from "../components/common";
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

  async function handleExport(kind: "pdf" | "excel") {
    if (!matrix || exporting) return;
    setExporting(kind);
    try {
      const label = kategori || "semua";
      if (kind === "pdf") await exportRecapPDF(matrix, bulan, label);
      else await exportRecapExcel(matrix, bulan, label);
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
            Tabel di bawah sama dengan isi file yang akan diunduh.
          </p>
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
          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-ios-caption border-separate border-spacing-0">
                <thead>
                  <tr className="bg-surface-card2">
                    <th className="px-1 py-2 font-semibold text-surface-text text-center w-8 border-b border-surface-border">
                      No
                    </th>
                    <th className="px-2 py-2 font-semibold text-surface-text text-left min-w-[88px] border-b border-surface-border">
                      Nama
                    </th>
                    {matrix.meetings.map((m: Meeting) => (
                      <th
                        key={m.meeting_id}
                        className="px-2 py-2 font-semibold text-surface-text text-center min-w-[56px] whitespace-nowrap border-b border-surface-border"
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
                    <th className="px-2 py-2 font-semibold text-surface-text text-center w-12 border-b border-surface-border">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((row, idx) => {
                    const rateColor =
                      row.rate >= 80
                        ? "text-emerald-600"
                        : row.rate >= 60
                          ? "text-amber-600"
                          : row.rate >= 40
                            ? "text-orange-600"
                            : "text-red-600";
                    return (
                      <tr
                        key={row.member.member_id}
                        className="hover:bg-surface-card2/50"
                      >
                        <td className="px-1 py-1.5 text-center text-surface-muted tabular-nums border-b border-surface-border">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-1.5 font-medium text-surface-text border-b border-surface-border">
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
                          className={`px-2 py-1.5 text-center font-bold tabular-nums border-b border-surface-border ${rateColor}`}
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
