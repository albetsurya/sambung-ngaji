export interface TajwidQuestion { id: string; prompt: string; options: string[]; correct: number; answerCard: string }
// TODO: review oleh ustadz/ustadzah sebelum production.
export const TAJWID_QUESTIONS: TajwidQuestion[] = [
  { id: "t1", prompt: "Hukum nun sukun bertemu ب adalah…", options: ["Iqlab", "Idgham", "Izhar", "Ikhfa"], correct: 0, answerCard: "iqlab" },
  { id: "t2", prompt: "Hukum nun sukun bertemu ي adalah…", options: ["Ikhfa", "Idgham", "Iqlab", "Izhar"], correct: 1, answerCard: "idgham" },
  { id: "t3", prompt: "Hukum nun sukun bertemu ء adalah…", options: ["Izhar", "Ikhfa", "Ghunnah", "Iqlab"], correct: 0, answerCard: "izhar" },
  { id: "t4", prompt: "Hukum nun sukun bertemu ت adalah…", options: ["Idgham", "Izhar", "Ikhfa", "Iqlab"], correct: 2, answerCard: "ikhfa" },
  { id: "t5", prompt: "Dengung pada nun atau mim bertasydid disebut…", options: ["Ghunnah", "Iqlab", "Izhar", "Idgham"], correct: 0, answerCard: "ghunnah" },
  { id: "t6", prompt: "Hukum mim sukun bertemu ب adalah…", options: ["Ikhfa syafawi", "Izhar halqi", "Idgham mimi", "Iqlab"], correct: 0, answerCard: "ikhfa" },
  { id: "t7", prompt: "Meleburkan satu huruf ke huruf setelahnya disebut…", options: ["Izhar", "Idgham", "Ikhfa", "Qalqalah"], correct: 1, answerCard: "idgham" },
  { id: "t8", prompt: "Membaca jelas tanpa dengung disebut…", options: ["Ghunnah", "Ikhfa", "Izhar", "Iqlab"], correct: 2, answerCard: "izhar" },
];
