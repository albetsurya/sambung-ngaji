import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { withThemeTransition } from "../utils/transition";

type Theme = "light" | "dark";
export type ThemeMode = "light" | "dark" | "system";
export type PresetGroup = "aplikasi" | "alam" | "dasar";
export type ThemePreset =
  | "default"
  | "whatsapp"
  | "instagram"
  | "tiktok"
  | "spotify"
  | "discord"
  | "masjid"
  | "ocean"
  | "sunset"
  | "hutan"
  | "midnight"
  | "glass"
  | "kertas";

const STORAGE_KEY = "pengajian_theme";
const PRESET_KEY = "pengajian_preset";

export const PRESET_GROUPS: {
  key: PresetGroup;
  label: string;
  description: string;
}[] = [
  {
    key: "aplikasi",
    label: "Aplikasi",
    description: "Sensasi familiar dari aplikasi yang dipakai setiap hari.",
  },
  {
    key: "alam",
    label: "Alam",
    description: "Warna tenang yang diambil dari alam: laut, hutan, dan senja.",
  },
  {
    key: "dasar",
    label: "Dasar",
    description: "Warna netral yang aman dipakai kapan saja.",
  },
];

export const THEME_PRESETS: {
  key: ThemePreset;
  label: string;
  description: string;
  group: PresetGroup;
  swatch: string[];
}[] = [
  {
    key: "default",
    label: "Default",
    description: "Biru navy profesional",
    group: "dasar",
    swatch: ["#1E3A8A", "#3B82F6", "#EFF6FF"],
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Hijau familiar",
    group: "aplikasi",
    swatch: ["#25D366", "#128C7E", "#DCF8C6"],
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Pink gradient trendy",
    group: "aplikasi",
    swatch: ["#E1306C", "#F77737", "#FCE7F3"],
  },
  {
    key: "tiktok",
    label: "TikTok",
    description: "Cyan neon bold",
    group: "aplikasi",
    swatch: ["#25F4EE", "#FE2C55", "#000000"],
  },
  {
    key: "spotify",
    label: "Spotify",
    description: "Hijau neon premium",
    group: "aplikasi",
    swatch: ["#1DB954", "#121212", "#191414"],
  },
  {
    key: "discord",
    label: "Discord",
    description: "Blurple komunitas",
    group: "aplikasi",
    swatch: ["#5865F2", "#4752C4", "#E0E7FF"],
  },
  {
    key: "masjid",
    label: "Masjid",
    description: "Emerald islami",
    group: "alam",
    swatch: ["#059669", "#10B981", "#D1FAE5"],
  },
  {
    key: "ocean",
    label: "Ocean",
    description: "Biru laut tenang",
    group: "alam",
    swatch: ["#06B6D4", "#0891B2", "#CFFAFE"],
  },
  {
    key: "sunset",
    label: "Sunset",
    description: "Oranye hangat",
    group: "alam",
    swatch: ["#F97316", "#EA580C", "#FFEDD5"],
  },
  {
    key: "hutan",
    label: "Hutan",
    description: "Hijau pinus natural",
    group: "alam",
    swatch: ["#15803D", "#92400E", "#DCFCE7"],
  },
  {
    key: "midnight",
    label: "Midnight",
    description: "Hitam neon sleek",
    group: "dasar",
    swatch: ["#8B5CF6", "#000000", "#A78BFA"],
  },
  {
    key: "glass",
    label: "Glass",
    description: "Kaca frosted modern",
    group: "dasar",
    swatch: ["#E2E8F0", "#FFFFFF", "#0F172A"],
  },
  {
    key: "kertas",
    label: "Kertas",
    description: "Krem hangat paper-like",
    group: "dasar",
    swatch: ["#B45309", "#FDF6E3", "#1C1917"],
  },
];

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  preset: ThemePreset;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setMode: (m: ThemeMode) => void;
  setPreset: (p: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function systemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored;
  return "system";
}

function getInitialPreset(): ThemePreset {
  const stored = localStorage.getItem(PRESET_KEY) as ThemePreset | null;
  const valid: ThemePreset[] = [
    "default",
    "whatsapp",
    "instagram",
    "tiktok",
    "spotify",
    "discord",
    "masjid",
    "ocean",
    "sunset",
    "hutan",
    "midnight",
    "glass",
    "kertas",
  ];
  if (stored && valid.includes(stored)) return stored;
  return "default";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [preset, setPresetState] = useState<ThemePreset>(getInitialPreset);
  const [theme, setThemeState] = useState<Theme>(() => {
    const m = getInitialMode();
    return m === "system" ? systemTheme() : m;
  });

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const sync = () => {
      if (localStorage.getItem(STORAGE_KEY) !== "system") return;
      withThemeTransition(() =>
        setThemeState(mq.matches ? "dark" : "light"),
      );
    };
    mq?.addEventListener("change", sync);
    return () => mq?.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-preset", preset);
    localStorage.setItem(STORAGE_KEY, mode);
    localStorage.setItem(PRESET_KEY, preset);

    const host = window.location.hostname || "";
    const isDev =
      host === "localhost" || host === "127.0.0.1" || host.includes("-dev");
    const isStaging = host.includes("-staging");

    let metaColor = "";

    if (isDev) {
      metaColor = theme === "dark" ? "#7F1D1D" : "#F87171";
    } else if (isStaging) {
      metaColor = theme === "dark" ? "#78350F" : "#FBBF24";
    } else {
      const computed = getComputedStyle(root);
      const bg = computed.getPropertyValue("--c-bg").trim();
      const parts = bg.split(/\s+/).map(Number);
      if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
        metaColor =
          "#" +
          parts
            .map((n) =>
              Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0"),
            )
            .join("");
      } else {
        metaColor = theme === "dark" ? "#0F172A" : "#FFFFFF";
      }
    }

    requestAnimationFrame(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta && metaColor) {
        meta.setAttribute("content", metaColor);
      }
    });
  }, [theme, preset]);

  function setTheme(t: Theme) {
    withThemeTransition(() => {
      setModeState(t);
      setThemeState(t);
    });
  }

  function toggleTheme() {
    withThemeTransition(() =>
      setThemeState((t) => {
        const next = t === "dark" ? "light" : "dark";
        setModeState(next);
        return next;
      }),
    );
  }

  function setMode(m: ThemeMode) {
    withThemeTransition(() => {
      setModeState(m);
      setThemeState(m === "system" ? systemTheme() : m);
    });
  }

  function setPreset(p: ThemePreset) {
    withThemeTransition(() => setPresetState(p));
  }

  return (
    <ThemeContext.Provider
      value={{ theme, mode, preset, toggleTheme, setTheme, setMode, setPreset }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  return ctx;
}
