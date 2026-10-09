import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setBest } from "../../_shared/storage";
import { buildingCost, SANTRI_BUILDINGS, totalRate } from "../data/buildings";

interface SantriStore { coins: number; owned: Record<string, number>; lastSeen: number; buy: (id: string) => boolean; collect: (seconds: number) => void; reset: () => void; }
const emptyOwned = () => Object.fromEntries(SANTRI_BUILDINGS.map((building) => [building.id, 0]));
const useSantriStore = create<SantriStore>()(persist((set, get) => ({
  coins: 30, owned: emptyOwned(), lastSeen: Date.now(),
  buy: (id) => { const building = SANTRI_BUILDINGS.find((item) => item.id === id); if (!building) return false; const state = get(); const cost = buildingCost(building, state.owned[id] ?? 0); if (state.coins < cost) return false; set({ coins: state.coins - cost, owned: { ...state.owned, [id]: (state.owned[id] ?? 0) + 1 }, lastSeen: Date.now() }); return true; },
  collect: (seconds) => set((state) => ({ coins: state.coins + Math.max(0, totalRate(state.owned) * seconds), lastSeen: Date.now() })),
  reset: () => set({ coins: 30, owned: emptyOwned(), lastSeen: Date.now() }),
}), { name: "ngajiceria:santri-idle" }));

export function useSantriIdle() {
  const state = useSantriStore();
  const [offlineGain, setOfflineGain] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const initialized = useRef(false);
  const rate = totalRate(state.owned);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const elapsed = Math.min(8 * 60 * 60, Math.max(0, (Date.now() - state.lastSeen) / 1000));
    const gain = rate * elapsed;
    if (gain > 1) { state.collect(elapsed); setOfflineGain(gain); }
  }, [rate, state]);
  useEffect(() => {
    const id = window.setInterval(() => state.collect(1), 1000);
    return () => window.clearInterval(id);
  }, [state]);
  useEffect(() => {
    const id = window.setInterval(() => setActivityIndex((value) => (value + 1) % 4), 3500);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => { setBest("santri-idle", Math.floor(state.coins)); }, [state.coins]);
  return { ...state, rate, activityIndex, offlineGain, dismissOffline: () => setOfflineGain(0), costs: Object.fromEntries(SANTRI_BUILDINGS.map((building) => [building.id, buildingCost(building, state.owned[building.id] ?? 0)])) };
}
