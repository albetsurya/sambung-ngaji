export interface TowerDefinition { id: string; name: string; cost: number; damage: number; weakness: string; icon: string }
export const TOWER_DEFINITIONS: TowerDefinition[] = [
  { id: "idgham", name: "Idgham", cost: 50, damage: 12, weakness: "idgham", icon: "إ" },
  { id: "ikhfa", name: "Ikhfa", cost: 75, damage: 9, weakness: "ikhfa", icon: "خ" },
  { id: "iqlab", name: "Iqlab", cost: 100, damage: 16, weakness: "iqlab", icon: "ق" },
  { id: "izhar", name: "Izhar", cost: 125, damage: 13, weakness: "izhar", icon: "ظ" },
  { id: "ghunnah", name: "Ghunnah", cost: 150, damage: 20, weakness: "ghunnah", icon: "غ" },
];
export const WEAKNESSES = ["idgham", "ikhfa", "iqlab", "izhar", "ghunnah"];
