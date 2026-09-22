import * as XLSX from "xlsx";

interface MonthlyRecap {
  monthKey: string;
  total: number;
  hadir: number;
  ijin: number;
  sakit: number;
  alpa: number;
  rate: number;
}

export function downloadExcel(recap: MonthlyRecap[], memberName: string) {
  const data = recap.map((r) => ({
    Bulan: r.monthKey,
    Total: r.total,
    Hadir: r.hadir,
    Izin: r.ijin,
    Sakit: r.sakit,
    Alpa: r.alpa,
    Rate: `${r.rate}%`,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Hadir");

  XLSX.writeFile(wb, `rekap-${memberName}-${new Date().toISOString().slice(0, 7)}.xlsx`);
}
