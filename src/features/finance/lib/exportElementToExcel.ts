import ExcelJS from "exceljs";
/* ---------------- Utilities ---------------- */
function rgbToArgb(rgb: string): string | undefined {
  if (!rgb) return undefined;
  if (rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return undefined;
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (m) {
    const [, r, g, b, a] = m;
    const alpha = a === undefined ? 255 : Math.round(Number(a) * 255);
    const hex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
    return `${hex(alpha)}${hex(Number(r))}${hex(Number(g))}${hex(Number(b))}`;
  }
  if (rgb.startsWith("#")) {
    const h = rgb.slice(1);
    if (h.length === 3)
      return (
        "FF" +
        h
          .split("")
          .map((c) => c + c)
          .join("")
          .toUpperCase()
      );
    if (h.length === 6) return "FF" + h.toUpperCase();
    if (h.length === 8) return h.toUpperCase();
  }
  return undefined;
}
function borderSide(
  cs: CSSStyleDeclaration,
  side: "Top" | "Right" | "Bottom" | "Left",
): ExcelJS.Border | undefined {
  const key = side.toLowerCase();
  const width = cs.getPropertyValue(`border-${key}-width`);
  const style = cs.getPropertyValue(`border-${key}-style`);
  const color = cs.getPropertyValue(`border-${key}-color`);
  if (!width || !style || style === "none" || parseFloat(width) === 0)
    return undefined;
  return {
    style: "thin",
    color: { argb: rgbToArgb(color) || "FF94A3B8" },
  };
}
function parseFontFamily(ff: string): string {
  const first = (ff || "").split(",")[0]?.replace(/['"]/g, "").trim() || "";
  const lower = first.toLowerCase();
  if (
    lower.includes("mono") ||
    lower.includes("courier") ||
    lower.includes("consolas")
  )
    return "Consolas";
  if (lower.includes("helvetica") || lower.includes("arial")) return "Arial";
  if (lower.includes("georgia")) return "Georgia";
  if (lower.includes("times")) return "Times New Roman";
  return "Calibri";
}
/* ---------------- Grid builder ---------------- */
type Grid = (HTMLTableCellElement | null)[][];
function buildGrid(table: HTMLTableElement): {
  grid: Grid;
  merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }>;
  totalRows: number;
  totalCols: number;
} {
  const rows = Array.from(table.rows);
  const grid: Grid = [];
  const merges: Array<{
    s: { r: number; c: number };
    e: { r: number; c: number };
  }> = [];
  rows.forEach((row, r) => {
    if (!grid[r]) grid[r] = [];
    let c = 0;
    Array.from(row.cells).forEach((cell) => {
      while (grid[r][c]) c++;
      const rowspan = cell.rowSpan || 1;
      const colspan = cell.colSpan || 1;
      for (let rr = 0; rr < rowspan; rr++) {
        if (!grid[r + rr]) grid[r + rr] = [];
        for (let cc = 0; cc < colspan; cc++) {
          grid[r + rr][c + cc] = rr === 0 && cc === 0 ? cell : null;
        }
      }
      if (rowspan > 1 || colspan > 1) {
        merges.push({
          s: { r: r + 1, c: c + 1 },
          e: { r: r + rowspan, c: c + colspan },
        });
      }
      c += colspan;
    });
  });
  const totalRows = grid.length;
  const totalCols = Math.max(1, ...grid.map((g) => g.length));
  return { grid, merges, totalRows, totalCols };
}
/* ---------------- Style applier ---------------- */
function applyCellStyle(ec: ExcelJS.Cell, dom: HTMLTableCellElement) {
  const cs = window.getComputedStyle(dom);
  /* Font */
  const weight = cs.fontWeight;
  const bold = weight === "bold" || parseInt(weight, 10) >= 600;
  const italic = cs.fontStyle === "italic";
  const sizePt = parseFloat(cs.fontSize) * 0.75; // px → pt
  const family = parseFontFamily(cs.fontFamily);
  ec.font = {
    name: family,
    size: sizePt || 10,
    bold,
    italic,
    color: { argb: rgbToArgb(cs.color) || "FF0F172A" },
  };
  /* Alignment */
  const alignH: ExcelJS.Alignment["horizontal"] =
    cs.textAlign === "center"
      ? "center"
      : cs.textAlign === "right" || cs.textAlign === "end"
        ? "right"
        : cs.textAlign === "justify"
          ? "justify"
          : "left";
  const alignV: ExcelJS.Alignment["vertical"] =
    cs.verticalAlign === "middle"
      ? "middle"
      : cs.verticalAlign === "bottom"
        ? "bottom"
        : "top";
  ec.alignment = {
    horizontal: alignH,
    vertical: alignV,
    wrapText: true,
  };
  /* Fill */
  const bg = rgbToArgb(cs.backgroundColor);
  if (bg && bg !== "FFFFFFFF" && bg !== "FF00000000") {
    ec.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bg },
    };
  }
  /* Border */
  const border: Partial<ExcelJS.Borders> = {};
  let hasBorder = false;
  (["top", "right", "bottom", "left"] as const).forEach((side) => {
    const cap = (side.charAt(0).toUpperCase() + side.slice(1)) as
      | "Top"
      | "Right"
      | "Bottom"
      | "Left";
    const b = borderSide(cs, cap);
    if (b) {
      border[side] = b;
      hasBorder = true;
    }
  });
  if (hasBorder) ec.border = border;
}
/* ---------------- Column widths ---------------- */
function computeColumnWidths(
  table: HTMLTableElement,
  grid: Grid,
  totalCols: number,
): number[] {
  const tableW = table.getBoundingClientRect().width || 800;
  const colEls = Array.from(
    table.querySelectorAll("colgroup > col"),
  ) as HTMLElement[];
  if (colEls.length >= totalCols) {
    return colEls.slice(0, totalCols).map((col) => {
      const cs = window.getComputedStyle(col);
      const w = parseFloat(cs.width);
      if (!isNaN(w) && w > 0) return Math.max(6, w / 7.5);
      return 10;
    });
  }
  const widthsPx = new Array(totalCols).fill(0);
  grid.forEach((row) => {
    row.forEach((cell, ci) => {
      if (cell && (cell.colSpan || 1) === 1) {
        const w = cell.getBoundingClientRect().width;
        if (w > widthsPx[ci]) widthsPx[ci] = w;
      }
    });
  });
  const measured = widthsPx.reduce((s, w) => s + w, 0);
  const unknown = widthsPx.filter((w) => w === 0).length;
  const fallback =
    unknown > 0 ? Math.max(30, (tableW - measured) / unknown) : 0;
  return widthsPx.map((w) => {
    const px = w > 0 ? w : fallback;
    return Math.max(6, px / 7.5);
  });
}
/* ---------------- Table → Sheet ---------------- */
function addTableToSheet(
  wb: ExcelJS.Workbook,
  table: HTMLTableElement,
  sheetName: string,
) {
  const ws = wb.addWorksheet(sheetName);
  ws.views = [{ showGridLines: false }];
  const { grid, merges, totalRows, totalCols } = buildGrid(table);
  for (let r = 0; r < totalRows; r++) {
    const excelRow = ws.getRow(r + 1);
    for (let c = 0; c < totalCols; c++) {
      const dom = grid[r][c];
      const ec = excelRow.getCell(c + 1);
      if (dom) {
        ec.value = dom.innerText.trim();
        applyCellStyle(ec, dom);
      }
    }
  }
  merges.forEach((m) => {
    try {
      ws.mergeCells(m.s.r, m.s.c, m.e.r, m.e.c);
    } catch {
      /* ignore overlapping merges */
    }
  });
  const widths = computeColumnWidths(table, grid, totalCols);
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
  Array.from(table.rows).forEach((row, r) => {
    const h = row.getBoundingClientRect().height;
    if (h > 0) ws.getRow(r + 1).height = Math.max(15, h * 0.75);
  });
}
/* ---------------- Public API ---------------- */
export async function exportElementToExcel(
  root: HTMLElement,
  filename: string,
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SabilKas";
  wb.created = new Date();
  const tables = Array.from(root.querySelectorAll("table"));
  if (tables.length === 0) {
    const ws = wb.addWorksheet("Sheet1");
    ws.views = [{ showGridLines: false }];
    (root.innerText || "")
      .split("\n")
      .forEach((line) => ws.addRow([line.trim()]));
  } else {
    tables.forEach((table, i) => {
      const name = tables.length === 1 ? "Sheet1" : `Tabel${i + 1}`;
      addTableToSheet(wb, table as HTMLTableElement, name);
    });
  }
  const safeName = filename.replace(/[\\/:*?"<>|]/g, "_");
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
