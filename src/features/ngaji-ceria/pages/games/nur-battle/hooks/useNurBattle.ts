import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { shuffleQuestions, type Question } from "../../juz-amma-speedrun/data/juz-amma-questions";

interface Player { id: string; name: string; alive: boolean; score: number; lives: number }
interface BattleState { phase: GamePhase; questions: Question[]; currentIndex: number; score: number; lives: number; timeLeft: number; selected: number | null; status: "idle" | "correct" | "wrong" | "timeout"; feedbackLeft: number; players: Player[]; rank: number; secondChanceUsed: boolean }
const initial = (): BattleState => ({ phase: "idle", questions: [], currentIndex: 0, score: 0, lives: 3, timeLeft: 10, selected: null, status: "idle", feedbackLeft: 0, players: ["Kamu", "Alya", "Rafi", "Naila"].map((name, index) => ({ id: `nur-${index}`, name, alive: true, score: 0, lives: 3 })), rank: 4, secondChanceUsed: false });
function resolve(s: BattleState, index: number | null, timeout = false): BattleState { const q = s.questions[s.currentIndex]; if (!q || s.phase !== "playing" || s.status !== "idle") return s; const correct = !timeout && index === q.correctIndex; const lives = correct ? s.lives : s.lives - 1; const players = s.players.map((player, playerIndex) => { if (playerIndex === 0) return { ...player, lives, alive: lives > 0, score: player.score + (correct ? 100 : 0) }; if (!player.alive) return player; const botCorrect = Math.random() > 0.25; const botLives = botCorrect ? player.lives : player.lives - 1; return { ...player, lives: botLives, alive: botLives > 0, score: player.score + (botCorrect ? 100 : 0) }; }); playSfx(correct ? "correct" : "wrong"); return { ...s, selected: index, status: timeout ? "timeout" : correct ? "correct" : "wrong", feedbackLeft: 1, lives, score: s.score + (correct ? Math.round(100 + s.timeLeft * 5) : 0), players, rank: 1 + players.filter((player) => player.alive && player.score > s.score).length };
}
export function useNurBattle() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("nur-battle", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing", questions: shuffleQuestions() })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const answer = useCallback((index: number) => update((s) => resolve(s, index)), [update]);
  useTicker(state.phase === "playing", (delta) => update((s) => {
    if (s.phase !== "playing") return s;
    if (s.status !== "idle") { const left = s.feedbackLeft - delta; if (left > 0) return { ...s, feedbackLeft: left }; if (s.lives <= 0 || s.currentIndex + 1 >= s.questions.length) return { ...s, phase: "gameover", feedbackLeft: 0 }; return { ...s, currentIndex: s.currentIndex + 1, timeLeft: 10, selected: null, status: "idle", feedbackLeft: 0 }; }
    const timeLeft = Math.max(0, s.timeLeft - delta);
    return timeLeft === 0 ? resolve({ ...s, timeLeft }, null, true) : { ...s, timeLeft };
  }));
  const revive = useCallback(() => update((current) => current.phase === "gameover" && current.lives <= 0 && !current.secondChanceUsed
    ? { ...current, phase: "playing", lives: 1, timeLeft: 10, selected: null, status: "idle", feedbackLeft: 0, secondChanceUsed: true }
    : current), [update]);
  return { ...state, ...record, currentQuestion: state.questions[state.currentIndex], start, pause, resume, answer, revive, canSecondChance: state.lives <= 0 && !state.secondChanceUsed, alivePlayers: state.players.filter((player) => player.alive).length, round: state.currentIndex < 5 ? 1 : state.currentIndex < 8 ? 2 : 3 };
}
