import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Member, Meeting, AttendanceRecord } from "../../../types";
import { formatDayMonth } from "../../../utils/format";
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
  attendanceByMeeting: Map<string, AttendanceRecord[]>,
): RecapMatrix {
  const rows: RecapMatrixRow[] = members.map((member) => {
    const cells: Record<string, "HADIR" | "IZIN" | "SAKIT" | "ALPA" | null> =
      {};
    let hadir = 0;
    let nonHadir = 0;
    meetings.forEach((meeting) => {
      const records = attendanceByMeeting.get(meeting.meeting_id) ?? [];
      const record = records.find((r) => r.member_id === member.member_id);
      const status = record?.status ?? null;
      cells[meeting.meeting_id] = status as
        | "HADIR"
        | "IZIN"
        | "SAKIT"
        | "ALPA"
        | null;
      if (status === "HADIR") hadir++;
      else if (status !== null) nonHadir++;
    });
    const totalRecorded = hadir + nonHadir;
    const rate =
      totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;
    return { member, cells, hadir, nonHadir, rate };
  });
  rows.sort((a, b) => b.rate - a.rate);
  return { rows, meetings };
}
/* ---------------- Color palette (shared PDF + Excel) ---------------- */
const HEADER_BG_RGB: [number, number, number] = [51, 65, 85]; // slate-700
const BORDER_RGB: [number, number, number] = [203, 213, 225]; // slate-300
const TEXT_DEFAULT_RGB: [number, number, number] = [15, 23, 42]; // slate-900
const RATE_COLORS: Array<{
  min: number;
  bg: [number, number, number];
  text: [number, number, number];
}> = [
  { min: 80, bg: [220, 252, 231], text: [22, 101, 52] }, // emerald-100 / emerald-800
  { min: 60, bg: [254, 249, 195], text: [133, 77, 14] }, // yellow-100 / amber-800
  { min: 40, bg: [255, 237, 213], text: [154, 52, 18] }, // orange-100 / orange-800
  { min: 0, bg: [254, 226, 226], text: [153, 27, 27] }, // red-100 / red-800
];
const STATUS_COLORS: Record<string, { text: [number, number, number] }> = {
  HADIR: { text: [4, 120, 87] }, // emerald-700
  IZIN: { text: [180, 83, 9] }, // amber-700
  SAKIT: { text: [29, 78, 216] }, // blue-700
  ALPA: { text: [185, 28, 28] }, // red-700
};
function getRateColor(rate: number) {
  return (
    RATE_COLORS.find((c) => rate >= c.min) ??
    RATE_COLORS[RATE_COLORS.length - 1]
  );
}
function rgbToHex(rgb: [number, number, number]): string {
  return rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}
