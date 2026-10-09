import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { ENDINGS, STORY_NODES, type StoryStats } from "../data/story";

interface RPGState { phase: GamePhase; nodeId: string; stats: StoryStats; score: number; ending: keyof typeof ENDINGS | null; choices: number }
const initial = (): RPGState => ({ phase: "idle", nodeId: "start", stats: { akhlak: 0, ilmu: 0, sosial: 0 }, score: 0, ending: null, choices: 0 });
function endingFor(stats: StoryStats): keyof typeof ENDINGS { const total = stats.akhlak + stats.ilmu + stats.sosial; if (total >= 15 && stats.akhlak >= 0 && stats.ilmu >= 0 && stats.sosial >= 0) return "bijak"; if (total >= 10) return "baik"; if (total < 0) return "buruk"; return "netral"; }

export function useAdabRPG() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("adab-rpg", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing" })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const choose = useCallback((choiceId: string) => update((s) => {
    if (s.phase !== "playing") return s;
    const node = STORY_NODES.find((item) => item.id === s.nodeId);
    const choice = node?.choices.find((item) => item.id === choiceId);
    if (!choice) return s;
    const stats = { akhlak: s.stats.akhlak + (choice.delta.akhlak ?? 0), ilmu: s.stats.ilmu + (choice.delta.ilmu ?? 0), sosial: s.stats.sosial + (choice.delta.sosial ?? 0) };
    if (choice.next !== "ending") { playSfx("correct"); return { ...s, nodeId: choice.next, stats, choices: s.choices + 1 }; }
    const ending = endingFor(stats);
    const score = Math.max(0, (stats.akhlak + stats.ilmu + stats.sosial) * 50);
    playSfx(ending === "buruk" ? "wrong" : "gameover");
    return { ...s, stats, score, ending, choices: s.choices + 1, phase: "gameover" };
  }), [update]);
  return { ...state, ...record, node: STORY_NODES.find((node) => node.id === state.nodeId) ?? STORY_NODES[0], endingData: state.ending ? ENDINGS[state.ending] : null, start, pause, resume, choose };
}
