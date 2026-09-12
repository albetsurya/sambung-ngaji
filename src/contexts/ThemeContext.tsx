import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";
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
  | "midnight";

const STORAGE_KEY = "pengajian_theme";
const PRESET_KEY = "pengajian_preset";

const THEME_COLORS: Record<Theme, string> = {
  light: "#E7ECE8",
  dark: "#1A1F1D",
};

export const THEME_PRESETS: {
  key: ThemePreset;
  label: string;
  description: string;
  swatch: string[];
}[] = [
  {
    key: "default",
    label: "Default",
    description: "Biru navy profesional",
    swatch: ["#1E3A8A", "#3B82F6", "#EFF6FF"],
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "Hijau familiar",
    swatch: ["#25D366", "#128C42", "#DCF8E4"],
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Pink gradient trendy",
    swatch: ["#E1306C", "#C13584", "#FCE7F3"],
  },
  {
    key: "tiktok",
    label: "TikTok",
    description: "Cyan neon bold",
    swatch: ["#25F4EE", "#FE2C55", "#000000"],
  },
  {
    key: "spotify",
    label: "Spotify",
    description: "Hijau neon premium",
    swatch: ["#1DB954", "#121212", "#191414"],
  },
  {
    key: "discord",
    label: "Discord",
    description: "Blurple komunitas",
    swatch: ["#5865F2", "#4752C4", "#E0E7FF"],
  },
  {
    key: "masjid",
    label: "Masjid",
    description: "Emerald islami",
    swatch: ["#059669", "#10B981", "#D1FAE5"],
  },
  {
    key: "ocean",
    label: "Ocean",
    description: "Biru laut tenang",
    swatch: ["#06B6D4", "#0891B2", "#CFFAFE"],
  },
  {
    key: "sunset",
    label: "Sunset",
    description: "Oranye hangat",
    swatch: ["#F97316", "#EA580C", "#FFEDD5"],
  },
  {
    key: "midnight",
    label: "Midnight",
    description: "Hitam neon sleek",
    swatch: ["#8B5CF6", "#000000", "#A78BFA"],
  },
];

interface ThemeContextValue {
  theme: Theme;
  preset: ThemePreset;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setPreset: (p: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
    "midnight",
  ];
  if (stored && valid.includes(stored)) return stored;
  return "default";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [preset, setPresetState] = useState<ThemePreset>(getInitialPreset);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-preset", preset);
    localStorage.setItem(STORAGE_KEY, theme);
    localStorage.setItem(PRESET_KEY, preset);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEME_COLORS[theme]);
    }
  }, [theme, preset]);

  function setTheme(t: Theme) {
    setThemeState(t);
  }

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  function setPreset(p: ThemePreset) {
    setPresetState(p);
  }

  return (
    <ThemeContext.Provider
      value={{ theme, preset, toggleTheme, setTheme, setPreset }}
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
