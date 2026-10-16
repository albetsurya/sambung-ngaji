import { useCallback, useEffect } from "react";
import { playSfx } from "../../_shared/audio";
import { useBestScore, useGameState } from "../../_shared/hooks";
import { shuffle } from "../../_shared/random";
import type { GamePhase } from "../../_shared/types";
import type { BattleAttack } from "../../_shared/battle/types";
import { TAJWID_CARDS, type TajwidCard } from "../data/cards";
import { TAJWID_QUESTIONS } from "../data/questions";

type Turn = "question" | "card" | "ai" | "reward" | "path";
interface ArenaState {
  phase: GamePhase; playerHp: number; aiHp: number; aiMaxHp: number; energy: number;
  deck: TajwidCard[]; hand: TajwidCard[]; turn: Turn; questionIndex: number;
  selectedAnswer: number | null; answerStatus: "idle" | "correct" | "wrong";
  log: string[]; shield: number; double: boolean; wins: number; elite: boolean;
  rewards: TajwidCard[]; attack: BattleAttack | null; difficulty: "easy" | "normal" | "hard";
}
const initial = (): ArenaState => ({ phase: "idle", playerHp: 100, aiHp: 100, aiMaxHp: 100, energy: 3,
  deck: [...TAJWID_CARDS], hand: [], turn: "question", questionIndex: 0, selectedAnswer: null,
  answerStatus: "idle", log: ["Susun deck dan taklukkan tiga arena."], shield: 0, double: false,
  wins: 0, elite: false, rewards: [], attack: null, difficulty: "normal" });
const question = (index: number) => TAJWID_QUESTIONS[index % TAJWID_QUESTIONS.length];

