import { HIJAIYAH_LIST } from "../../../../data/hijaiyah";

export const RUNNER_LETTERS = HIJAIYAH_LIST.map((item) => ({ id: item.id, letter: item.arabic, name: item.name }));
export type RunnerLetter = (typeof RUNNER_LETTERS)[number];
export type RunnerItemKind = "letter" | "obstacle";

export function randomRunnerTarget(except?: string): RunnerLetter {
  const choices = RUNNER_LETTERS.filter((item) => item.letter !== except);
  return choices[Math.floor(Math.random() * choices.length)];
}
