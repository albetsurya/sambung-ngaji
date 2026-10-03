
export interface ParsedMember {
  blockIndex: number;
  full_name: string;
  nickname: string;
  gender: "L" | "P" | "";
  birth_place: string;
  birth_date: string;
  whatsapp_number: string;
  home_address: string;
  village: string;
  region: string;
  occupation: string;
  hobby: string;
  is_preacher: boolean;
  is_married: boolean;
  is_employed: boolean;
  education_level: string;
  school: string;
  major: string;
  warnings: string[];
}

export interface ParseResult {
  members: ParsedMember[];
  skipped: { blockPreview: string; reason: string }[];
}

type FieldTarget =
  | "full_name"
  | "nickname"
  | "gender"
  | "birth_place"
  | "birth_date"
  | "tempat_tanggal_lahir"
  | "whatsapp_number"
  | "home_address"
  | "village"
  | "region"
  | "occupation"
  | "hobby"
  | "is_preacher"
  | "is_married"
  | "is_employed"
  | "education_level"
  | "school"
  | "major";


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
    target: "full_name",
    keywords: ["nama lengkap", "nama_lkp", "namalengkap"],
  },
  {
    target: "nickname",
    keywords: ["nama panggilan", "panggilan", "nama panggil"],
  },
  {
    target: "gender",
    keywords: ["jenis kelamin", "jenis kelmain", "kelamin", "jk", "gender"],
  },
  {
    target: "birth_date",
    keywords: ["tanggal lahir", "tgl lahir", "tgllahir"],
  },
  {
    target: "birth_place",
    keywords: ["tempat lahir", "tmpt lahir"],
  },
  {
    target: "whatsapp_number",
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
    target: "home_address",
    keywords: ["alamat rumah", "alamat lengkap", "alamat"],
  },
  {
    target: "education_level",
    keywords: [
      "jenjang pendidikan",
      "pendidikan terakhir",
      "pendidikan saat ini",
      "jenjang",
      "pendidikan",
    ],
  },
  {
    target: "school",
    keywords: [
      "sekolah pendidikan saat ini terakhir",
      "sekolah pendidikan terakhir",
      "school",
      "kampus",
      "instansi",
    ],
  },
  {
    target: "major",
    keywords: ["jurusan", "program studi", "prodi"],
  },
  {
    target: "occupation",
    keywords: ["pekerjaan", "kerja"],
  },
  {
    target: "is_employed",
    keywords: ["kesibukan", "aktivitas", "kegiatan"],
  },
  {
    target: "is_preacher",
    keywords: ["status muballigh", "muballigh", "mubaligh"],
  },
  {
    target: "is_married",
    keywords: ["status pernikahan", "status nikah", "sudah menikah", "menikah"],
  },
  {
    target: "village",
    keywords: ["desa", "kelurahan", "kampung"],
  },
  {
    target: "region",
    keywords: ["daerah", "kabupaten", "kota", "kecamatan"],
  },
  {
    target: "hobby",
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
    .replace(/^[\s\---:]+/, "")
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

  const dashRegex = /\s[---]\s/;
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

function parseTempatTanggal(raw: string): { tempat: string; date: string } {
  if (!raw) return { tempat: "", date: "" };

  const commaIdx = raw.lastIndexOf(",");
  if (commaIdx > 0) {
    const tempat = raw.slice(0, commaIdx).trim();
    const tanggalRaw = raw.slice(commaIdx + 1).trim();
    return { tempat, date: parseTanggal(tanggalRaw) };
  }

  const tgl = parseTanggal(raw);
  if (tgl) return { tempat: "", date: tgl };

  return { tempat: raw.trim(), date: "" };
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
    if (parsed?.target === "full_name") {
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
  full_name: string;
  nickname: string;
  gender: "L" | "P" | "";
  birth_place: string;
  birth_date: string;
  whatsapp_number: string;
  home_address: string;
  village: string;
  region: string;
  occupation: string;
  hobby: string;
  is_preacher: boolean;
  is_married: boolean;
  is_employed: boolean;
  education_level: string;
  school: string;
  major: string;
}

function emptyState(): BlockParseState {
  return {
    full_name: "",
    nickname: "",
    gender: "",
    birth_place: "",
    birth_date: "",
    whatsapp_number: "",
    home_address: "",
    village: "",
    region: "",
    occupation: "",
    hobby: "",
    is_preacher: false,
    is_married: false,
    is_employed: false,
    education_level: "",
    school: "",
    major: "",
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
    case "full_name":
      state.full_name = value;
      break;
    case "nickname":
      state.nickname = value;
      break;
    case "gender":
      state.gender = parseJenisKelamin(value);
      break;
    case "tempat_tanggal_lahir": {
      const { tempat, date } = parseTempatTanggal(value);
      if (tempat && !state.birth_place) state.birth_place = tempat;
      if (date && !state.birth_date) state.birth_date = date;
      break;
    }
    case "birth_place":
      state.birth_place = value;
      break;
    case "birth_date":
      state.birth_date = parseTanggal(value);
      break;
    case "whatsapp_number":
      state.whatsapp_number = parseNoWA(value);
      break;
    case "home_address":
      state.home_address = value;
      break;
    case "village":
      state.village = value;
      break;
    case "region":
      state.region = value;
      break;
    case "occupation":
      state.occupation = value;
      break;
    case "hobby":
      state.hobby = value;
      break;
    case "is_preacher":
      state.is_preacher = parseBoolean(value);
      break;
    case "is_married":
      state.is_married = parseBoolean(value);
      break;
    case "is_employed": {
      const v = value.toLowerCase();
      state.is_employed = v.includes("kerja") && !v.includes("belum");
      if (!state.occupation) state.occupation = value;
      break;
    }
    case "education_level":
      state.education_level = value;
      break;
    case "school":
      state.school = value;
      break;
    case "major":
      if (value !== "-") state.major = value;
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

    if (!state.full_name) {
      skipped.push({
        blockPreview: block[0]?.slice(0, 60) || "(empty)",
        reason: "Nama Lengkap tidak ditemukan",
      });
      return;
    }

    const warnings: string[] = [];
    if (!state.gender) warnings.push("Jenis kelamin kosong");
    if (!state.birth_date) warnings.push("Tanggal lahir kosong");
    if (!state.whatsapp_number) warnings.push("No. WA kosong");
    else if (state.whatsapp_number.length < 10 || state.whatsapp_number.length > 15)
      warnings.push("Format No. WA tidak standar");

    members.push({
      blockIndex: idx,
      full_name: state.full_name,
      nickname: state.nickname,
      gender: state.gender,
      birth_place: state.birth_place,
      birth_date: state.birth_date,
      whatsapp_number: state.whatsapp_number,
      home_address: state.home_address,
      village: state.village,
      region: state.region,
      occupation: state.occupation,
      hobby: state.hobby,
      is_preacher: state.is_preacher,
      is_married: state.is_married,
      is_employed: state.is_employed,
      education_level: state.education_level,
      school: state.school,
      major: state.major,
      warnings,
    });
  });

  return { members, skipped };
}
