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
  | "midnight"
  | "glass";

const STORAGE_KEY = "pengajian_theme";
const PRESET_KEY = "pengajian_preset";

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
    swatch: ["#25D366", "#128C7E", "#DCF8C6"],
  },
  {
    key: "instagram",
    label: "Instagram",
    description: "Pink gradient trendy",
    swatch: ["#E1306C", "#F77737", "#FCE7F3"],
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
  {
    key: "glass",
    label: "Glass",
    description: "Kaca frosted modern",
    swatch: ["#E2E8F0", "#FFFFFF", "#0F172A"],
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
    "glass",
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

    // Tentukan theme-color untuk meta tag berdasarkan environment + theme
    const host = window.location.hostname || "";
    const isDev =
      host === "localhost" || host === "127.0.0.1" || host.includes("-dev");
    const isStaging = host.includes("-staging");

    let metaColor = "";

    if (isDev) {
      // DEV: merah
      metaColor = theme === "dark" ? "#7F1D1D" : "#F87171";
    } else if (isStaging) {
      // STAGING: oranye
      metaColor = theme === "dark" ? "#78350F" : "#FBBF24";
    } else {
      // PRODUCTION: match --c-bg (putih / navy dark)
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

    // Delay sedikit biar CSS variable sudah ke-apply
    requestAnimationFrame(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta && metaColor) {
        meta.setAttribute("content", metaColor);
      }
    });
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
