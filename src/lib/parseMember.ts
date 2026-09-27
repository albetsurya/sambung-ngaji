
export interface ParsedMember {
  blockIndex: number;
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: "L" | "P" | "";
  tempat_lahir: string;
  tanggal_lahir: string;
  no_wa: string;
  alamat_rumah: string;
  desa: string;
  daerah: string;
  pekerjaan: string;
  hobi: string;
  is_muballigh: boolean;
  is_nikah: boolean;
  is_kerja: boolean;
  jenjang_pendidikan: string;
  sekolah: string;
  jurusan: string;
  warnings: string[];
}

export interface ParseResult {
  members: ParsedMember[];
  skipped: { blockPreview: string; reason: string }[];
}

type FieldTarget =
  | "nama_lengkap"
  | "nama_panggilan"
  | "jenis_kelamin"
  | "tempat_lahir"
  | "tanggal_lahir"
  | "tempat_tanggal_lahir"
  | "no_wa"
  | "alamat_rumah"
  | "desa"
  | "daerah"
  | "pekerjaan"
  | "hobi"
  | "is_muballigh"
  | "is_nikah"
  | "is_kerja"
  | "jenjang_pendidikan"
  | "sekolah"
  | "jurusan";


const FIELD_KEYWORDS: { target: FieldTarget; keywords: string[] }[] = [
  {
    target: "tempat_tanggal_lahir",
    keywords: [
      "tempat tanggal lahir",
      "tempat tgl lahir",
      "tempat, tanggal lahir",
      "tempat, tgl lahir",
      "ttl",
    ],
  },
  {
    target: "nama_lengkap",
    keywords: ["nama lengkap", "nama_lkp", "namalengkap"],
  },
  {
    target: "nama_panggilan",
    keywords: ["nama panggilan", "panggilan", "nama panggil"],
  },
  {
    target: "jenis_kelamin",
    keywords: ["jenis kelamin", "jenis kelmain", "kelamin", "jk", "gender"],
  },
  {
    target: "tanggal_lahir",
    keywords: ["tanggal lahir", "tgl lahir", "tgllahir"],
  },
  {
    target: "tempat_lahir",
    keywords: ["tempat lahir", "tmpt lahir"],
  },
  {
    target: "no_wa",
    keywords: [
      "no whatsapp",
      "no wa",
      "whatsapp",
      "wa",
      "no hp",
      "no telp",
      "no telepon",
      "telp",
      "hp",
      "nomor hp",
      "nomor wa",
    ],
  },
  {
    target: "alamat_rumah",
    keywords: ["alamat rumah", "alamat lengkap", "alamat"],
  },
  {
    target: "jenjang_pendidikan",
    keywords: [
      "jenjang pendidikan",
      "pendidikan terakhir",
      "pendidikan saat ini",
      "jenjang",
      "pendidikan",
    ],
  },
  {
    target: "sekolah",
    keywords: [
      "sekolah pendidikan saat ini terakhir",
      "sekolah pendidikan terakhir",
      "sekolah",
      "kampus",
      "instansi",
    ],
  },
  {
    target: "jurusan",
    keywords: ["jurusan", "program studi", "prodi"],
  },
  {
    target: "pekerjaan",
    keywords: ["pekerjaan", "kerja"],
  },
  {
    target: "is_kerja",
    keywords: ["kesibukan", "aktivitas", "kegiatan"],
  },
  {
    target: "is_muballigh",
    keywords: ["status muballigh", "muballigh", "mubaligh"],
  },
  {
    target: "is_nikah",
    keywords: ["status pernikahan", "status nikah", "sudah menikah", "menikah"],
  },
  {
    target: "desa",
    keywords: ["desa", "kelurahan", "kampung"],
  },
  {
    target: "daerah",
    keywords: ["daerah", "kabupaten", "kota", "kecamatan"],
  },
  {
    target: "hobi",
    keywords: ["hobi", "hobby", "kesukaan"],
  },
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
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  agu: "08",
  aug: "08",
  agt: "08",
  sep: "09",
  okt: "10",
  oct: "10",
  nov: "11",
  des: "12",
  dec: "12",
};

const HEADER_KEYWORDS = [
  "biodata",
  "data generus",
  "data jamaah",
  "identitas",
  "profil",
  "formulir",
];


