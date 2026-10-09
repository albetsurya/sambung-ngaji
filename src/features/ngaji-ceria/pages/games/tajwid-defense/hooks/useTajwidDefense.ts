import { useCallback, useEffect } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { TOWER_DEFINITIONS, WEAKNESSES, type TowerDefinition } from "../data/towers";

interface Tower { id: string; definition: TowerDefinition; slot: number; level: number }
interface Enemy { id: string; weakness: string; hp: number; maxHp: number; progress: number; speed: number }
interface DefenseState { phase: GamePhase; wave: number; hp: number; gold: number; score: number; towers: Tower[]; enemies: Enemy[]; selectedTower: string; spawnLeft: number; spawned: number; log: string }
const initial = (): DefenseState => ({ phase: "idle", wave: 1, hp: 20, gold: 100, score: 0, towers: [], enemies: [], selectedTower: "idgham", spawnLeft: 0.5, spawned: 0, log: "Pilih menara, lalu pasang di slot kosong." });
export function useTajwidDefense() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("tajwid-defense", state.phase, state.score);
  const start = useCallback(() => { playSfx("pop"); update(() => ({ ...initial(), phase: "playing" })); }, [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const selectTower = useCallback((id: string) => update((s) => s.phase === "playing" ? { ...s, selectedTower: id } : s), [update]);
  const placeTower = useCallback((slot: number) => update((s) => { if (s.phase !== "playing" || s.towers.some((tower) => tower.slot === slot)) return s; const definition = TOWER_DEFINITIONS.find((tower) => tower.id === s.selectedTower); if (!definition || s.gold < definition.cost) return { ...s, log: "Gold belum cukup untuk menara itu." }; playSfx("pop"); return { ...s, gold: s.gold - definition.cost, towers: [...s.towers, { id: `${definition.id}-${slot}`, definition, slot, level: 1 }], log: `${definition.name} dipasang di slot ${slot + 1}.` }; }), [update]);
  useEffect(() => {
    if (state.phase !== "playing") return;
    const id = window.setInterval(() => update((s) => {
      if (s.phase !== "playing") return s;
      let hp = s.hp; let gold = s.gold; let score = s.score;
      let enemies = s.enemies.map((enemy) => ({ ...enemy, progress: enemy.progress + enemy.speed }));
      const escaped = enemies.filter((enemy) => enemy.progress >= 100).length;
      if (escaped) { hp -= escaped; playSfx("wrong"); enemies = enemies.filter((enemy) => enemy.progress < 100); }
      s.towers.forEach((tower) => {
        const target = enemies.find((enemy) => enemy.hp > 0);
        if (!target) return;
        const damage = tower.definition.damage * (target.weakness === tower.definition.weakness ? 2 : 1) * tower.level;
        target.hp -= damage;
      });
      const defeated = enemies.filter((enemy) => enemy.hp <= 0).length;
      if (defeated) { gold += defeated * 15; score += defeated * 50; playSfx("correct"); }
      enemies = enemies.filter((enemy) => enemy.hp > 0);
      let wave = s.wave; let spawned = s.spawned; let spawnLeft = s.spawnLeft - 0.5;
      if (spawnLeft <= 0 && spawned < wave + 2) { const maxHp = 30 + wave * 15; enemies.push({ id: `enemy-${wave}-${spawned}`, weakness: WEAKNESSES[Math.floor(Math.random() * WEAKNESSES.length)], hp: maxHp, maxHp, progress: 0, speed: 1.5 + wave * 0.08 }); spawned++; spawnLeft = Math.max(0.5, 1.3 - wave * 0.04); }
      if (spawned >= wave + 2 && enemies.length === 0) { if (wave >= 10) return { ...s, hp, gold, score, enemies, phase: "gameover", log: "Semua wave selesai. Base aman!" }; wave++; spawned = 0; spawnLeft = 1; }
      return { ...s, hp, gold, score, enemies, wave, spawned, spawnLeft, phase: hp <= 0 ? "gameover" : "playing", log: hp <= 0 ? "Base jebol. Coba atur menara lebih tepat." : s.log };
    }), 500);
    return () => window.clearInterval(id);
  }, [state.phase, update]);
  return { ...state, ...record, towers: state.towers, start, pause, resume, selectTower, placeTower };
}
