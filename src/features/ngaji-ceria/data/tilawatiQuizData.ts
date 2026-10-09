/**
 * Penghubung dataset kuis Tilawati Jilid 1–6.
 * Setiap dataset literal disimpan pada file jilid masing-masing.
 */
import type { PageQuizData, QuizQuestion } from "./tilawatiQuizTypes";
import { getTilawatiAudioPageMeta } from "./tilawatiAudioQuestionMap";
import quizEdits from "./tilawatiQuizEdits.json";
import timelineEdits from "./tilawatiTimelineEdits.json";
import type { PublishedTimeline } from "../utils/pageTimeline";
import { isNgajiCeriaServerAvailable } from "../services/ngajiCeriaApi";
import { TILAWATI_JILID_1_PAGES as RAW_TILAWATI_JILID_1_PAGES } from "./tilawatiQuizJilid1";
import { TILAWATI_JILID_2_PAGES as RAW_TILAWATI_JILID_2_PAGES } from "./tilawatiQuizJilid2";
import { TILAWATI_JILID_3_PAGES as RAW_TILAWATI_JILID_3_PAGES } from "./tilawatiQuizJilid3";
import { TILAWATI_JILID_4_PAGES as RAW_TILAWATI_JILID_4_PAGES } from "./tilawatiQuizJilid4";
import { TILAWATI_JILID_5_PAGES as RAW_TILAWATI_JILID_5_PAGES } from "./tilawatiQuizJilid5";
import { TILAWATI_JILID_6_PAGES } from "./tilawatiQuizJilid6";

const audioUrl = (jilid: number, pageNumber: number, filename: string): string =>
  `/audio/tilawati/jilid_${jilid}/hal${pageNumber}/${filename}`;

type QuizEdit = Partial<QuizQuestion> & { deleted?: boolean };
const QUIZ_EDITS = quizEdits as Record<string, QuizEdit>;
type TimelineEdit = {
  published?: PublishedTimeline;
  audioOrder?: string[];
  textLinks?: Record<string, string>;
  textAdditions?: QuizQuestion[];
};
const TIMELINE_EDITS = timelineEdits as Record<string, TimelineEdit>;

function mergeQuestions(questions: QuizQuestion[], mergedAudioUrl: string): QuizQuestion {
  const first = questions[0];
  if (!first) throw new Error("Tidak dapat menggabungkan baris kuis kosong");

  const transliterationParts = questions.flatMap((question) => question.transliterationParts);
  const distractors: string[] = [];
  for (const option of questions.flatMap((question) => question.options)) {
    if (!transliterationParts.includes(option) && !distractors.includes(option)) {
      distractors.push(option);
    }
  }

  const tones = Array.from(
    new Set(
      questions
        .map((question) => question.hintTone.replace(/^Rost:\s*Nada\s*/, ""))
        .filter(Boolean),
    ),
  );

  return {
    ...first,
    arabic: questions
      .map((question) => question.arabic.replace(/\s+/g, " ").trim())
      .join("   "),
    transliterationParts,
    options: [...transliterationParts, ...distractors.slice(0, Math.max(8, transliterationParts.length))],
    hintTone: tones.length > 1 ? `Rost: ${tones.join(" — ")}` : first.hintTone,
    audioUrl: mergedAudioUrl,
    audioMappingComplete: true,
  };
}

function groupPageByAudioRows(jilid: number, page: PageQuizData): PageQuizData {
  const meta = getTilawatiAudioPageMeta(jilid, page.pageNumber);
  if (!meta) return page;

  const sourceQuestions = page.questions;
  const hasHeader = Boolean(sourceQuestions[0]?.isOpening);
  const headerCount = hasHeader ? Math.min(2, sourceQuestions.length) : 0;
  const footerStart = Math.max(headerCount, sourceQuestions.length - meta.footerQuestions);
  const groupedQuestions: QuizQuestion[] = [];

  if (headerCount > 0) {
    if (meta.hasDemo) {
      groupedQuestions.push(
        {
          ...sourceQuestions[0],
          audioUrl: audioUrl(jilid, page.pageNumber, `hal${page.pageNumber}_demo.ogg`),
          audioMappingComplete: true,
        },
      );
    } else {
      groupedQuestions.push(...sourceQuestions.slice(0, headerCount));
    }
  }

  let sourceIndex = headerCount;
  for (let rowIndex = 0; rowIndex < meta.rowLengths.length && sourceIndex < footerStart; rowIndex += 1) {
    const rowLength = meta.rowLengths[rowIndex];
    const rowQuestions = sourceQuestions.slice(sourceIndex, Math.min(sourceIndex + rowLength, footerStart));
    if (rowQuestions.length === 0) break;

    const rowAudio = rowIndex < meta.unitCount
      ? audioUrl(
          jilid,
          page.pageNumber,
          `hal${page.pageNumber}_baris_${String(rowIndex + 1).padStart(2, "0")}.ogg`,
        )
      : "";
    groupedQuestions.push(mergeQuestions(rowQuestions, rowAudio));
    sourceIndex += rowLength;
  }

  // Preserve any PDF items whose source row metadata is shorter than the quiz data.
  if (sourceIndex < footerStart) {
    groupedQuestions.push(mergeQuestions(sourceQuestions.slice(sourceIndex, footerStart), ""));
  }

  if (footerStart < sourceQuestions.length) {
    const footerQuestions = sourceQuestions.slice(footerStart);
    const footerAudioCount = meta.footerAudioUnitCount;
    const footerGroupCount = footerAudioCount || 1;
    for (let footerIndex = 0; footerIndex < footerGroupCount; footerIndex += 1) {
      const start = Math.floor((footerIndex * footerQuestions.length) / footerGroupCount);
      const end = Math.floor(((footerIndex + 1) * footerQuestions.length) / footerGroupCount);
      const footerGroup = footerQuestions.slice(start, end);
      if (footerGroup.length === 0) continue;

      const footerFilename = footerAudioCount === 2
        ? `hal${page.pageNumber}_footer_${String(footerIndex + 1).padStart(2, "0")}.ogg`
        : `hal${page.pageNumber}_footer.ogg`;
      groupedQuestions.push(
        mergeQuestions(
          footerGroup,
          meta.hasFooterAudio ? audioUrl(jilid, page.pageNumber, footerFilename) : "",
        ),
      );
    }
  }

  return { ...page, questions: groupedQuestions };
}

