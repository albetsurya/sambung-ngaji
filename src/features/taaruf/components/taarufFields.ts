import type { Member } from "../../../types";
import { formatDateLongText } from "../../../utils/format";


export interface TaarufFieldDef {
  key: string;
  label: string;
  getValue: (m: Member) => string;
  wide?: boolean;
}

export const TAARUF_FIELDS: TaarufFieldDef[] = [
  {
    key: "ttl",
    label: "Tempat, tanggal lahir",
    wide: true,
    getValue: (m) =>
      [m.tempat_lahir, m.tanggal_lahir ? formatDateLongText(m.tanggal_lahir) : ""]
        .filter(Boolean)
        .join(", "),
  },
  {
    key: "usia",
    label: "Usia",
    getValue: (m) => (m.usia != null ? `${m.usia} tahun` : ""),
  },
  {
    key: "daerah",
    label: "Daerah",
    getValue: (m) => m.daerah || "",
  },
  {
    key: "desa",
    label: "Desa",
    getValue: (m) => m.desa || "",
  },
  {
    key: "kelompok",
    label: "Kelompok",
    getValue: (m) => m.kelompok || "",
  },
  {
    key: "alamat",
    label: "Alamat rumah",
    wide: true,
    getValue: (m) => m.alamat_rumah || "",
  },
  {
    key: "fisik",
    label: "Tinggi / berat badan",
    getValue: (m) =>
      [
        m.tinggi_badan ? `${m.tinggi_badan} cm` : "",
        m.berat_badan ? `${m.berat_badan} kg` : "",
      ]
        .filter(Boolean)
        .join(" / "),
  },
  {
    key: "pekerjaan",
    label: "Pekerjaan",
    getValue: (m) => m.pekerjaan || "",
  },
  {
    key: "hobi",
    label: "Hobi",
    getValue: (m) => m.hobi || "",
  },
  {
    key: "no_wa",
    label: "No. WhatsApp",
    getValue: (m) => m.no_wa || "",
  },
];

export function resolveTaarufValues(
  member: Member,
  overrides: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of TAARUF_FIELDS) {
    const o = overrides[f.key];
    out[f.key] = o !== undefined ? o : f.getValue(member);
  }
  return out;
}
