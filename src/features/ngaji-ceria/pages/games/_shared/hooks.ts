import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBest, setBest } from "./storage";
import { playSfx } from "./audio";
import type { GamePhase } from "./types";

export const GAME_HUB_PARENTS: Record<string, string> = {
  "/member/ngaji-ceria/games/harakat-rush": "/member/ngaji-ceria/games/ritme-ngaji",
  "/member/ngaji-ceria/games/makhraj-master": "/member/ngaji-ceria/games/ritme-ngaji",
  "/member/ngaji-ceria/games/hijaiyah-beats": "/member/ngaji-ceria/games/ritme-ngaji",

  "/member/ngaji-ceria/games/juz-amma-speedrun": "/member/ngaji-ceria/games/quiz-ngaji",
  "/member/ngaji-ceria/games/quran-quiz-royale": "/member/ngaji-ceria/games/quiz-ngaji",
  "/member/ngaji-ceria/games/nur-battle": "/member/ngaji-ceria/games/quiz-ngaji",

  "/member/ngaji-ceria/games/arabic-wordle": "/member/ngaji-ceria/games/puzzle-huruf",
  "/member/ngaji-ceria/games/ayat-scramble": "/member/ngaji-ceria/games/puzzle-huruf",
  "/member/ngaji-ceria/games/hijaiyah-2048": "/member/ngaji-ceria/games/puzzle-huruf",
  "/member/ngaji-ceria/games/ayat-hunter": "/member/ngaji-ceria/games/puzzle-huruf",

  "/member/ngaji-ceria/games/tajwid-arena": "/member/ngaji-ceria/games/tajwid-lab",
  "/member/ngaji-ceria/games/tajwid-defense": "/member/ngaji-ceria/games/tajwid-lab",
  "/member/ngaji-ceria/games/tajwid-tetris": "/member/ngaji-ceria/games/tajwid-lab",
};

export function getGameParentHub(pathname: string): string {
  return GAME_HUB_PARENTS[pathname] || "/member/ngaji-ceria/games";
}

export function useGameExit() {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    navigate(getGameParentHub(location.pathname));
  }, [navigate, location.pathname]);
}

/** Ref sinkron mencegah tap ganda; reducer tidak dijalankan ulang oleh StrictMode. */
export function useGameState<T>(initial: () => T) {
  const [state, setState] = useState(initial);
  const stateRef = useRef(state);
  const update = useCallback((change: (current: T) => T) => {
    const next = change(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);
  return { state, stateRef, update };
}

/** Waktu berdasarkan elapsed time; interval dan feedback berhenti saat pause. */
export function useTicker(active: boolean, tick: (seconds: number) => void, interval = 100) {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  useEffect(() => {
    if (!active) return;
    let previous = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      tickRef.current((now - previous) / 1000);
      previous = now;
    }, interval);
    return () => window.clearInterval(id);
  }, [active, interval]);
}

export function useBestScore(gameId: string, phase: GamePhase, score: number) {
  const [baseline, setBaseline] = useState(() => getBest(gameId));
  useEffect(() => { if (phase !== "gameover") setBaseline(getBest(gameId)); }, [gameId, phase]);
  useEffect(() => {
    if (phase === "gameover") {
      setBest(gameId, score);
    }
  }, [gameId, phase, score]);
  return { best: phase === "gameover" ? Math.max(baseline, score) : baseline, isNewRecord: phase === "gameover" && score > baseline };
}
