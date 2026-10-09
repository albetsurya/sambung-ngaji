import doaPagiJson from "./doa-pagi.json";
import doaSoreJson from "./doa-sore.json";

export type DoaWaktu = "pagi" | "sore";

export interface DoaEntry {
  id: string;
  judul: string;
  arab: string;
  latin: string;
  arti: string;
  sumber?: string;
  dalil?: string;
  keutamaan?: string;
  notes?: string;
}

export interface DoaKategori {
  key: DoaWaktu;
  label: string;
  arabLabel: string;
  description: string;
  entries: DoaEntry[];
}

export const DOA_PAGI: DoaEntry[] = doaPagiJson as DoaEntry[];
export const DOA_SORE: DoaEntry[] = doaSoreJson as DoaEntry[];

export const DOA_KATEGORI: DoaKategori[] = [
  {
    key: "pagi",
    label: "Doa Pagi",
    arabLabel: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062d",
    description: "Dibaca setelah Subuh hingga terbit matahari",
    entries: DOA_PAGI,
  },
  {
    key: "sore",
    label: "Doa Sore",
    arabLabel: "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0633\u0627\u0621",
    description: "Dibaca setelah Ashar hingga terbenam matahari",
    entries: DOA_SORE,
  },
];

export function getDoaKategori(waktu: DoaWaktu): DoaKategori {
  return DOA_KATEGORI.find((k) => k.key === waktu) ?? DOA_KATEGORI[0];
}
