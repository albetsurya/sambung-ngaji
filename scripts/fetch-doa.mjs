/**
 * Fetch doa pagi & sore dari API Ahmad Sanusi, simpan ke JSON lokal.
 * Jalankan: yarn fetch-doa
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const API_KEY =
  process.env.AHMADSANUSI_API_KEY ||
  "ask_ltv98GSHrhI3OGFpPzRR1R_Gq0rvjyVLXbKpmoXEHsY";
const BASE = "https://api.ahmadsanusi.com/v1/doa";
const OUT_DIR = resolve(process.cwd(), "src/data");

async function fetchKategori(slug) {
  const doas = [];
  let page = 1;
  const limit = 20;

  while (true) {
    const url = BASE + "/kategori/" + slug + "?page=" + page + "&limit=" + limit;
    const res = await fetch(url, { headers: { "X-API-Key": API_KEY } });
    if (!res.ok) {
      throw new Error("HTTP " + res.status + " untuk " + slug + " page " + page);
    }
    const json = await res.json();
    if (json.status !== "success") {
      throw new Error("API error: " + JSON.stringify(json));
    }
    const batch = json.data?.doa ?? [];
    doas.push(...batch);
    if (doas.length >= (json.data?.total ?? 0) || batch.length === 0) break;
    page++;
  }

  return doas;
}

// Override judul dari API (kalau ada yang mau diganti).
// Key: judul asli dari API, Value: judul pengganti.
const JUDUL_OVERRIDES = {
  "Sayyidul Istighfar": "Raja Istighfar",
};

// Mapping doa yang berupa ayat Al-Quran → sumber Al-Quran + surah + ayat.
// Key: judul dari API, Value: { sumber, dalil }.
const QURAN_SOURCES = {
  "Ayat al-Kursi": {
    sumber: "Al-Quran, Al-Baqarah: 255",
    dalil: "HR. at-Tirmidzi: 2879",
  },
  "Al-Ikhlas": {
    sumber: "Al-Quran, Al-Ikhlas: 1-4",
    dalil: "HR. Abu Dawud: 4241",
  },
  "Al-Falaq": {
    sumber: "Al-Quran, Al-Falaq: 1-5",
    dalil: "HR. Abu Dawud: 4241",
  },
  "An-Naas": {
    sumber: "Al-Quran, An-Naas: 1-6",
    dalil: "HR. Abu Dawud: 4241",
  },
};

function toEntry(d) {
  return {
    id: "doa-" + d.id,
    judul: JUDUL_OVERRIDES[d.judul] || d.judul,
    arab: d.arab,
    latin: d.latin,
    arti: d.terjemah,
    sumber: QURAN_SOURCES[d.judul]?.sumber || d.sumber || undefined,
    keutamaan: d.fawaid || undefined,
    catatan: d.catatan || undefined,
    dalil: QURAN_SOURCES[d.judul]?.dalil || undefined,
  };
}

async function main() {
  console.log("Fetch doa pagi...");
  const pagi = await fetchKategori("dzikir-pagi");
  console.log("  OK " + pagi.length + " doa pagi");

  console.log("Fetch doa sore...");
  const sore = await fetchKategori("dzikir-petang");
  console.log("  OK " + sore.length + " doa sore");

  writeFileSync(
    resolve(OUT_DIR, "doa-pagi.json"),
    JSON.stringify(pagi.map(toEntry), null, 2) + "\n",
  );
  writeFileSync(
    resolve(OUT_DIR, "doa-sore.json"),
    JSON.stringify(sore.map(toEntry), null, 2) + "\n",
  );

  console.log("\nTersimpan di " + OUT_DIR + "/doa-pagi.json & doa-sore.json");
}

main().catch((err) => {
  console.error("Gagal:", err.message);
  process.exit(1);
});
