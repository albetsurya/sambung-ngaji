import { useCallback, useEffect, useState } from "react";

export type DoaFontSize = "small" | "medium" | "large";

const STORAGE_KEY = "doa-font-size";
const DEFAULT: DoaFontSize = "medium";

export interface FontSizeSpec {
  arab: number;
  arabLineHeight: number;
  body: number;
  bodyLineHeight: number;
  label: string;
  labelArabic: number;
}

export const FONT_SIZE_SPECS: Record<DoaFontSize, FontSizeSpec> = {
  small: {
    arab: 18,
    arabLineHeight: 2,
    body: 12,
    bodyLineHeight: 1.6,
    label: "Kecil",
    labelArabic: 22,
  },
  medium: {
    arab: 22,
    arabLineHeight: 2.2,
    body: 13.5,
    bodyLineHeight: 1.7,
    label: "Normal",
    labelArabic: 26,
  },
  large: {
    arab: 28,
    arabLineHeight: 2.4,
    body: 15,
    bodyLineHeight: 1.8,
    label: "Besar",
    labelArabic: 32,
  },
};

function load(): DoaFontSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "small" || raw === "medium" || raw === "large") {
      return raw;
    }
  } catch {
    // ignore
  }
  return DEFAULT;
}

function persist(size: DoaFontSize) {
  try {
    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // ignore
  }
}

export function useDoaFontSize() {
  const [size, setSizeState] = useState<DoaFontSize>(() => load());

  useEffect(() => {
    // sinkron antar tab (kalau user buka 2 tab)
    function handler(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (
          e.newValue === "small" ||
          e.newValue === "medium" ||
          e.newValue === "large"
        ) {
          setSizeState(e.newValue);
        }
      }
    }
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setSize = useCallback((next: DoaFontSize) => {
    setSizeState(next);
    persist(next);
  }, []);

  return { size, setSize, spec: FONT_SIZE_SPECS[size] };
}
