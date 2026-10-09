import { useCallback, useEffect } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import type { GamePhase } from "../../_shared/types";
import { HIJAIYAH_LIST } from "../../../../data/hijaiyah";

export type Direction = "left" | "right" | "up" | "down";
export interface Tile { id: string; level: number }
export type Grid = (Tile | null)[][];
/** Pergerakan satu tile untuk animasi geser: dari sel asal ke sel tujuan. */
export interface TileMove { id: string; fromRow: number; fromCol: number; toRow: number; toCol: number; merged: boolean }
/** Tile yang terserap merge — dirender sebagai ghost yang meluncur ke titik gabung lalu memudar. */
export interface MergeGhost { id: string; level: number; fromRow: number; fromCol: number; toRow: number; toCol: number }
interface GameState { phase: GamePhase; grid: Grid; score: number; highest: number; moves: number; lastMerge: number | null; moveId: number; mergedIds: string[]; spawnedId: string | null; ghosts: MergeGhost[] }
const SIZE = 4;
const emptyGrid = (): Grid => Array.from({ length: SIZE }, () => Array<Tile | null>(SIZE).fill(null));
const initial = (): GameState => ({ phase: "idle", grid: emptyGrid(), score: 0, highest: 0, moves: 0, lastMerge: null, moveId: 0, mergedIds: [], spawnedId: null, ghosts: [] });
let tileSequence = 0;
const newTile = (level = 0): Tile => ({ id: `h2048-${++tileSequence}`, level });

function addRandomTile(grid: Grid): { grid: Grid; id: string | null } {
  const empty: [number, number][] = [];
  grid.forEach((row, rowIndex) => row.forEach((tile, columnIndex) => { if (!tile) empty.push([rowIndex, columnIndex]); }));
  if (!empty.length) return { grid, id: null };
  const [row, column] = empty[Math.floor(Math.random() * empty.length)];
  const next = grid.map((line) => [...line]);
  const tile = newTile(Math.random() < 0.9 ? 0 : 1);
  next[row][column] = tile;
  return { grid: next, id: tile.id };
}

function readLine(grid: Grid, index: number, direction: Direction): (Tile | null)[] {
  if (direction === "left" || direction === "right") return [...grid[index]];
  return grid.map((row) => row[index]);
}
function writeLine(grid: Grid, index: number, direction: Direction, line: (Tile | null)[]): void {
  if (direction === "left") { grid[index] = line; return; }
  if (direction === "right") { grid[index] = [...line].reverse(); return; }
  line.forEach((tile, row) => { grid[row][index] = tile; });
}

