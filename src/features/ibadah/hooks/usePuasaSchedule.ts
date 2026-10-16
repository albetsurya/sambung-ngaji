import { useMemo } from "react";
import {
  getPuasaSchedule,
  type PuasaDay,
  daysUntil,
} from "../data/puasa";

export interface PuasaScheduleResult {
  allDays: PuasaDay[];
  puasaDays: PuasaDay[];
  today: PuasaDay;
  nextPuasa: PuasaDay | null;
  nextPuasaDays: number;
}

export function usePuasaSchedule(daysAhead: number = 60): PuasaScheduleResult {
  return useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const allDays = getPuasaSchedule(start, daysAhead);
    const puasaDays = allDays.filter((d) => d.puasaList.length > 0);
    const today = allDays[0];

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