function groupDatasetByAudioRows(jilid: number, pages: Record<number, PageQuizData>): Record<number, PageQuizData> {
  return Object.fromEntries(
    Object.entries(pages).map(([pageNumber, page]) => [
      pageNumber,
      groupPageByAudioRows(jilid, page),
    ]),
  ) as Record<number, PageQuizData>;
}

function groupJilid1Footers(pages: Record<number, PageQuizData>): Record<number, PageQuizData> {
  return Object.fromEntries(
    Object.entries(pages).map(([pageNumber, page]) => {
      const meta = getTilawatiAudioPageMeta(1, page.pageNumber);
      if (!meta?.footerAudioUnitCount || !meta.footerQuestions) return [pageNumber, page];

      const footerStart = page.questions.length - meta.footerQuestions;
      return [
        pageNumber,
        {
          ...page,
          questions: [
            ...page.questions.slice(0, footerStart),
            mergeQuestions(
              page.questions.slice(footerStart),
              audioUrl(1, page.pageNumber, `hal${page.pageNumber}_footer.ogg`),
            ),
          ],
        },
      ];
    }),
  ) as Record<number, PageQuizData>;
}

function applyQuizEdits(jilid: number, pages: Record<number, PageQuizData>): Record<number, PageQuizData> {
  if (isNgajiCeriaServerAvailable()) return pages;
  return Object.fromEntries(
    Object.entries(pages).map(([pageNumber, page]) => {
      const questions = page.questions
        .map((question) => {
          const edit = QUIZ_EDITS[`${jilid}:${pageNumber}:${question.id}`];
          return (edit ? { ...question, ...edit } : question) as QuizQuestion & { deleted?: boolean };
        })
        .filter((question) => !question.deleted)
        .map(({ deleted: _deleted, ...question }) => question);
      return [pageNumber, { ...page, questions }];
    }),
  ) as Record<number, PageQuizData>;
}

function applyTimelineEdits(jilid: number, pages: Record<number, PageQuizData>): Record<number, PageQuizData> {
  if (isNgajiCeriaServerAvailable()) return pages;
  return Object.fromEntries(
    Object.entries(pages).map(([pageNumber, page]) => {
      const edit = TIMELINE_EDITS[`${jilid}:${pageNumber}`];
      if (!edit) return [pageNumber, page];
      if (edit.published) return [pageNumber, { ...page, questions: edit.published.questions }];
      const audioRanks = new Map((edit.audioOrder || []).map((audioUrl, index) => [audioUrl, index]));
      const addedQuestions = (edit.textAdditions || [])
        .map((question) => {
          const override = QUIZ_EDITS[`${jilid}:${pageNumber}:${question.id}`];
          return (override ? { ...question, ...override } : question) as QuizQuestion & { deleted?: boolean };
        })
        .filter((question) => !question.deleted)
        .map(({ deleted: _deleted, ...question }) => question);
      const questions = [...page.questions, ...addedQuestions]
        .map((question) => {
          const linkedAudio = edit.textLinks?.[String(question.id)];
          return linkedAudio
            ? { ...question, audioUrl: linkedAudio, audioMappingComplete: true }
            : question;
        })
        .map((question, index) => ({
          question,
          index,
          rank: audioRanks.has(question.audioUrl) ? audioRanks.get(question.audioUrl)! : Number.MAX_SAFE_INTEGER,
        }))
        .sort((left, right) => left.rank - right.rank || left.index - right.index)
        .map(({ question }) => question);
      return [pageNumber, { ...page, questions }];
    }),
  ) as Record<number, PageQuizData>;
}

const TILAWATI_JILID_1_PAGES = applyTimelineEdits(1, applyQuizEdits(1, groupJilid1Footers(RAW_TILAWATI_JILID_1_PAGES)));
const TILAWATI_JILID_2_PAGES = applyTimelineEdits(2, applyQuizEdits(2, groupDatasetByAudioRows(2, RAW_TILAWATI_JILID_2_PAGES)));
const TILAWATI_JILID_3_PAGES = applyTimelineEdits(3, applyQuizEdits(3, groupDatasetByAudioRows(3, RAW_TILAWATI_JILID_3_PAGES)));
const TILAWATI_JILID_4_PAGES = applyTimelineEdits(4, applyQuizEdits(4, groupDatasetByAudioRows(4, RAW_TILAWATI_JILID_4_PAGES)));
const TILAWATI_JILID_5_PAGES = applyTimelineEdits(5, applyQuizEdits(5, groupDatasetByAudioRows(5, RAW_TILAWATI_JILID_5_PAGES)));

export type { QuizQuestion, PageQuizData } from "./tilawatiQuizTypes";

export {
  TILAWATI_JILID_1_PAGES,
  TILAWATI_JILID_2_PAGES,
  TILAWATI_JILID_3_PAGES,
  TILAWATI_JILID_4_PAGES,
  TILAWATI_JILID_5_PAGES,
  TILAWATI_JILID_6_PAGES,
};
