import { useCallback, useEffect, useRef } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { randomRunnerTarget, RUNNER_LETTERS, type RunnerItemKind } from "../data/runner-data";

export interface RunnerItem { id: string; kind: RunnerItemKind; letter?: string; letterName?: string; lane: 0 | 1 | 2; y: number; speed: number; resolved: boolean }
interface RushState {
  phase: GamePhase; score: number; scoreExact: number; combo: number; maxCombo: number; lives: number;
  distance: number; speed: number; target: string; targetName: string; lane: 0 | 1 | 2;
  jumpTime: number; items: RunnerItem[]; spawnLeft: number; targetHits: number; shakeLeft: number;
}
const JUMP_SECONDS = 0.72;
const PLAYER_LINE = 78;
const initial = (): RushState => ({ phase: "idle", score: 0, scoreExact: 0, combo: 0, maxCombo: 0, lives: 3, distance: 0, speed: 190, target: "ا", targetName: "Alif", lane: 1, jumpTime: 0, items: [], spawnLeft: 0.5, targetHits: 0, shakeLeft: 0 });

export function useHijaiyahRush() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("hijaiyah-rush", state.phase, state.score);
  const start = useCallback(() => { const target = randomRunnerTarget(); playSfx("pop"); update(() => ({ ...initial(), phase: "playing", target: target.letter, targetName: target.name })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const moveLane = useCallback((lane: number) => update((s) => s.phase === "playing" ? { ...s, lane: Math.max(0, Math.min(2, lane)) as 0 | 1 | 2 } : s), [update]);
  const jump = useCallback(() => update((s) => s.phase === "playing" && s.jumpTime <= 0 ? { ...s, jumpTime: JUMP_SECONDS } : s), [update]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") moveLane(state.lane - 1);
      else if (event.key === "ArrowRight") moveLane(state.lane + 1);
      else if (event.key === " " || event.key === "ArrowUp") { event.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, state.lane, moveLane, jump]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      update((s) => {
        if (s.phase !== "playing") return s;
        const speed = 190 + Math.floor(s.distance / 30) * 18;
        const jumpTime = Math.max(0, s.jumpTime - delta);
        const airborne = jumpTime > 0.18;
        let lives = s.lives;
        let combo = s.combo;
        let scoreExact = s.scoreExact + speed * delta * 0.08 * (1 + Math.min(combo * 0.1, 4));
        let targetHits = s.targetHits;
        let shakeLeft = Math.max(0, s.shakeLeft - delta);
        let nextTarget = s.target;
        let nextTargetName = s.targetName;
        const items = s.items.flatMap((item) => {
          if (item.resolved) return [];
          const nextY = item.y + item.speed * delta;
          if (item.y < PLAYER_LINE && nextY >= PLAYER_LINE && item.lane === s.lane) {
            const hit = item.kind === "letter" && item.letter === s.target && airborne;
            const ignoredObstacle = item.kind === "obstacle" && airborne;
            if (hit) {
              combo++;
              targetHits++;
              scoreExact += 80 * Math.min(1 + combo * 0.12, 5);
              playSfx(combo % 5 === 0 ? "combo" : "correct");
              if (targetHits >= 3) {
                const target = randomRunnerTarget(s.target);
                nextTarget = target.letter;
                nextTargetName = target.name;
                targetHits = 0;
              }
            } else if (!ignoredObstacle && item.kind === "letter" && airborne || !ignoredObstacle && item.kind === "obstacle") {
              lives--;
              combo = 0;
              shakeLeft = 0.25;
              playSfx("wrong");
            }
            return [];
          }
          if (nextY > 110) return [];
          return [{ ...item, y: nextY }];
        });
        let spawnLeft = s.spawnLeft - delta;
        let nextItems = items;
        if (spawnLeft <= 0) {
          const targetLane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          const spawnTarget = Math.random() < 0.55;
          const target = spawnTarget ? { letter: s.target, name: s.targetName } : RUNNER_LETTERS[Math.floor(Math.random() * RUNNER_LETTERS.length)];
          const obstacle = Math.random() < 0.18;
          nextItems = [...items, { id: `runner-item-${now}`, kind: obstacle ? "obstacle" : "letter", letter: obstacle ? undefined : target.letter, letterName: obstacle ? undefined : target.name, lane: targetLane, y: -10, speed: 17 + Math.floor(s.distance / 30) * 1.4, resolved: false }];
          spawnLeft = Math.max(0.58, 1.05 - s.distance / 650);
        }
        const nextScore = Math.floor(scoreExact);
        return { ...s, items: nextItems, spawnLeft, jumpTime, speed, distance: s.distance + speed * delta / 10, scoreExact, score: nextScore, combo, maxCombo: Math.max(s.maxCombo, combo), lives, target: nextTarget, targetName: nextTargetName, targetHits, shakeLeft, phase: lives <= 0 ? "gameover" : "playing" };
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.phase, update]);

  return { ...state, ...record, start, pause, resume, moveLane, jump };
}
