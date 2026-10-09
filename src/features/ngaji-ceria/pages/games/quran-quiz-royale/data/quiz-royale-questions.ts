import { JUZ_AMMA_QUESTIONS, shuffleQuestions as shuffleJuzQuestions, type Question } from "../../juz-amma-speedrun/data/juz-amma-questions";

export { type Question };
export function shuffleQuestions(): Question[] {
  return shuffleJuzQuestions();
}

export const ROYALE_QUESTION_COUNT = Math.min(10, JUZ_AMMA_QUESTIONS.length);