export function moveGrid(source: Grid, direction: Direction): { grid: Grid; changed: boolean; gained: number; highest: number; mergedIds: string[]; moves: TileMove[] } {
  const grid = emptyGrid();
  let changed = false;
  let gained = 0;
  let highest = 0;
  const mergedIds: string[] = [];
  const moves: TileMove[] = [];
  const horizontal = direction === "left" || direction === "right";
  for (let index = 0; index < SIZE; index++) {
    const raw = readLine(source, index, direction);
    const reverse = direction === "right" || direction === "down";
    const entries = (reverse ? [...raw].reverse() : raw)
      .map((tile, origPos) => ({ tile, origPos }))
      .filter((entry): entry is { tile: Tile; origPos: number } => entry.tile !== null);
    const placed: (Tile | null)[] = [];
    const placedSources: { tile: Tile; origPos: number }[][] = [];
    for (let cursor = 0; cursor < entries.length; cursor++) {
      const current = entries[cursor];
      const next = entries[cursor + 1];
      if (next && next.tile.level === current.tile.level) {
        const level = current.tile.level + 1;
        const fresh = newTile(level);
        mergedIds.push(fresh.id);
        placed.push(fresh);
        placedSources.push([current, next]);
        gained += 2 ** (level + 1);
        highest = Math.max(highest, level);
        cursor++;
      } else {
        placed.push(current.tile);
        placedSources.push([current]);
        highest = Math.max(highest, current.tile.level);
      }
    }
    while (placed.length < SIZE) placed.push(null);
    placed.forEach((tile, targetPos) => {
      if (!tile) return;
      const sources = placedSources[targetPos] ?? [];
      const along = reverse ? SIZE - 1 - targetPos : targetPos;
      const toRow = horizontal ? index : along;
      const toCol = horizontal ? along : index;
      sources.forEach((source) => {
        const fromAlong = reverse ? SIZE - 1 - source.origPos : source.origPos;
        moves.push({
          id: source.tile.id,
          fromRow: horizontal ? index : fromAlong,
          fromCol: horizontal ? fromAlong : index,
          toRow,
          toCol,
          merged: sources.length > 1,
        });
      });
    });
    const original = reverse ? [...raw].reverse() : raw;
    if (placed.some((tile, tileIndex) => tile?.level !== original[tileIndex]?.level || Boolean(tile) !== Boolean(original[tileIndex]))) changed = true;
    // writeLine membalik sendiri untuk arah kanan, tapi menulis langsung untuk arah bawah —
    // jadi untuk garis vertikal yang dibalik, kita yang membalik dulu ke orientasi aktual.
    writeLine(grid, index, direction, !horizontal && reverse ? [...placed].reverse() : placed);
  }
  return { grid, changed, gained, highest, mergedIds, moves };
}

export function canMove(grid: Grid): boolean {
  for (let row = 0; row < SIZE; row++) for (let column = 0; column < SIZE; column++) {
    const tile = grid[row][column];
    if (!tile) return true;
    if (grid[row + 1]?.[column]?.level === tile.level || grid[row]?.[column + 1]?.level === tile.level) return true;
  }
  return false;
}

export function useHijaiyah2048() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("hijaiyah-2048", state.phase, state.score);
  const start = useCallback(() => update(() => { let grid = emptyGrid(); const first = addRandomTile(grid); const second = addRandomTile(first.grid); playSfx("pop"); return { ...initial(), phase: "playing", grid: second.grid, spawnedId: second.id }; }), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const move = useCallback((direction: Direction) => update((s) => {
    if (s.phase !== "playing") return s;
    const result = moveGrid(s.grid, direction);
    if (!result.changed) {
      if (!canMove(s.grid)) return { ...s, phase: "gameover" };
      return s;
    }
    const levels = new Map<string, number>();
    s.grid.flat().forEach((tile) => { if (tile) levels.set(tile.id, tile.level); });
    const ghosts: MergeGhost[] = result.moves
      .filter((entry) => entry.merged)
      .map((entry) => ({ id: `${s.moveId + 1}:${entry.id}`, level: levels.get(entry.id) ?? 0, fromRow: entry.fromRow, fromCol: entry.fromCol, toRow: entry.toRow, toCol: entry.toCol }));
    const spawned = addRandomTile(result.grid);
    const grid = spawned.grid;
    const highest = Math.max(s.highest, result.highest, ...grid.flat().filter((tile): tile is Tile => tile !== null).map((tile) => tile.level));
    playSfx(result.gained ? "combo" : "pop");
    return { ...s, grid, score: s.score + result.gained, highest, moves: s.moves + 1, lastMerge: result.gained || null, moveId: s.moveId + 1, mergedIds: result.mergedIds, spawnedId: spawned.id, ghosts, phase: canMove(grid) ? "playing" : "gameover" };
  }), [update]);
  useEffect(() => {
    if (state.phase !== "playing") return;
    const onKey = (event: KeyboardEvent) => {
      const directions: Record<string, Direction | undefined> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" };
      const direction = directions[event.key];
      if (direction) { event.preventDefault(); move(direction); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.phase, move]);
  return { ...state, ...record, start, pause, resume, move, letters: HIJAIYAH_LIST };
}
