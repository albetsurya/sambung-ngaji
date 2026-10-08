import type { QuizQuestion } from "./tilawatiQuizTypes";

type PageShape = readonly [rowLengths: string, footerQuestions: number, unitCount: number];

export interface TilawatiAudioPageMeta {
  rowLengths: number[];
  footerQuestions: number;
  unitCount: number;
  footerAudioUnitCount: number;
  hasDemo: boolean;
  hasFooterAudio: boolean;
}

// The first two values for Jilid 1 are footer-question and content-audio counts.
const JILID_1_PAGE_SHAPES = [
  [3, 12], [3, 15], [3, 17], [3, 18], [3, 18], [2, 19], [3, 17], [4, 16],
  [3, 16], [3, 15], [4, 18], [0, 18], [2, 12], [3, 15], [3, 13], [3, 14],
  [2, 10], [0, 10], [3, 9], [3, 13], [3, 13], [0, 14], [3, 13], [3, 17],
  [3, 20], [3, 19], [2, 15], [2, 6], [0, 8], [2, 12], [3, 12], [3, 14],
  [0, 23], [2, 27], [2, 27], [2, 25], [0, 22], [0, 22], [0, 23], [0, 24],
  [0, 23], [0, 24], [0, 25], [0, 16],
] as const;

// For Jilid 2–5, each character in rowLengths is one PDF item in a baris audio.
const PAGE_SHAPES: Record<number, readonly PageShape[]> = {
  2: [
    ["222222", 0, 6], ["33333333", 0, 8], ["33333333", 0, 8], ["3333333", 0, 7],
    ["222222", 0, 6], ["33333333", 0, 8], ["33333333", 0, 8], ["33333333", 0, 8],
    ["222222", 0, 6], ["33333333", 0, 8], ["33333333", 0, 8], ["222222", 0, 6],
    ["33333333", 0, 8], ["222222", 0, 6], ["3333333", 0, 7], ["33333333", 0, 8],
    ["33333333", 0, 8], ["3333333", 0, 7], ["33333333", 0, 8], ["222333", 0, 6],
    ["33333333", 0, 8], ["33333333", 0, 8], ["33333333", 0, 8], ["33333333", 0, 8],
    ["33333333", 0, 8], ["33333333", 0, 8], ["3333333", 0, 7], ["2333333", 0, 7],
    ["3333333", 0, 7], ["2222222", 0, 7], ["2222222", 0, 7], ["44444444", 0, 8],
    ["33333333", 0, 8], ["33333333", 0, 8], ["3333333", 0, 7], ["44444444", 0, 8],
    ["33333333", 0, 8], ["33333333", 0, 8], ["22222222", 0, 8], ["2222222", 0, 7],
    ["22222222", 0, 8], ["222222", 0, 6], ["2222111", 0, 7], ["2221111", 0, 7],
  ],
  3: [
    ["3333333", 0, 7], ["1111112", 0, 7], ["33333333", 0, 8], ["2222222", 0, 7],
    ["33333333", 0, 8], ["2333333", 0, 7], ["3333333", 0, 7], ["22222222", 0, 8],
    ["11111111", 0, 8], ["33333333", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["11111111", 0, 8], ["11111111", 0, 8], ["3333333", 0, 7], ["3333333", 0, 7],
    ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["3333333", 0, 7], ["11111111", 0, 8], ["33333333", 0, 8], ["11111111", 0, 8],
    ["3333333", 0, 7], ["33333333", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["33333333", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["33333333", 0, 8],
    ["1111111", 0, 7], ["3333333", 0, 7], ["3333333", 0, 7], ["11111111", 0, 8],
    ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["33333333", 0, 8],
    ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
  ],
  4: [
    ["444444", 0, 6], ["22221111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["11111111", 0, 8], ["2221111", 0, 7], ["2221111", 0, 7], ["11111111", 0, 8],
    ["2222222", 0, 7], ["22221111", 0, 8], ["11111111", 0, 8], ["1122122", 0, 7],
    ["22222212", 0, 8], ["2221111", 0, 7], ["11111111", 0, 8], ["333333", 0, 6],
    ["11111111", 0, 8], ["11111111", 0, 8], ["333333", 0, 6], ["2222222", 4, 7],
    ["1111111", 4, 7], ["11111111", 0, 8], ["2222222", 0, 7], ["222222", 0, 6],
    ["11111111", 0, 8], ["1111111", 4, 7], ["11111111", 0, 8], ["1111111", 0, 7],
    ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["2221111", 0, 7], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["2222222", 0, 7], ["11111111", 0, 8], ["11111111", 0, 8], ["222222", 0, 6],
    ["11111111", 0, 8], ["12111111", 0, 8], ["11111111", 0, 8], ["111111", 5, 6],
  ],
  5: [
    ["222222", 0, 6], ["11111111", 0, 8], ["11111111", 0, 8], ["222222", 0, 6],
    ["1111111", 0, 7], ["1111111", 0, 7], ["11111111", 0, 8], ["222222", 0, 6],
    ["11111111", 0, 8], ["11111111", 0, 8], ["222222", 0, 6], ["11111111", 0, 8],
    ["11111111", 0, 8], ["222222", 0, 6], ["22222222", 0, 8], ["2222222", 0, 7],
    ["22222222", 0, 8], ["2222222", 0, 6], ["11111", 4, 5], ["222222", 5, 6],
    ["11111111", 0, 8], ["222222", 0, 6], ["11111111", 0, 8], ["11111111", 0, 8],
    ["222222", 0, 6], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8], ["11111111", 0, 8],
    ["11111111", 0, 8], ["1111111", 5, 7], ["11111111", 0, 8], ["11111111", 0, 8],
    ["11111111", 0, 8], ["1111111", 0, 7], ["111111", 0, 6], ["11111111", 0, 8],
    ["111331", 0, 6], ["22222222222245", 0, 14], ["22222212", 0, 8], ["11111111", 0, 8],
  ],
};

const JILID_1_NAMED_HEADER_PAGES = new Set([
  1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 23, 24,
  25, 26, 27, 28, 30, 31,
]);
const JILID_1_INLINE_HEADER_PAGES = new Set([6, 12, 18, 22, 29, 32]);
const DEMO_PAGES: Record<number, ReadonlySet<number>> = {
  3: new Set([1]),
  4: new Set([1, 6, 9, 14, 16, 19, 23, 24, 33, 40]),
  5: new Set([5, 6, 14, 18, 19, 41]),
};
const FOOTER_AUDIO_PAGES: Record<number, ReadonlySet<number>> = {
  1: new Set([...JILID_1_NAMED_HEADER_PAGES]),
  4: new Set([20, 21, 26, 44]),
};
const SPLIT_FOOTER_AUDIO_PAGES: Record<number, ReadonlySet<number>> = {
  5: new Set([19, 20, 34]),
};

export function getTilawatiAudioPageMeta(jilid: number, pageNumber: number): TilawatiAudioPageMeta | null {
  const shape = pageShape(jilid, pageNumber);
  if (!shape) return null;
  const [encodedRows, footerQuestions, unitCount] = shape;
  const footerAudioUnitCount = SPLIT_FOOTER_AUDIO_PAGES[jilid]?.has(pageNumber)
    ? 2
    : FOOTER_AUDIO_PAGES[jilid]?.has(pageNumber)
      ? 1
      : 0;
  return {
    rowLengths: rowLengths(encodedRows),
    footerQuestions,
    unitCount,
    footerAudioUnitCount,
    hasDemo: DEMO_PAGES[jilid]?.has(pageNumber) ?? false,
    hasFooterAudio: footerAudioUnitCount > 0,
  };
}

function pageShape(jilid: number, pageNumber: number): PageShape | null {
  if (jilid === 1) {
    const shape = JILID_1_PAGE_SHAPES[pageNumber - 1];
    return shape ? ["", shape[0], shape[1]] : null;
  }
  return PAGE_SHAPES[jilid]?.[pageNumber - 1] ?? null;
}

function rowLengths(encoded: string): number[] {
  return [...encoded].map(Number);
}

function pageUrl(jilid: number, pageNumber: number, filename: string): string {
  return `/audio/tilawati/jilid_${jilid}/hal${pageNumber}/${filename}`;
}

/**
 * Resolves a quiz item to the final audio unit produced from the PDF/audio
 * review. For Jilid 2–5 one baris file is shared by all PDF items in that row.
 */
export function getTilawatiQuestionAudioUrl(
  jilid: number,
  pageNumber: number,
  questionIndex: number,
  existingUrl = "",
  firstQuestionIsOpening = questionIndex === 0,
): string {
  if (existingUrl) return existingUrl;

  const shape = pageShape(jilid, pageNumber);
  if (!shape) return "";
  const [encodedRows, footerQuestions, unitCount] = shape;
  const questionHasHeader = firstQuestionIsOpening && questionIndex < 2;
  const pageHasHeader = jilid === 1
    ? JILID_1_NAMED_HEADER_PAGES.has(pageNumber)
    : questionHasHeader;
  const hasDemo = DEMO_PAGES[jilid]?.has(pageNumber) ?? false;
  const contentStart = firstQuestionIsOpening ? 2 : 0;
  const contentCount = jilid === 1
    ? unitCount
    : rowLengths(encodedRows).reduce((sum, length) => sum + length, 0);
  const footerStart = contentStart + contentCount;

  if (questionHasHeader) {
    if (jilid === 1 && pageHasHeader) {
      if (questionIndex === 0) return pageUrl(jilid, pageNumber, `hal${pageNumber}_header_full.ogg`);
      if (questionIndex === 1) return pageUrl(jilid, pageNumber, `hal${pageNumber}_header_datar.ogg`);
    }
    if (jilid !== 1 && hasDemo) {
      return pageUrl(jilid, pageNumber, `hal${pageNumber}_demo.ogg`);
    }
    return "";
  }

  if (questionIndex >= footerStart) {
    if (questionIndex < footerStart + footerQuestions && FOOTER_AUDIO_PAGES[jilid]?.has(pageNumber)) {
      return pageUrl(jilid, pageNumber, `hal${pageNumber}_footer.ogg`);
    }
    return "";
  }

  const contentIndex = questionIndex - contentStart;
  if (contentIndex < 0) return "";

  if (jilid === 1) {
    const fileIndex = contentIndex + (JILID_1_INLINE_HEADER_PAGES.has(pageNumber) ? 4 : 1);
    const firstContentIndex = JILID_1_INLINE_HEADER_PAGES.has(pageNumber) ? 4 : 1;
    const maxFileIndex = unitCount + (JILID_1_INLINE_HEADER_PAGES.has(pageNumber) ? 3 : 0);
    if (fileIndex < firstContentIndex || fileIndex > maxFileIndex) return "";
    return pageUrl(jilid, pageNumber, `hal${pageNumber}_isi_${String(fileIndex).padStart(2, "0")}.ogg`);
  }

  const rows = rowLengths(encodedRows);
  let rowIndex = 0;
  let remaining = contentIndex;
  while (rowIndex < rows.length && remaining >= rows[rowIndex]) {
    remaining -= rows[rowIndex];
    rowIndex += 1;
  }
  if (rowIndex >= unitCount) return "";
  return pageUrl(jilid, pageNumber, `hal${pageNumber}_baris_${String(rowIndex + 1).padStart(2, "0")}.ogg`);
}

export function getQuestionAudioUrl(
  question: QuizQuestion,
  jilid: number,
  pageNumber: number,
  questionIndex: number,
  pageHasHeader = Boolean(question.isOpening),
): string {
  if (question.audioMappingComplete) return question.audioUrl;
  return getTilawatiQuestionAudioUrl(
    jilid,
    pageNumber,
    questionIndex,
    question.audioUrl,
    pageHasHeader,
  );
}