function rgbToArgb(rgb: [number, number, number]): string {
  return "FF" + rgbToHex(rgb).toUpperCase();
}
/* ---------------- PDF ---------------- */
export const PDF_PAGE_MM = {
  portrait: { w: 210, h: 297 },
  landscape: { w: 297, h: 210 },
} as const;
export const PDF_TABLE_START_Y = 38;
export const PDF_TABLE_MARGIN_X = 14;
export const PDF_CELL_PADDING = 1.5;
const PDF_MARGIN_BOTTOM = 37;
const PT_TO_MM = 0.3528;
const JSPDF_LINE_HEIGHT = 1.15;
export function rowsPerSheet(
  orientation: "portrait" | "landscape",
  fontSize: number,
): number {
  const pageH = PDF_PAGE_MM[orientation].h;
  const rowH = fontSize * PT_TO_MM * JSPDF_LINE_HEIGHT + 2 * PDF_CELL_PADDING;
  return Math.max(
    1,
    Math.floor((pageH - PDF_TABLE_START_Y - PDF_MARGIN_BOTTOM) / rowH + 1e-9),
  );
}
export async function exportRecapPDF(
  matrix: RecapMatrix,
  monthLabel: string,
  kategoriLabel: string,
  fontSize = 7,
  orientation: "portrait" | "landscape" = "portrait",
) {
  const doc = new jsPDF({ orientation });
  doc.setFontSize(14);
  doc.text("Rekap Kehadiran Bulanan", 14, 18);
  doc.setFontSize(10);
  doc.text(`Bulan: ${monthLabel}  |  Kategori: ${kategoriLabel}`, 14, 26);
  doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 32);
  const meetingHeaders = matrix.meetings.map(
    (m) => `${formatDayMonth(m.tanggal)}\n${m.acara || "Pengajian"}`,
  );
  const headers = [
    "No",
    "Nama",
    ...meetingHeaders,
    "Hadir",
    "Tidak Hadir",
    "%",
  ];
  const body = matrix.rows.map((row, idx) => [
    String(idx + 1),
    row.member.nama_lengkap,
    ...matrix.meetings.map(
      (m) => STATUS_INITIAL[row.cells[m.meeting_id] ?? ""] ?? "-",
    ),
    String(row.hadir),
    String(row.nonHadir),
    `${row.rate}%`,
  ]);
  autoTable(doc, {
    startY: PDF_TABLE_START_Y,
    head: [headers],
    body,
    styles: { fontSize, cellPadding: PDF_CELL_PADDING },
    headStyles: {
      fillColor: HEADER_BG_RGB,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      textColor: TEXT_DEFAULT_RGB,
      valign: "middle",
      lineColor: BORDER_RGB,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 35, halign: "left" },
    },
    didParseCell: (hook: any) => {
      if (hook.section === "body") {
        const colCount = headers.length;
        const rowIdx = hook.row.index;
        const colIdx = hook.column.index;
        if (colIdx === 1) hook.cell.styles.halign = "left";
        if (colIdx >= 2 && colIdx < colCount - 3) {
          const initial = hook.cell.raw as string;
          const statusMap: Record<string, string> = {
            H: "HADIR",
            I: "IZIN",
            S: "SAKIT",
            A: "ALPA",
          };
          const status = statusMap[initial];
          if (status) {
            hook.cell.styles.textColor = STATUS_COLORS[status].text;
            hook.cell.styles.fontStyle = "bold";
          }
        }
        if (colIdx === colCount - 1) {
          const rate = matrix.rows[rowIdx].rate;
          const color = getRateColor(rate);
          hook.cell.styles.fillColor = color.bg;
          hook.cell.styles.textColor = color.text;
          hook.cell.styles.fontStyle = "bold";
        }
        if (colIdx === colCount - 3) {
          hook.cell.styles.textColor = [4, 120, 87];
          hook.cell.styles.fontStyle = "bold";
        }
        if (colIdx === colCount - 2) {
          hook.cell.styles.textColor = [185, 28, 28];
          hook.cell.styles.fontStyle = "bold";
        }
      }
    },
  });
  doc.save(`rekap-absensi-${monthLabel}-${kategoriLabel}.pdf`);
}
/* ---------------- Excel ---------------- */
const EXCEL_BORDER = {
  top: { style: "thin" as const, color: { argb: rgbToArgb(BORDER_RGB) } },
  left: { style: "thin" as const, color: { argb: rgbToArgb(BORDER_RGB) } },
  bottom: { style: "thin" as const, color: { argb: rgbToArgb(BORDER_RGB) } },
  right: { style: "thin" as const, color: { argb: rgbToArgb(BORDER_RGB) } },
};
export async function exportRecapExcel(
  matrix: RecapMatrix,
  monthLabel: string,
  kategoriLabel: string,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SabilKas";
  wb.created = new Date();
  const ws = wb.addWorksheet("Rekap Absensi", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  });
  /* --- Title block --- */
  const totalCols = 2 + matrix.meetings.length + 3;
  const titleRow = ws.addRow(["Rekap Kehadiran Bulanan"]);
  titleRow.font = {
    bold: true,
    size: 14,
    color: { argb: rgbToArgb(TEXT_DEFAULT_RGB) },
  };
  titleRow.height = 22;
  ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
  const subtitleRow = ws.addRow([
    `Bulan: ${monthLabel}  |  Kategori: ${kategoriLabel}`,
  ]);
  subtitleRow.font = { size: 10, color: { argb: "FF475569" } };
  ws.mergeCells(subtitleRow.number, 1, subtitleRow.number, totalCols);
  const printedRow = ws.addRow([
    `Dicetak: ${new Date().toLocaleString("id-ID")}`,
  ]);
  printedRow.font = { size: 9, color: { argb: "FF64748B" } };
  ws.mergeCells(printedRow.number, 1, printedRow.number, totalCols);
  ws.addRow([]); // spacer
  /* --- Header row --- */
  const meetingHeaders = matrix.meetings.map(
    (m) => `${formatDayMonth(m.tanggal)}\n${m.acara || "Pengajian"}`,
  );
  const headerValues = ["No", "Nama", ...meetingHeaders, "Hadir", "Tdk", "%"];
  const headerRow = ws.addRow(headerValues);
  headerRow.height = 32;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: rgbToArgb(HEADER_BG_RGB) },
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = EXCEL_BORDER;
  });
  /* --- Body rows --- */
  matrix.rows.forEach((row, idx) => {
    const values = [
      idx + 1,
      row.member.nama_lengkap,
      ...matrix.meetings.map(
        (m) => STATUS_INITIAL[row.cells[m.meeting_id] ?? ""] ?? "-",
      ),
      row.hadir,
      row.nonHadir,
      row.rate / 100,
    ];
    const dataRow = ws.addRow(values);
    dataRow.height = 18;
    const noCell = dataRow.getCell(1);
    noCell.alignment = { horizontal: "center", vertical: "middle" };
    noCell.font = { size: 10, color: { argb: "FF64748B" } };
    const nameCell = dataRow.getCell(2);
    nameCell.alignment = { horizontal: "left", vertical: "middle" };
    nameCell.font = {
      size: 10,
      bold: false,
      color: { argb: rgbToArgb(TEXT_DEFAULT_RGB) },
    };
    matrix.meetings.forEach((m, mi) => {
      const cell = dataRow.getCell(3 + mi);
      const status = row.cells[m.meeting_id];
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.font = {
        size: 10,
        bold: !!status,
        color: {
          argb: status ? rgbToArgb(STATUS_COLORS[status].text) : "FF94A3B8",
        },
      };
    });
    const hadirCell = dataRow.getCell(3 + matrix.meetings.length);
    hadirCell.alignment = { horizontal: "center", vertical: "middle" };
    hadirCell.font = { size: 10, bold: true, color: { argb: "FF047857" } };
    const tdkCell = dataRow.getCell(4 + matrix.meetings.length);
    tdkCell.alignment = { horizontal: "center", vertical: "middle" };
    tdkCell.font = { size: 10, bold: true, color: { argb: "FFB91C1C" } };
    const rateCell = dataRow.getCell(5 + matrix.meetings.length);
    const rateColor = getRateColor(row.rate);
    rateCell.alignment = { horizontal: "center", vertical: "middle" };
    rateCell.font = {
      size: 10,
      bold: true,
      color: { argb: rgbToArgb(rateColor.text) },
    };
    rateCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: rgbToArgb(rateColor.bg) },
    };
    rateCell.numFmt = "0%";
    dataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = EXCEL_BORDER;
    });
  });
  /* --- Column widths --- */
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 22;
  matrix.meetings.forEach((_, i) => {
    ws.getColumn(3 + i).width = 9;
  });
  ws.getColumn(3 + matrix.meetings.length).width = 7;
  ws.getColumn(4 + matrix.meetings.length).width = 6;
  ws.getColumn(5 + matrix.meetings.length).width = 7;
  /* --- Download --- */
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rekap-absensi-${monthLabel}-${kategoriLabel}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
