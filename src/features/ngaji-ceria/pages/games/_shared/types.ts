export type GamePhase = "idle" | "playing" | "paused" | "gameover";
export type GameAccent = "cyan" | "violet" | "pink" | "emerald";

export const ACCENTS = {
  cyan: { text: "text-cyan-300", button: "bg-cyan-500", background: "from-slate-950 to-slate-900", border: "border-cyan-400/30" },
  violet: { text: "text-violet-300", button: "bg-violet-500", background: "from-[#1E1B4B] to-[#312E81]", border: "border-violet-400/30" },
  pink: { text: "text-pink-300", button: "bg-pink-500", background: "from-[#2A0E2E] to-[#4C1D95]", border: "border-pink-400/30" },
  emerald: { text: "text-emerald-300", button: "bg-emerald-500", background: "from-[#052E2B] to-[#064E3B]", border: "border-emerald-400/30" },
} as const;

import type { ReactNode } from "react";

export interface GameOverModalProps {
  visible: boolean;
  score: number;
  best: number;
  isNewRecord: boolean;
  onRetry: () => void;
  onExit: () => void;
  accent?: GameAccent;
  title?: string;
  description?: string;
  children?: ReactNode;
  maxCombo?: number;
  victory?: boolean;
  achievementIds?: string[];
}
