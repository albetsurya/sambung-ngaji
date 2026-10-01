import * as XLSX from "xlsx";

export async function exportElementToExcel(
  root: HTMLElement,
  filename: string,
): Promise<void> {
  const wb = XLSX.utils.book_new();
  const tables = Array.from(root.querySelectorAll("table"));

  if (tables.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([[root.innerText || ""]]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  } else {
    tables.forEach((table, i) => {
      const ws = XLSX.utils.table_to_sheet(table, { raw: false });
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        tables.length === 1 ? "Sheet1" : `Tabel${i + 1}`,
      );
    });
  }

  const safeName = filename.replace(/[\\/:*?"<>|]/g, "_");
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}
