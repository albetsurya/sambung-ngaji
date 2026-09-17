const BASE = "https://equran.id/api/v2";

export interface SurahSummary {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends SurahSummary {
  ayat: Ayat[];
  suratSelanjutnya: { nomor: number; namaLatin: string } | false;
  suratSebelumnya: { nomor: number; namaLatin: string } | false;
}

interface EquranListResponse {
  code: number;
  message: string;
  data: SurahSummary[];
}

interface EquranDetailResponse {
  code: number;
  message: string;
  data: SurahDetail;
}

/**
 * Fetch list 114 surah. Response kecil (~30KB) — boleh cache lama.
 */
export async function fetchSurahList(): Promise<SurahSummary[]> {
  const res = await fetch(BASE + "/surat");
  if (!res.ok) throw new Error("Gagal memuat daftar surah (HTTP " + res.status + ")");
  const json = (await res.json()) as EquranListResponse;
  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error(json.message || "Response tidak valid");
  }
  return json.data;
}

/**
 * Fetch detail 1 surah (ayat + terjemah + audio).
 */
export async function fetchSurahDetail(nomor: number): Promise<SurahDetail> {
  const res = await fetch(BASE + "/surat/" + nomor);
  if (!res.ok) throw new Error("Gagal memuat surah (HTTP " + res.status + ")");
  const json = (await res.json()) as EquranDetailResponse;
  if (json.code !== 200 || !json.data) {
    throw new Error(json.message || "Surah tidak ditemukan");
  }
  return json.data;
}

/**
 * Helper: dapatkan URL audio ayat (default qari 01 = Misyari Rasyid).
 */
export function getAyatAudioUrl(ayat: Ayat, qariKey = "01"): string {
  return ayat.audio[qariKey] || ayat.audio["01"] || "";
}

/**
 * Helper: dapatkan URL audio full surah (untuk play all).
 */
export function getSurahAudioUrl(
  surah: SurahSummary,
  qariKey = "01",
): string {
  return surah.audioFull[qariKey] || surah.audioFull["01"] || "";
}
