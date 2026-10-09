export interface TajwidCard { id: string; name: string; damage: number; energy: number; effect?: "heal" | "shield" | "double"; icon: string }
export const TAJWID_CARDS: TajwidCard[] = [
  { id: "idgham", name: "Idgham", damage: 18, energy: 1, icon: "إ" },
  { id: "ikhfa", name: "Ikhfa", damage: 25, energy: 2, icon: "خ" },
  { id: "iqlab", name: "Iqlab", damage: 32, energy: 3, effect: "double", icon: "ق" },
  { id: "izhar", name: "Izhar", damage: 0, energy: 1, effect: "shield", icon: "ظ" },
  { id: "ghunnah", name: "Ghunnah", damage: 0, energy: 2, effect: "heal", icon: "غ" },
];
