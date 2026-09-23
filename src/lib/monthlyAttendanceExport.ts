import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { Member } from "../types";
import type { Meeting } from "../types";
import type { AttendanceRecord } from "../types";
import { formatDayMonth } from "../utils/format";

export interface RecapMatrixRow {
  member: Member;
  cells: Record<string, "HADIR" | "IZIN" | "SAKIT" | "ALPA" | null>;
  hadir: number;
  nonHadir: number;
  rate: number;
}

export interface RecapMatrix {
  rows: RecapMatrixRow[];
  meetings: Meeting[];
}

const STATUS_INITIAL: Record<string, string> = {
  HADIR: "H",
  IZIN: "I",
  SAKIT: "S",
  ALPA: "A",
};

export function buildRecapMatrix(
  members: Member[],
  meetings: Meeting[],
  attendanceByMeeting: Map<string, AttendanceRecord[]>
): RecapMatrix {
  const rows: RecapMatrixRow[] = members.map((member) => {
    const cells: Record<string, "HADIR" | "IZIN" | "SAKIT" | "ALPA" | null> = {};
    let hadir = 0;
    let nonHadir = 0;

    meetings.forEach((meeting) => {
      const records = attendanceByMeeting.get(meeting.meeting_id) ?? [];
      const record = records.find((r) => r.member_id === member.member_id);
      const status = record?.status ?? null;
      cells[meeting.meeting_id] = status as "HADIR" | "IZIN" | "SAKIT" | "ALPA" | null;

      if (status === "HADIR") hadir++;
      else if (status !== null) nonHadir++;
    });

    const totalRecorded = hadir + nonHadir;
    const rate = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

    return { member, cells, hadir, nonHadir, rate };
  });

  rows.sort((a, b) => b.rate - a.rate);

  return { rows, meetings };
}

function getRateColor(rate: number): { bg: string; text: string } {
  if (rate >= 80) return { bg: "dcfce7", text: "166534" }; // hijau
  if (rate >= 60) return { bg: "fef9c3", text: "854d0e" }; // kuning
  if (rate >= 40) return { bg: "ffedd5", text: "9a3412" }; // oranye
  return { bg: "fee2e2", text: "991b1b" }; // merah
}

export async function exportRecapPDF(matrix: RecapMatrix, monthLabel: string, kategoriLabel: string) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.text("Rekap Kehadiran Bulanan", 14, 18);
  doc.setFontSize(10);
  doc.text(`Bulan: ${monthLabel}  |  Kategori: ${kategoriLabel}`, 14, 26);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 32);

  const meetingHeaders = matrix.meetings.map((m) => `${formatDayMonth(m.tanggal)}\n${m.acara || "Pengajian"}`);
  const headers = ["No", "Nama", ...meetingHeaders, "Hadir", "Tidak Hadir", "%"];

  const body = matrix.rows.map((row, idx) => [
    String(idx + 1),
    row.member.nama_lengkap,
    ...matrix.meetings.map((m) => STATUS_INITIAL[row.cells[m.meeting_id] ?? ""] ?? "-"),
    String(row.hadir),
    String(row.nonHadir),
    `${row.rate}%`,
  ]);

  (doc as any).autoTable({
    startY: 38,
    head: [headers],
    body,
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold", halign: "center" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 35 },
    },
    didParseCell: (hook: any) => {
      if (hook.section === "body" && hook.column.index >= headers.length - 1) {
        const rowIdx = hook.row.index;
        const rate = matrix.rows[rowIdx].rate;
        const color = getRateColor(rate);
        hook.cell.styles.fillColor = parseInt(color.bg, 16);
        hook.cell.styles.textColor = parseInt(color.text, 16);
        hook.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`rekap-absensi-${monthLabel}-${kategoriLabel}.pdf`);
}

export async function exportRecapExcel(matrix: RecapMatrix, monthLabel: string, kategoriLabel: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Rekap Absensi");

  const meetingHeaders = matrix.meetings.map((m) => `${formatDayMonth(m.tanggal)}\n${m.acara || "Pengajian"}`);
  const headerRow = ["No", "Nama", ...meetingHeaders, "Hadir", "Tidak Hadir", "%"];

  ws.addRow(headerRow);
  const headerRowObj = ws.getRow(1);
  headerRowObj.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRowObj.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A5F" } };
  headerRowObj.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  matrix.rows.forEach((row, idx) => {
    const dataRow = [
      idx + 1,
      row.member.nama_lengkap,
      ...matrix.meetings.map((m) => STATUS_INITIAL[row.cells[m.meeting_id] ?? ""] ?? "-"),
      row.hadir,
      row.nonHadir,
      `${row.rate}%`,
    ];
    const r = ws.addRow(dataRow);
    r.alignment = { horizontal: "center", vertical: "middle" };
    r.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

    const rateCell = r.getCell(headerRow.length);
    const color = getRateColor(row.rate);
    rateCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color.bg } };
    rateCell.font = { bold: true, color: { argb: color.text } };
    rateCell.alignment = { horizontal: "center", vertical: "middle" };
  });

  ws.columns = [
    { width: 5 },
    { width: 25 },
    ...matrix.meetings.map(() => ({ width: 8 })),
    { width: 8 },
    { width: 12 },
    { width: 8 },
  ];

  ws.views = [{ state: "frozen", ySplit: 1 }];

  await wb.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-absensi-${monthLabel}-${kategoriLabel}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  });
}