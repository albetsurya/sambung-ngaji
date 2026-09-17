/* ==========================================================================
   Rule-based parser — extract field meeting dari PDF daftar hadir/undangan.
   Tanpa AI. Output: { tanggal, hari, acara, tempat }.
   ========================================================================== */

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}

export interface ParsedMeetingDraft {
  tanggal: string;
  hari: string;
  acara: string;
  tempat: string;
  confidence: number; // 0-100
  warning?: string;
}

/* ============================== Normalization ============================== */

export function normalizeTextItems(rawItems: any[]): PdfTextItem[] {
  const out: PdfTextItem[] = [];
  for (const it of rawItems) {
    if (!it || typeof it.str !== "string") continue;
    if (!it.str.trim()) continue;
    const t = it.transform;
    if (!Array.isArray(t) || t.length < 6) continue;
    out.push({
      str: it.str,
      x: t[4],
      y: t[5],
      width: typeof it.width === "number" ? it.width : 0,
    });
  }
  return out;
}

/**
 * Group items jadi baris berdasarkan koordinat Y (toleransi 3px).
 * Return: array of baris, tiap baris berisi items yang sudah di-sort X.
 */
export function groupIntoLines(items: PdfTextItem[], tolerance = 3): string[] {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const groups: { y: number; items: PdfTextItem[] }[] = [];

  for (const item of sorted) {
    const last = groups[groups.length - 1];
    if (last && Math.abs(last.y - item.y) <= tolerance) {
      last.items.push(item);
    } else {
      groups.push({ y: item.y, items: [item] });
    }
  }

  return groups.map((g) =>
    g.items
      .sort((a, b) => a.x - b.x)
      .map((it) => it.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

/* ============================== Date Utils ============================== */

const HARI_LIST = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const BULAN_MAP: Record<string, string> = {
  januari: "01",
  februari: "02",
  maret: "03",
  april: "04",
  mei: "05",
  juni: "06",
  juli: "07",
  agustus: "08",
  september: "09",
  oktober: "10",
  november: "11",
  desember: "12",
};

function toIso(day: string, month: string, year: string): string {
  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");
  let y = year;
  if (y.length === 2) y = "20" + y;
  return `${y}-${m}-${d}`;
}

function getHariFromIso(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return HARI_LIST[d.getDay()] || "";
  } catch {
    return "";
  }
}

function extractTanggal(text: string): { iso: string; hari: string } {
  const result = { iso: "", hari: "" };

  // Prioritas 1: DD-MM-YYYY atau DD/MM/YYYY
  let m = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m) {
    result.iso = toIso(m[1], m[2], m[3]);
  }

  // Prioritas 2: DD NamaBulan YYYY
  if (!result.iso) {
    m = text.match(
      /(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/i,
    );
    if (m) {
      const mm = BULAN_MAP[m[2].toLowerCase()];
      if (mm) result.iso = toIso(m[1], mm, m[3]);
    }
  }

  // Extract nama hari kalau ada di text
  for (const h of HARI_LIST) {
    if (new RegExp("\\b" + h + "\\b", "i").test(text)) {
      result.hari = h;
      break;
    }
  }

  // Kalau tidak ketemu, derive dari tanggal
  if (!result.hari && result.iso) {
    result.hari = getHariFromIso(result.iso);
  }

  return result;
}

/* ============================== Header Extract ============================== */

function extractAcara(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 8 || trimmed.length > 120) continue;

    const upper = trimmed.toUpperCase();

    // Skip baris yang jelas bukan acara
    if (/^(DAFTAR|NO\b|NO\.|NAMA|JABATAN|ALAMAT|HADIR|TIDAK|TEMPAT|HARI\s*\/|HARI\s*:)/i.test(upper)) {
      continue;
    }
    // Skip kalau ada nomor + dash (kemungkinan baris peserta)
    if (/^\d+[\.\)]\s/.test(trimmed)) continue;

    // Acara biasanya uppercase + minimal 50% huruf kapital
    const letters = upper.replace(/[^A-Z]/g, "");
    const originalLetters = trimmed.replace(/[^A-Za-z]/g, "");
    if (originalLetters.length < 8) continue;
    const ratio = letters.length / originalLetters.length;
    if (ratio >= 0.7) {
      return trimmed;
    }
  }
  return "";
}

function extractTempat(lines: string[]): string {
  for (const line of lines) {
    const m = line.match(/TEMPAT\s*[:\-]\s*(.+)/i);
    if (m && m[1].trim()) {
      return m[1].trim();
    }
  }
  return "";
}

/* ============================== Main Parser ============================== */

export function parseMeetingFromPdf(rawItems: any[]): ParsedMeetingDraft {
  const items = normalizeTextItems(rawItems);
  const lines = groupIntoLines(items).filter((l) => l.length > 0);
  const fullText = lines.join("\n");

  const tgl = extractTanggal(fullText);
  const acara = extractAcara(lines);
  const tempat = extractTempat(lines);

  // Confidence
  let confidence = 0;
  if (tgl.iso) confidence += 40;
  if (acara) confidence += 35;
  if (tempat) confidence += 15;
  if (tgl.hari) confidence += 10;
  confidence = Math.min(100, confidence);

  const warnings: string[] = [];
  if (!tgl.iso) warnings.push("Tanggal tidak terdeteksi");
  if (!acara) warnings.push("Acara tidak terdeteksi");

  return {
    tanggal: tgl.iso,
    hari: tgl.hari,
    acara,
    tempat,
    confidence,
    warning: warnings.length > 0 ? warnings.join("; ") : undefined,
  };
}
