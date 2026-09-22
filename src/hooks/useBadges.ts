import { useMemo } from "react";
import type { Streaks } from "../types";

export interface BadgeDef {
  id: string;
  name: string;
  tier: "bronze" | "silver" | "gold";
  category: "sholat" | "dzikir" | "tahfidz" | "quran" | "total";
  minStreak: number;
}

const BADGES: BadgeDef[] = [
  { id: "sholat_7", name: "Pemula Sholat", tier: "bronze", category: "sholat", minStreak: 7 },
  { id: "sholat_30", name: "Konsisten Sholat", tier: "silver", category: "sholat", minStreak: 30 },
  { id: "sholat_100", name: "Sholat Warrior", tier: "gold", category: "sholat", minStreak: 100 },
  { id: "dzikir_7", name: "Pemula Dzikir", tier: "bronze", category: "dzikir", minStreak: 7 },
  { id: "dzikir_30", name: "Dzikir Harian", tier: "silver", category: "dzikir", minStreak: 30 },
  { id: "quran_7", name: "Sahabat Quran", tier: "bronze", category: "quran", minStreak: 7 },
  { id: "quran_30", name: "Khatam Bulanan", tier: "silver", category: "quran", minStreak: 30 },
  { id: "tahfidz_1juz", name: "Hafidz Juz 30", tier: "bronze", category: "tahfidz", minStreak: 1 },
  { id: "tahfidz_5juz", name: "Hafidz 5 Juz", tier: "silver", category: "tahfidz", minStreak: 5 },
  { id: "tahfidz_30juz", name: "Khatam Quran", tier: "gold", category: "tahfidz", minStreak: 30 },
  { id: "total_30", name: "Istiqamah", tier: "gold", category: "total", minStreak: 30 },
];

export interface BadgeState extends BadgeDef {
  unlocked: boolean;
}

export function useBadges(streaks: Streaks) {
  const badges = useMemo<BadgeState[]>(() => {
    return BADGES.map((b) => {
      const value = streaks[b.category as keyof Streaks] ?? 0;
      return { ...b, unlocked: value >= b.minStreak };
    });
  }, [streaks]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  return { badges, unlockedCount, totalCount };
}
