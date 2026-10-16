export const HARAKAT_LIST = [
  { id: "fathah", name: "Fathah", symbol: "بَ", sound: "a" },
  { id: "kasrah", name: "Kasrah", symbol: "بِ", sound: "i" },
  { id: "dhammah", name: "Dhammah", symbol: "بُ", sound: "u" },
  { id: "sukun", name: "Sukun", symbol: "بْ", sound: "mati" },
  { id: "fathatain", name: "Fathatain", symbol: "بً", sound: "an" },
  { id: "kasratain", name: "Kasratain", symbol: "بٍ", sound: "in" },
  { id: "dhammatain", name: "Dhammatain", symbol: "بٌ", sound: "un" },
] as const;
export type HarakatId = typeof HARAKAT_LIST[number]["id"];
export type PowerUpType = "magnet" | "slowmo" | "shield";
export const POWER_UP_LABELS = { magnet: "Magnet", slowmo: "Gerak lambat", shield: "Perisai" };
