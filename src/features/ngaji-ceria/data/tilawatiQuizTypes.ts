/** Tipe bersama untuk dataset kuis Tilawati. */
export interface QuizQuestion {
  id: number | string;
  arabic: string;
  transliterationParts: string[];
  options: string[];
  hintTone: string;
  audioUrl: string;
  /** True when the question has already been aligned to a final audio unit. */
  audioMappingComplete?: boolean;
  isOpening?: boolean;
  isListenOnly?: boolean;
  correctOptionIndex?: number;
}

export interface PageQuizData {
  pageNumber: number;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
}
