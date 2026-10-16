import { useCallback } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState, useTicker } from "../../_shared/hooks";
import { useLeaderboardRecord, useNgajiProgress } from "../../_shared/progression";
import type { GamePhase } from "../../_shared/types";
import { TETROMINOES, type TetrominoTemplate } from "../data/tetrominoes";

export const TETRIS_WIDTH = 8;
export const TETRIS_HEIGHT = 16;

export interface TetrisCell { label: string; color: string }
export interface ActiveTetromino extends TetrominoTemplate { x: number; y: number }

interface TetrisState {
  phase: GamePhase;
  board: (TetrisCell | null)[][];
  piece: ActiveTetromino | null;
  next: TetrominoTemplate;
  score: number;
  lines: number;
  level: number;
  dropElapsed: number;
  feedback: string;
}

const emptyBoard = () => Array.from({ length: TETRIS_HEIGHT }, () => Array<TetrisCell | null>(TETRIS_WIDTH).fill(null));
const randomTemplate = () => TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
const spawn = (template: TetrominoTemplate): ActiveTetromino => ({ ...template, shape: template.shape.map((row) => [...row]), x: Math.floor((TETRIS_WIDTH - template.shape[0].length) / 2), y: 0 });
const initial = (): TetrisState => ({ phase: "idle", board: emptyBoard(), piece: null, next: randomTemplate(), score: 0, lines: 0, level: 1, dropElapsed: 0, feedback: "Susun blok dan kenali hukum tajwid yang jatuh." });

function canPlace(board: (TetrisCell | null)[][], piece: ActiveTetromino, x = piece.x, y = piece.y, shape = piece.shape) {
  for (let row = 0; row < shape.length; row += 1) {
    for (let column = 0; column < shape[row].length; column += 1) {
      if (!shape[row][column]) continue;
      const boardX = x + column;
      const boardY = y + row;
      if (boardX < 0 || boardX >= TETRIS_WIDTH || boardY >= TETRIS_HEIGHT) return false;
      if (boardY >= 0 && board[boardY][boardX]) return false;
    }
  }
  return true;
}

function rotated(shape: number[][]) {
  return Array.from({ length: shape[0].length }, (_, row) => Array.from({ length: shape.length }, (_, column) => shape[shape.length - 1 - column][row]));
}

function lockPiece(state: TetrisState, piece: ActiveTetromino): TetrisState {
  const board = state.board.map((row) => [...row]);
  for (let row = 0; row < piece.shape.length; row += 1) {
    for (let column = 0; column < piece.shape[row].length; column += 1) {
      if (!piece.shape[row][column]) continue;
      const boardX = piece.x + column;
      const boardY = piece.y + row;
      if (boardY < 0) return { ...state, phase: "gameover", piece: null, feedback: "Papan penuh. Ulangi dan kenali hukum bacaannya." };
      board[boardY][boardX] = { label: piece.label, color: piece.color };
    }
  }

  const cleared = board.filter((row) => row.every(Boolean)).length;
  const compacted = board.filter((row) => !row.every(Boolean));
  while (compacted.length < TETRIS_HEIGHT) compacted.unshift(Array<TetrisCell | null>(TETRIS_WIDTH).fill(null));
  const lines = state.lines + cleared;
  const level = Math.floor(lines / 8) + 1;
  const score = state.score + (cleared ? [0, 100, 300, 500, 800][cleared] * state.level : 0);
  const nextPiece = spawn(state.next);
  const phase = canPlace(compacted, nextPiece) ? "playing" : "gameover";
  if (cleared) playSfx(cleared >= 2 ? "powerup" : "correct"); else playSfx("pop");
  return { ...state, board: compacted, piece: phase === "playing" ? nextPiece : null, next: randomTemplate(), score, lines, level, dropElapsed: 0, phase, feedback: cleared ? `${cleared} baris bersih! Blok berikutnya: ${nextPiece.label} · ${nextPiece.rule}` : `Blok ${piece.label} terkunci. ${piece.rule}` };
}

export function useTajwidTetris() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("tajwid-tetris", state.phase, state.score);
  const progress = useNgajiProgress();
  const leaderboard = useLeaderboardRecord("tajwid-tetris");

  const start = useCallback(() => update(() => {
    const piece = spawn(randomTemplate());
    playSfx("pop");
    return { ...initial(), phase: "playing", piece };
  }), [update]);
  const pause = useCallback(() => update((current) => current.phase === "playing" ? { ...current, phase: "paused" } : current), [update]);
  const resume = useCallback(() => update((current) => current.phase === "paused" ? { ...current, phase: "playing" } : current), [update]);

  const move = useCallback((direction: -1 | 1) => update((current) => {
    if (current.phase !== "playing" || !current.piece) return current;
    const x = current.piece.x + direction;
    return canPlace(current.board, current.piece, x) ? { ...current, piece: { ...current.piece, x } } : current;
  }), [update]);

  const rotate = useCallback(() => update((current) => {
    if (current.phase !== "playing" || !current.piece) return current;
    const shape = rotated(current.piece.shape);
    for (const offset of [0, -1, 1, -2, 2]) {
      if (canPlace(current.board, current.piece, current.piece.x + offset, current.piece.y, shape)) return { ...current, piece: { ...current.piece, shape, x: current.piece.x + offset } };
    }
    return current;
  }), [update]);

  const drop = useCallback((hard: boolean) => update((current) => {
    if (current.phase !== "playing" || !current.piece) return current;
    let piece = current.piece;
    if (hard) {
      while (canPlace(current.board, piece, piece.x, piece.y + 1)) piece = { ...piece, y: piece.y + 1 };
      return lockPiece({ ...current, piece }, piece);
    }
    if (canPlace(current.board, piece, piece.x, piece.y + 1)) return { ...current, piece: { ...piece, y: piece.y + 1 }, score: current.score + 1 };
    return lockPiece(current, piece);
  }), [update]);

  useTicker(state.phase === "playing", (delta) => update((current) => {
    if (current.phase !== "playing" || !current.piece) return current;
    const interval = Math.max(0.18, 0.72 - (current.level - 1) * 0.045);
    const elapsed = current.dropElapsed + delta;
    if (elapsed < interval) return { ...current, dropElapsed: elapsed };
    if (canPlace(current.board, current.piece, current.piece.x, current.piece.y + 1)) return { ...current, piece: { ...current.piece, y: current.piece.y + 1 }, dropElapsed: elapsed - interval };
    return lockPiece({ ...current, dropElapsed: 0 }, current.piece);
  }));

  return { ...state, ...record, progress, leaderboard, start, pause, resume, move, rotate, drop };
}