function normalize(s: string): string {
  return (
    s
      .replace(
        /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu,
        "",
      )
      .replace(/^[\s\-•*_#]+/, "")
      .replace(/[*_#]+\s*$/, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function normalizeKey(s: string): string {
  return normalize(s)
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}'"/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function tryParseField(
  line: string,
): { target: FieldTarget; value: string } | null {
  const clean = normalize(line);
  if (!clean) return null;

  const sepIdx = findSeparator(clean);
  if (sepIdx === -1) return null;

  const rawKey = clean.slice(0, sepIdx).trim();
  const rawValue = clean
    .slice(sepIdx + 1)
    .replace(/^[\s\-–—:]+/, "")
    .trim();

  const target = matchFieldKey(rawKey);
  if (!target) return null;

  return { target, value: rawValue };
}

function findSeparator(s: string): number {
  const colonIdx = s.indexOf(":");
  if (colonIdx > 0) return colonIdx;

  const eqIdx = s.indexOf("=");
  if (eqIdx > 0) return eqIdx;

  const dashRegex = /\s[-–—]\s/;
  const dashMatch = s.match(dashRegex);
  if (dashMatch && dashMatch.index !== undefined && dashMatch.index > 0) {
    return dashMatch.index;
  }

  return -1;
}

function matchFieldKey(rawKey: string): FieldTarget | null {
  const k = normalizeKey(rawKey);
  if (!k) return null;

  for (const { target, keywords } of FIELD_KEYWORDS) {
    for (const kw of keywords) {
      if (k === kw) return target;
    }
  }

  let bestMatch: { target: FieldTarget; length: number } | null = null;
  for (const { target, keywords } of FIELD_KEYWORDS) {
    for (const kw of keywords) {
      if (kw.length <= 3) continue;
      if (k.includes(kw) || kw.includes(k)) {
        if (!bestMatch || kw.length > bestMatch.length) {
          bestMatch = { target, length: kw.length };
        }
      }
    }
  }

  return bestMatch?.target ?? null;
}


function parseTanggal(raw: string): string {
  if (!raw) return "";
  const s = raw.trim();

  const m1 = s.match(/(\d{1,2})\s*[-\s]\s*([a-zA-Z]+)\s*[-\s]\s*(\d{4})/);
  if (m1) {
    const [, d, bulan, y] = m1;
    const mm = BULAN_MAP[bulan.toLowerCase()];
    if (mm) return `${y}-${mm}-${d.padStart(2, "0")}`;
  }

  const m2 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m2) {
    const [, d, mm, y] = m2;
    return `${y}-${mm.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const m3 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m3) {
    const [, y, mm, d] = m3;
    return `${y}-${mm.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return "";
}

function parseTempatTanggal(raw: string): { tempat: string; tanggal: string } {
  if (!raw) return { tempat: "", tanggal: "" };

  const commaIdx = raw.lastIndexOf(",");
  if (commaIdx > 0) {
    const tempat = raw.slice(0, commaIdx).trim();
    const tanggalRaw = raw.slice(commaIdx + 1).trim();
    return { tempat, tanggal: parseTanggal(tanggalRaw) };
  }

  const tgl = parseTanggal(raw);
  if (tgl) return { tempat: "", tanggal: tgl };

  return { tempat: raw.trim(), tanggal: "" };
}

function parseNoWA(raw: string): string {
  if (!raw) return "";
  let s = raw.replace(/[\s\-+().]/g, "");
  if (s.startsWith("62")) return s;
  if (s.startsWith("0")) return "62" + s.slice(1);
  return s;
}

function parseJenisKelamin(raw: string): "L" | "P" | "" {
  const s = raw.toLowerCase().trim();
  if (s === "l" || s.startsWith("laki") || s.includes("pria") || s === "male")
    return "L";
  if (
    s === "p" ||
    s.startsWith("perempuan") ||
    s.includes("wanita") ||
    s === "female"
  )
    return "P";
  return "";
}

function parseBoolean(raw: string): boolean {
  const s = raw.toLowerCase().trim();
  return (
    s.startsWith("ya") || s.startsWith("sudah") || s === "true" || s === "1"
  );
}


function isHeaderLine(line: string): boolean {
  const k = normalizeKey(line);
  if (!k) return false;
  return HEADER_KEYWORDS.some((h) => k.includes(h));
}

function splitIntoBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  let currentHasNama = false;

  function flush() {
    if (current.length > 0) blocks.push(current);
    current = [];
    currentHasNama = false;
  }

  for (const line of lines) {
    if (!line.trim()) continue;

    if (isHeaderLine(line)) {
      flush();
      continue;
    }

    const parsed = tryParseField(line);
    if (parsed?.target === "nama_lengkap") {
      if (currentHasNama) {
        flush();
      }
      currentHasNama = true;
    }

    current.push(line);
  }

  flush();
  return blocks;
}


interface BlockParseState {
  nama_lengkap: string;
  nama_panggilan: string;
  jenis_kelamin: "L" | "P" | "";
  tempat_lahir: string;
  tanggal_lahir: string;
  no_wa: string;
  alamat_rumah: string;
  desa: string;
  daerah: string;
  pekerjaan: string;
  hobi: string;
  is_muballigh: boolean;
  is_nikah: boolean;
  is_kerja: boolean;
  jenjang_pendidikan: string;
  sekolah: string;
  jurusan: string;
}

function emptyState(): BlockParseState {
  return {
    nama_lengkap: "",
    nama_panggilan: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    no_wa: "",
    alamat_rumah: "",
    desa: "",
    daerah: "",
    pekerjaan: "",
    hobi: "",
    is_muballigh: false,
    is_nikah: false,
    is_kerja: false,
    jenjang_pendidikan: "",
    sekolah: "",
    jurusan: "",
  };
}

function assignField(
  state: BlockParseState,
  target: FieldTarget,
  rawValue: string,
) {
  const value = rawValue.trim();
  if (!value) return;

  switch (target) {
    case "nama_lengkap":
      state.nama_lengkap = value;
      break;
    case "nama_panggilan":
      state.nama_panggilan = value;
      break;
    case "jenis_kelamin":
      state.jenis_kelamin = parseJenisKelamin(value);
      break;
    case "tempat_tanggal_lahir": {
      const { tempat, tanggal } = parseTempatTanggal(value);
      if (tempat && !state.tempat_lahir) state.tempat_lahir = tempat;
      if (tanggal && !state.tanggal_lahir) state.tanggal_lahir = tanggal;
      break;
    }
    case "tempat_lahir":
      state.tempat_lahir = value;
      break;
    case "tanggal_lahir":
      state.tanggal_lahir = parseTanggal(value);
      break;
    case "no_wa":
      state.no_wa = parseNoWA(value);
      break;
    case "alamat_rumah":
      state.alamat_rumah = value;
      break;
    case "desa":
      state.desa = value;
      break;
    case "daerah":
      state.daerah = value;
      break;
    case "pekerjaan":
      state.pekerjaan = value;
      break;
    case "hobi":
      state.hobi = value;
      break;
    case "is_muballigh":
      state.is_muballigh = parseBoolean(value);
      break;
    case "is_nikah":
      state.is_nikah = parseBoolean(value);
      break;
    case "is_kerja": {
      const v = value.toLowerCase();
      state.is_kerja = v.includes("kerja") && !v.includes("belum");
      if (!state.pekerjaan) state.pekerjaan = value;
      break;
    }
    case "jenjang_pendidikan":
      state.jenjang_pendidikan = value;
      break;
    case "sekolah":
      state.sekolah = value;
      break;
    case "jurusan":
      if (value !== "-") state.jurusan = value;
      break;
  }
}

function parseBlock(lines: string[]): BlockParseState {
  const state = emptyState();
  let pendingTarget: FieldTarget | null = null;
  let pendingBuffer: string[] = [];

  function flushPending() {
    if (pendingTarget && pendingBuffer.length > 0) {
      assignField(state, pendingTarget, pendingBuffer.join(" "));
    }
    pendingTarget = null;
    pendingBuffer = [];
  }

  for (const line of lines) {
    if (!line.trim()) continue;

    const parsed = tryParseField(line);

    if (parsed) {
      flushPending();

      if (parsed.value) {
        assignField(state, parsed.target, parsed.value);
      } else {
        pendingTarget = parsed.target;
        pendingBuffer = [];
      }
      continue;
    }

    if (pendingTarget) {
      pendingBuffer.push(line.trim());
    }
  }

  flushPending();

  return state;
}


export function parseMemberText(text: string): ParseResult {
  const lines = text.split("\n");
  const blocks = splitIntoBlocks(lines);
  const members: ParsedMember[] = [];
  const skipped: { blockPreview: string; reason: string }[] = [];

  blocks.forEach((block, idx) => {
    const state = parseBlock(block);

    if (!state.nama_lengkap) {
      skipped.push({
        blockPreview: block[0]?.slice(0, 60) || "(empty)",
        reason: "Nama Lengkap tidak ditemukan",
      });
      return;
    }

    const warnings: string[] = [];
    if (!state.jenis_kelamin) warnings.push("Jenis kelamin kosong");
    if (!state.tanggal_lahir) warnings.push("Tanggal lahir kosong");
    if (!state.no_wa) warnings.push("No. WA kosong");
    else if (state.no_wa.length < 10 || state.no_wa.length > 15)
      warnings.push("Format No. WA tidak standar");

    members.push({
      blockIndex: idx,
      nama_lengkap: state.nama_lengkap,
      nama_panggilan: state.nama_panggilan,
      jenis_kelamin: state.jenis_kelamin,
      tempat_lahir: state.tempat_lahir,
      tanggal_lahir: state.tanggal_lahir,
      no_wa: state.no_wa,
      alamat_rumah: state.alamat_rumah,
      desa: state.desa,
      daerah: state.daerah,
      pekerjaan: state.pekerjaan,
      hobi: state.hobi,
      is_muballigh: state.is_muballigh,
      is_nikah: state.is_nikah,
      is_kerja: state.is_kerja,
      jenjang_pendidikan: state.jenjang_pendidikan,
      sekolah: state.sekolah,
      jurusan: state.jurusan,
      warnings,
    });
  });

  return { members, skipped };
}
