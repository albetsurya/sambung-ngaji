import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";

export interface BuildingDefinition { id: string; name: string; baseCost: number; baseRate: number; icon: string; description: string }
export const SANTRI_BUILDINGS: BuildingDefinition[] = [
  { id: "rumah", name: "Rumah Santri", baseCost: 15, baseRate: 0.5, icon: NGAJI_CERIA_ASSETS.buildingRumah, description: "Tempat tinggal dan istirahat santri." },
  { id: "sekolah", name: "Sekolah", baseCost: 100, baseRate: 3, icon: NGAJI_CERIA_ASSETS.buildingKelas, description: "Ruang belajar dan kelas pesantren." },
  { id: "masjid", name: "Masjid", baseCost: 1100, baseRate: 15, icon: NGAJI_CERIA_ASSETS.buildingMasjid, description: "Pusat ibadah dan kebersamaan." },
  { id: "dapur", name: "Dapur", baseCost: 12000, baseRate: 75, icon: NGAJI_CERIA_ASSETS.buildingDapur, description: "Menjaga energi seluruh santri." },
  { id: "perpus", name: "Perpustakaan", baseCost: 130000, baseRate: 400, icon: NGAJI_CERIA_ASSETS.buildingPerpus, description: "Membuka ruang ilmu yang lebih luas." },
  { id: "asrama", name: "Asrama", baseCost: 1400000, baseRate: 2000, icon: NGAJI_CERIA_ASSETS.buildingAsrama, description: "Membentuk komunitas santri yang kuat." },
];

export const buildingCost = (building: BuildingDefinition, owned: number): number => Math.ceil(building.baseCost * 1.15 ** owned);
export const totalRate = (owned: Record<string, number>): number => SANTRI_BUILDINGS.reduce((total, building) => total + building.baseRate * (owned[building.id] ?? 0), 0);
export const formatIdleNumber = (value: number): string => value >= 1_000_000_000 ? `${(value / 1_000_000_000).toFixed(1)}B` : value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? `${(value / 1_000).toFixed(1)}K` : Math.floor(value).toString();
