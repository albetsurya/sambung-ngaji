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
      [m.birth_place, m.birth_date ? formatDateLongText(m.birth_date) : ""]
        .filter(Boolean)
        .join(", "),
  },
  {
    key: "usia",
    label: "Usia",
    getValue: (m) => (m.usia != null ? `${m.usia} tahun` : ""),
  },
  {
    key: "region",
    label: "Daerah",
    getValue: (m) => m.region || "",
  },
  {
    key: "village",
    label: "Desa",
    getValue: (m) => m.village || "",
  },
  {
    key: "group_label",
    label: "Kelompok",
    getValue: (m) => m.group_label || "",
  },
  {
    key: "alamat",
    label: "Alamat rumah",
    wide: true,
    getValue: (m) => m.home_address || "",
  },
  {
    key: "fisik",
    label: "Tinggi / berat badan",
    getValue: (m) =>
      [
        m.height ? `${m.height} cm` : "",
        m.weight ? `${m.weight} kg` : "",
      ]
        .filter(Boolean)
        .join(" / "),
  },
  {
    key: "occupation",
    label: "Pekerjaan",
    getValue: (m) => m.occupation || "",
  },
  {
    key: "hobby",
    label: "Hobi",
    getValue: (m) => m.hobby || "",
  },
  {
    key: "whatsapp_number",
    label: "No. WhatsApp",
    getValue: (m) => m.whatsapp_number || "",
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