export function useTajwidArena() {
  const { state, update } = useGameState(initial);
  const record = useBestScore("tajwid-arena", state.phase, state.wins * 500);
  const start = useCallback(() => update((s) => {
    playSfx("pop");
    return { ...initial(), phase: "playing", deck: s.deck, hand: shuffle(s.deck).slice(0, 4), difficulty: s.difficulty };
  }), [update]);
  const toggleCard = useCallback((id: string) => update((s) => {
    if (s.phase !== "idle") return s;
    const exists = s.deck.some((card) => card.id === id);
    if (exists && s.deck.length <= 3) return s;
    return { ...s, deck: exists ? s.deck.filter((card) => card.id !== id) : [...s.deck, TAJWID_CARDS.find((card) => card.id === id)!] };
  }), [update]);
  const setDifficulty = useCallback((difficulty: ArenaState["difficulty"]) => update((s) => s.phase === "idle" ? { ...s, difficulty } : s), [update]);
  const pause = useCallback(() => update((s) => s.phase === "playing" ? { ...s, phase: "paused" } : s), [update]);
  const resume = useCallback(() => update((s) => s.phase === "paused" ? { ...s, phase: "playing" } : s), [update]);
  const answer = useCallback((index: number) => update((s) => {
    if (s.phase !== "playing" || s.turn !== "question") return s;
    const correct = index === question(s.questionIndex).correct;
    const playerHp = Math.max(0, s.playerHp - (correct ? 0 : 5));
    playSfx(correct ? "correct" : "wrong");
    const draw = shuffle(s.deck)[0];
    return { ...s, playerHp, selectedAnswer: index, answerStatus: correct ? "correct" : "wrong",
      hand: s.hand.length < 7 ? [...s.hand, draw] : s.hand, energy: correct ? 3 : 2, turn: "card",
      phase: playerHp === 0 ? "gameover" : "playing", log: [correct ? "Jawaban benar: 3 energy dan satu kartu." : "Jawaban salah: −5 HP, 2 energy.", ...s.log].slice(0, 5) };
  }), [update]);
  const endTurn = useCallback(() => update((s) => s.phase === "playing" && s.turn === "card" ? { ...s, turn: "ai" } : s), [update]);
  const playCard = useCallback((id: string) => update((s) => {
    if (s.phase !== "playing" || s.turn !== "card") return s;
    const index = s.hand.findIndex((card) => card.id === id);
    const card = s.hand[index];
    if (!card || s.energy < card.energy) return s;
    const hand = s.hand.filter((_, i) => i !== index);
    const damage = card.damage * (s.double ? 2 : 1);
    const aiHp = Math.max(0, s.aiHp - damage);
    const wins = s.wins + (aiHp === 0 ? 1 : 0);
    playSfx(aiHp === 0 ? "combo" : "pop");
    return { ...s, hand, aiHp, wins, energy: s.energy - card.energy,
      playerHp: card.effect === "heal" ? Math.min(100, s.playerHp + 20) : s.playerHp,
      shield: card.effect === "shield" ? s.shield + 15 : s.shield,
      double: card.effect === "double" ? true : damage > 0 ? false : s.double,
      attack: damage > 0 ? { id: (s.attack?.id ?? 0) + 1, attacker: "player", damage } : s.attack,
      turn: aiHp === 0 ? "reward" : "card", rewards: aiHp === 0 ? shuffle(TAJWID_CARDS).slice(0, 3) : s.rewards,
      phase: wins >= 3 ? "gameover" : "playing", log: [`${card.name}: ${damage} damage${card.effect ? ` · ${card.effect}` : ""}.`, ...s.log].slice(0, 5) };
  }), [update]);
  const claimReward = useCallback((id: string) => update((s) => {
    if (s.phase !== "playing" || s.turn !== "reward") return s;
    const card = s.rewards.find((item) => item.id === id);
    return card ? { ...s, deck: [...s.deck, card], turn: "path", rewards: [], log: [`${card.name} ditambahkan ke deck.`, ...s.log] } : s;
  }), [update]);
  const choosePath = useCallback((path: "rest" | "treasure" | "elite") => update((s) => {
    if (s.phase !== "playing" || s.turn !== "path") return s;
    const deck = path === "treasure" ? [...s.deck, shuffle(TAJWID_CARDS)[0]] : s.deck;
    const aiMaxHp = path === "elite" ? 130 : 100;
    return { ...s, deck, hand: shuffle(deck).slice(0, 4), aiHp: aiMaxHp, aiMaxHp,
      playerHp: path === "rest" ? Math.min(100, s.playerHp + 30) : s.playerHp,
      elite: path === "elite", turn: "question", shield: 0, attack: null,
      questionIndex: s.questionIndex + 1, selectedAnswer: null, answerStatus: "idle" };
  }), [update]);
  useEffect(() => {
    if (state.phase !== "playing" || state.turn !== "ai") return;
    const timeout = window.setTimeout(() => update((s) => {
      if (s.phase !== "playing" || s.turn !== "ai") return s;
      const raw = (s.difficulty === "easy" ? 8 : s.difficulty === "hard" ? 18 : 12) + (s.elite ? 5 : 0);
      const damage = Math.max(0, raw - s.shield);
      const playerHp = Math.max(0, s.playerHp - damage);
      playSfx("wrong");
      return { ...s, playerHp, shield: Math.max(0, s.shield - raw), questionIndex: s.questionIndex + 1,
        turn: "question", selectedAnswer: null, answerStatus: "idle", energy: 3,
        attack: { id: (s.attack?.id ?? 0) + 1, attacker: "monster", damage },
        phase: playerHp === 0 ? "gameover" : "playing", log: [`Lawan menyerang: ${damage} damage.`, ...s.log].slice(0, 5) };
    }), 900);
    return () => window.clearTimeout(timeout);
  }, [state.phase, state.turn, update]);
  return { ...state, ...record, score: state.wins * 500, currentQuestion: question(state.questionIndex), start,
    toggleCard, setDifficulty, pause, resume, answer, playCard, endTurn, claimReward, choosePath };
}
