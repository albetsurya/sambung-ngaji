
export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
}

export interface ParsedMeetingDraft {
  id: string;
  acara: string;
  tanggal: string;
  tanggalSelesai?: string;
  hari: string;
  jam: string;
  catatan: string;
  genderTarget: "" | "L" | "P";
  kategoriTarget: string[];
  confidence: number;
  warning?: string;
}


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

const BULAN_ALT = Object.keys(BULAN_MAP).join("|");

function normalizeYear(y: string): string {
  if (y.length === 2) return "20" + y;
  return y;
}

function toIso(day: string, month: string, year: string): string {
  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");
  return `${normalizeYear(year)}-${m}-${d}`;
}

function getHariFromIso(iso: string): string {
  try {
    const d = new Date(iso + "T00:00:00");
    return HARI_LIST[d.getDay()] || "";
  } catch {
    return "";
  }
}

function extractTanggal(text: string): { iso: string; isoEnd: string; hari: string } {
  const result = { iso: "", isoEnd: "", hari: "" };

  let m = text.match(
    new RegExp(
      `(\\d{1,2})(?:\\s*[--]\\s*(\\d{1,2}))?\\s+(${BULAN_ALT})\\s+(\\d{2,4})`,
      "i",
    ),
  );
  if (m) {
    const mm = BULAN_MAP[m[3].toLowerCase()];
    if (mm) {
      result.iso = toIso(m[1], mm, m[4]);
      if (m[2]) {
        result.isoEnd = toIso(m[2], mm, m[4]);
      }
    }
  }

  if (!result.iso) {
    m = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
    if (m) {
      result.iso = toIso(m[1], m[2], m[3]);
    }
  }

  if (!result.iso) {
    m = text.match(
      new RegExp(
        `TGL\\s+(\\d{1,2})(?:\\s*[--]\\s*\\d{1,2})?\\s*\\/?\\s*[A-Z]*[-\\s]*(${BULAN_ALT})\\s+(\\d{4})`,
        "i",
      ),
    );
    if (m) {
      const mm = BULAN_MAP[m[2].toLowerCase()];
      if (mm) result.iso = toIso(m[1], mm, m[3]);
    }
  }

  for (const h of HARI_LIST) {
    if (new RegExp("\\b" + h + "\\b", "i").test(text)) {
      result.hari = h;
      break;
    }
  }

  if (!result.hari && /jum['']?at/i.test(text)) {
    result.hari = "Jumat";
  }

  if (!result.hari && result.iso) {
    result.hari = getHariFromIso(result.iso);
  }

  return result;
}


const FIELD_LABELS = [
  "Hari\\s*/\\s*Tanggal",
  "Hari\\s*/\\s*Tgl",
  "Tanggal",
  "Jam",
  "Tempat",
  "Peserta",
  "Materi",
  "Ket\\.?",
  "Keterangan",
  "Pakaian",
  "NB\\.?",
  "Catatan",
];

function extractAllFields(text: string): Record<string, string> {
  const labelPattern = FIELD_LABELS.join("|");
  const fieldRegex = new RegExp(
    `(?:^|[\\s\\-•\\n])(${labelPattern})\\s*[:\\-]\\s*`,
    "gi",
  );

  const matches: { label: string; start: number; valueStart: number }[] = [];
  let m;
  while ((m = fieldRegex.exec(text)) !== null) {
    matches.push({
      label: m[1].replace(/\s+/g, " ").toLowerCase().replace(/\.$/, ""),
      start: m.index,
      valueStart: fieldRegex.lastIndex,
    });
  }

  const result: Record<string, string> = {};
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const rawEnd = next ? next.start : text.length;
    let value = text.slice(cur.valueStart, rawEnd).trim();

    value = value.replace(/[\s\-•]+$/, "").trim();
    value = value.replace(/\s+/g, " ");

    if (!result[cur.label]) {
      result[cur.label] = value;
    }
  }
  return result;
}

function getField(fields: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (fields[k]) return fields[k];
  }
  return "";
}


function detectGenderFromTitle(text: string): "" | "L" | "P" {
  const upper = text.toUpperCase();

  if (
    /\b(IBU|IBU-IBU|IBU2|MUSLIMAH|PUTRI|AKHWAT|PEREMPUAN|WANITA|KEPUTRIAN)\b/.test(
      upper,
    )
  ) {
    return "P";
  }
  if (
    /\b(BAPAK|PUTRA|IKHWAN|PRIA|LAKI-LAKI|LAKI LAKI|MUBALIGH)\b/.test(upper)
  ) {
    return "L";
  }
  return "";
}

