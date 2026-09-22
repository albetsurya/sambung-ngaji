import { jsPDF } from "jspdf";

interface MonthlyRecap {
  monthKey: string;
  total: number;
  hadir: number;
  ijin: number;
  sakit: number;
  alpa: number;
  rate: number;
}

export function downloadPDF(recap: MonthlyRecap[], memberName: string) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text("Laporan Rekap Kehadiran", 14, 18);
  doc.setFontSize(10);
  doc.text(`Member: ${memberName}`, 14, 26);

  const headers = ["Bulan", "Total", "Hadir", "Izin", "Sakit", "Alpa", "Rate"];
  const colWidths = [30, 18, 18, 18, 18, 18, 18];
  let y = 36;

  doc.setFontSize(9);
  headers.forEach((h, i) => {
    doc.text(h, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
  });

  y += 6;
  doc.setDrawColor(200);
  doc.line(14, y, pageW - 14, y);

  recap.forEach((r) => {
    y += 8;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const vals = [r.monthKey, String(r.total), String(r.hadir), String(r.ijin), String(r.sakit), String(r.alpa), `${r.rate}%`];
    vals.forEach((v, i) => {
      doc.text(v, 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
    });
  });

  doc.save(`rekap-${memberName}-${new Date().toISOString().slice(0, 7)}.pdf`);
}
