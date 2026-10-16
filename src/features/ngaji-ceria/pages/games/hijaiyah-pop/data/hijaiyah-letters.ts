import { HIJAIYAH_LIST } from "../../../../data/hijaiyah";
export const HIJAIYAH_LETTERS = HIJAIYAH_LIST.map(({ id, arabic, name }) => ({ id, letter: arabic, name }));
export function pickTarget(except?: string) {
  const choices = HIJAIYAH_LETTERS.filter((item) => item.letter !== except);
  return choices[Math.floor(Math.random() * choices.length)];
}
