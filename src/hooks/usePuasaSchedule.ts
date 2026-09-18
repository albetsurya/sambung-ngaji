import { useMemo } from "react";
import {
  getPuasaSchedule,
  type PuasaDay,
  daysUntil,
} from "../data/puasa";

export interface PuasaScheduleResult {
  /** Semua hari dalam range (termasuk yang tidak ada puasa) */
  allDays: PuasaDay[];
  /** Hanya hari yang ada puasa-nya */
  puasaDays: PuasaDay[];
  /** Hari ini (index 0 dari range) */
  today: PuasaDay;
  /** Puasa berikutnya (terdekat dari hari ini) */
  nextPuasa: PuasaDay | null;
  /** Berapa hari lagi sampai puasa berikutnya */
  nextPuasaDays: number;
}

export function usePuasaSchedule(daysAhead: number = 60): PuasaScheduleResult {
  return useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const allDays = getPuasaSchedule(start, daysAhead);
    const puasaDays = allDays.filter((d) => d.puasaList.length > 0);
    const today = allDays[0];

    // Cari puasa berikutnya (dayOffset >= 0, tapi kalau hari ini sudah ada puasa, prioritas hari ini)
    const nextPuasa =
      puasaDays.find((d) => d.dayOffset >= 0) ?? null;

    const nextPuasaDays = nextPuasa ? daysUntil(nextPuasa.iso) : -1;

    return {
      allDays,
      puasaDays,
      today,
      nextPuasa,
      nextPuasaDays,
    };
  }, [daysAhead]);
}
