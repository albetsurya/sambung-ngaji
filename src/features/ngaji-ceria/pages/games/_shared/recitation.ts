import type { TilawatiAudioRequest } from "../../../services/tilawatiAudio";
import { normalizeArabic } from "../../../services/tilawatiAudio";
import { TILAWATI_JILID_1_PAGES } from "../../../data/tilawatiQuizJilid1";
import { getTilawatiQuestionAudioUrl } from "../../../data/tilawatiAudioQuestionMap";

const SURAH_AUDIO: Record<string, { page: number; file: string; surah: number }> = {
  "An-Nas": { page: 1, file: "AnNas", surah: 114 },
  "Al-Falaq": { page: 1, file: "AlFalaq", surah: 113 },
  "Al-Ikhlas": { page: 1, file: "AlIkhlas", surah: 112 },
  "Al-Lahab": { page: 2, file: "AlLahab", surah: 111 },
  "An-Nasr": { page: 2, file: "AnNasr", surah: 110 },
  "Al-Kafirun": { page: 2, file: "AlKafirun", surah: 109 },
  "Al-Kautsar": { page: 3, file: "AlKautsar", surah: 108 },
  "Al-Ma'un": { page: 3, file: "AlMaun", surah: 107 },
};

export function verseRecitation(verse?: { id: string; surahName: string; ayahNumber: number; arabic?: string; promptArabic?: string }): TilawatiAudioRequest | undefined {
  if (!verse) return undefined;
  const mapping = SURAH_AUDIO[verse.surahName];
  if (!mapping) {
    const surah = Number(verse.id.split("-")[0]);
    if (!surah || surah > 114) return undefined;
    // Di luar master Tilawati, gunakan rekaman ayat yang sama persis.
    return { jilid: 6, pageNumber: 0, questionIndex: 0, arabic: verse.arabic ?? verse.promptArabic,
      audioUrl: `https://everyayah.com/data/Alafasy_128kbps/${String(surah).padStart(3, "0")}${String(verse.ayahNumber).padStart(3, "0")}.mp3`, allowPageFallback: false };
  }
  const page = verse.surahName === "Al-Kafirun" && verse.ayahNumber >= 5 ? 3 : mapping.page;
  // Ayat 4 terbelah di dua master; rekaman utuh menjaga bacaan sesuai soal.
  const audioUrl = verse.surahName === "Al-Kafirun" && verse.ayahNumber === 4
    ? `https://everyayah.com/data/Alafasy_128kbps/${String(mapping.surah).padStart(3, "0")}${String(verse.ayahNumber).padStart(3, "0")}.mp3`
    : `/audio/tilawati/jilid_6/hal${page}/hal${page}-${mapping.file}-ayat${verse.ayahNumber}.ogg`;
  return { jilid: 6, pageNumber: page, questionIndex: 0, arabic: verse.arabic ?? verse.promptArabic,
    audioUrl, allowPageFallback: false };
}

const letterAudio = new Map<string, TilawatiAudioRequest | undefined>();
export function letterRecitation(arabic?: string): TilawatiAudioRequest | undefined {
  if (!arabic) return undefined;
  if (letterAudio.has(arabic)) return letterAudio.get(arabic);
  const normalized = normalizeArabic(arabic);
  for (const page of Object.values(TILAWATI_JILID_1_PAGES)) {
    const index = page.questions.findIndex((question) => !question.isOpening && question.arabic.trim().split(/\s+/).every((syllable) =>
      normalizeArabic(syllable) === normalized && (!/[\u064b-\u065f]/.test(arabic) || syllable.normalize("NFC") === arabic.normalize("NFC"))));
    if (index < 0) continue;
    const question = page.questions[index];
    const request = { jilid: 1, pageNumber: page.pageNumber, questionIndex: index, question,
      audioUrl: getTilawatiQuestionAudioUrl(1, page.pageNumber, index, question.audioUrl, Boolean(page.questions[0]?.isOpening)), allowPageFallback: false };
    letterAudio.set(arabic, request);
    return request;
  }
  // ponytail: hanya unit Jilid 1 yang cocok; tambah mapping setelah klip vokal lain dipublikasikan.
  letterAudio.set(arabic, undefined);
  return undefined;
}