function detectKategoriFromTitle(text: string): string[] {
  const upper = text.toUpperCase();
  const found: string[] = [];

  const rules: { kategori: string; patterns: RegExp[] }[] = [
    { kategori: "BALITA", patterns: [/\bBALITA\b/, /\bPAUD\b/, /\bTK\b/] },
    { kategori: "CABERAWIT", patterns: [/\bCABERAWIT\b/, /\bSD\b/] },
    { kategori: "PRA_REMAJA", patterns: [/\bPRA[\s_-]?REMAJA\b/, /\bSMP\b/] },
    { kategori: "REMAJA", patterns: [/\bREMAJA\b/, /\bSMA\b/, /\bSMK\b/] },
    { kategori: "PRA_NIKAH", patterns: [/\bPRA[\s_-]?NIKAH\b/, /\bPNKB\b/] },
    { kategori: "DEWASA", patterns: [/\bDEWASA\b/] },
    { kategori: "ISTIMEWA", patterns: [/\bISTIMEWA\b/, /\bLANSIA\b/] },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((re) => re.test(upper))) {
      found.push(rule.kategori);
    }
  }
  return found;
}


interface RawSection {
  header: string;
  body: string[];
}

function splitSections(lines: string[]): RawSection[] {
  const sections: RawSection[] = [];
  let current: RawSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    const cleaned = trimmed.replace(/^[#\-\*•]+\s*/, "");

    const m = cleaned.match(/^(\d{1,2})[\.\)]\s+(.+)$/);
    if (m) {
      const title = m[2].trim();
      if (title.length >= 5 && /[A-Za-z]{3,}/.test(title)) {
        if (current) sections.push(current);
        current = { header: title, body: [] };
        continue;
      }
    }

    if (current) {
      current.body.push(trimmed);
    }
  }

  if (current) sections.push(current);
  return sections;
}


function parseSection(section: RawSection): ParsedMeetingDraft {
  const bodyText = section.body.join("\n");
  const fullText = section.header + "\n" + bodyText;

  const fields = extractAllFields(fullText);

  const acara = section.header.replace(/\s+/g, " ").trim();

  const hariTanggal = getField(
    fields,
    "hari / tanggal",
    "hari / tgl",
    "tanggal",
  );
  const tglSource = hariTanggal || fullText;
  const tgl = extractTanggal(tglSource);

  const jam = getField(fields, "jam");

  const tempat = getField(fields, "tempat");

  const peserta = getField(fields, "peserta");

  const catatanParts: string[] = [];
  if (tempat) catatanParts.push(`Tempat: ${tempat}`);
  if (peserta) catatanParts.push(`Peserta: ${peserta}`);
  const catatan = catatanParts.join("\n");

  let confidence = 0;
  if (tgl.iso) confidence += 40;
  if (acara && acara.length >= 5) confidence += 25;
  if (jam) confidence += 15;
  if (tempat) confidence += 10;
  if (peserta) confidence += 10;
  confidence = Math.min(100, confidence);

  const warnings: string[] = [];
  if (!tgl.iso) warnings.push("tanggal tidak terdeteksi");
  if (!jam) warnings.push("jam tidak terdeteksi");

  const tanggalSelesai =
    tgl.isoEnd && tgl.isoEnd !== tgl.iso ? tgl.isoEnd : undefined;

  return {
    id: cryptoId(),
    acara,
    tanggal: tgl.iso,
    tanggalSelesai,
    hari: tgl.hari,
    jam,
    catatan,
    genderTarget: detectGenderFromTitle(acara + " " + bodyText),
    kategoriTarget: detectKategoriFromTitle(acara + " " + bodyText),
    confidence,
    warning: warnings.length > 0 ? warnings.join("; ") : undefined,
  };
}

function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}


export function autoNumberText(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let sectionNum = 0;

  const dateLineRegex = new RegExp(
    `(?:${HARI_LIST.join("|")})?\\s*,?\\s*\\d{1,2}\\s+(?:${BULAN_ALT})\\s+\\d{4}|\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}`,
    "i",
  );

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const isDateLine = dateLineRegex.test(trimmed);
    const alreadyNumbered = /^\d{1,2}[\.\)]\s/.test(trimmed);

    if (isDateLine && !alreadyNumbered) {
      let headerIdx = -1;
      for (let j = out.length - 1; j >= 0; j--) {
        const prev = out[j].trim();
        if (!prev) continue;
        if (dateLineRegex.test(prev)) continue;
        if (/^\d{1,2}[\.\)]\s/.test(prev)) continue;
        headerIdx = j;
        break;
      }

      if (headerIdx >= 0) {
        sectionNum++;
        out[headerIdx] = `${sectionNum}. ${out[headerIdx].trim()}`;
      } else {
        sectionNum++;
        out.push(`${sectionNum}. ${trimmed}`);
        continue;
      }
    }

    out.push(line);
  }

  return out.join("\n");
}


function parseLines(lines: string[]): ParsedMeetingDraft[] {
  const cleaned = lines.map((l) => l.trim()).filter((l) => l.length > 0);

  const sections = splitSections(cleaned);
  const parsed = sections.map(parseSection);

  return parsed.filter((p) => p.acara && p.acara.length >= 3);
}

export function parseMeetingsFromPdf(rawItems: any[]): ParsedMeetingDraft[] {
  const items = normalizeTextItems(rawItems);
  const lines = groupIntoLines(items).filter((l) => l.length > 0);
  return parseLines(lines);
}

export function parseMeetingsFromText(text: string): ParsedMeetingDraft[] {
  return parseLines(text.split(/\r?\n/));
}
