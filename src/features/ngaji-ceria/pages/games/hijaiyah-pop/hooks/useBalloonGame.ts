import { useCallback, useEffect, useRef } from "react";
import { useBestScore, useGameState } from "../../_shared/hooks";
import { playSfx } from "../../_shared/audio";
import type { GamePhase } from "../../_shared/types";
import { HIJAIYAH_LETTERS, pickTarget } from "../data/hijaiyah-letters";

export interface BalloonData { id: string; letter: string; x: number; y: number; speed: number; isTarget: boolean; popped: boolean; popAge: number; color: number }
interface BalloonState {
  phase: GamePhase; score: number; combo: number; maxCombo: number; lives: number; timeLeft: number;
  target: string; targetName: string; balloons: BalloonData[]; targetLeft: number; correctForTarget: number;
  missedTargets: number; spawnLeft: number; spawned: number; forceTarget: boolean; shakeLeft: number;
}
const initial = (): BalloonState => ({ phase: "idle", score: 0, combo: 0, maxCombo: 0, lives: 3, timeLeft: 60, target: "ا", targetName: "Alif", balloons: [], targetLeft: 5, correctForTarget: 0, missedTargets: 0, spawnLeft: 0.05, spawned: 0, forceTarget: true, shakeLeft: 0 });
function changeTarget(state: BalloonState): BalloonState {
  const target = pickTarget(state.target);
  return { ...state, target: target.letter, targetName: target.name, targetLeft: 5, correctForTarget: 0, forceTarget: true, balloons: state.balloons.map((balloon) => ({ ...balloon, isTarget: balloon.letter === target.letter })) };
}

export function useBalloonGame() {
  const { state, update } = useGameState(initial);
  const fieldRef = useRef<HTMLDivElement>(null);
  const record = useBestScore("hijaiyah-pop", state.phase, state.score);
  const start = useCallback(() => { const target = pickTarget(); playSfx("pop"); update(() => ({ ...initial(), phase: "playing", target: target.letter, targetName: target.name })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const pop = useCallback((id: string) => update((s) => {
    const balloon = s.balloons.find((item) => item.id === id);
    if (s.phase !== "playing" || !balloon || balloon.popped) return s;
    const correct = balloon.letter === s.target;
    const combo = correct ? s.combo + 1 : 0;
    const lives = s.lives - (correct ? 0 : 1);
    playSfx(correct ? combo % 5 === 0 ? "combo" : "correct" : "wrong");
    let next: BalloonState = { ...s, balloons: s.balloons.map((item) => item.id === id ? { ...item, popped: true, popAge: 0 } : item), score: s.score + (correct ? Math.round(100 * Math.min(1 + combo * 0.1, 5)) : 0), combo, maxCombo: Math.max(s.maxCombo, combo), lives, missedTargets: correct ? 0 : s.missedTargets, shakeLeft: correct ? s.shakeLeft : 0.25, correctForTarget: s.correctForTarget + (correct ? 1 : 0), phase: lives <= 0 ? "gameover" : "playing" };
    if (next.correctForTarget >= 3 && next.phase === "playing") next = changeTarget(next);
    return next;
  }), [update]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    let frame = 0; let previous = performance.now();
    const tick = (now: number) => {
      const delta = (now - previous) / 1000; previous = now;
      update((s) => {
        if (s.phase !== "playing") return s;
        const timeLeft = Math.max(0, s.timeLeft - delta);
        if (!timeLeft) return { ...s, timeLeft, phase: "gameover" };
        const height = fieldRef.current?.clientHeight ?? 320;
        const width = fieldRef.current?.clientWidth ?? 320;
        let missedTargets = s.missedTargets; let combo = s.combo;
        const balloons = s.balloons.flatMap((balloon) => {
          if (balloon.popped) return balloon.popAge + delta < 0.2 ? [{ ...balloon, popAge: balloon.popAge + delta }] : [];
          const y = balloon.y - balloon.speed * 60 * delta;
          if (y < -100) {
            if (balloon.isTarget) { missedTargets++; if (missedTargets >= 2) { combo = 0; missedTargets = 0; } }
            return [];
          }
          return [{ ...balloon, y }];
        });
        let next: BalloonState = { ...s, timeLeft, balloons, combo, missedTargets, targetLeft: s.targetLeft - delta, spawnLeft: s.spawnLeft - delta, shakeLeft: Math.max(0, s.shakeLeft - delta) };
        if (next.targetLeft <= 0) next = changeTarget(next);
        if (next.spawnLeft <= 0) {
          const elapsed = 60 - timeLeft;
          const target = next.forceTarget || next.spawned % 3 === 0 || Math.random() < 0.35;
          const choices = HIJAIYAH_LETTERS.filter((item) => item.letter !== next.target);
          const letter = target ? next.target : choices[Math.floor(Math.random() * choices.length)].letter;
          next = { ...next, spawned: next.spawned + 1, spawnLeft: 0.8 - 0.5 * elapsed / 60, forceTarget: false, balloons: [...next.balloons, { id: `balloon-${next.spawned}`, letter, x: Math.random() * Math.max(0, width - 66), y: height + 8, speed: 1.2 + Math.floor(elapsed / 10) * 0.05, isTarget: letter === next.target, popped: false, popAge: 0, color: next.spawned % 3 }] };
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state.phase, update]);
  return { ...state, ...record, fieldRef, start, pause, resume, pop };
}
