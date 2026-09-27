
export type TaarufThemeKey = "emerald" | "navy" | "maroon" | "mono";

export interface TaarufTheme {
  key: TaarufThemeKey;
  label: string;
  bar: string;
  dot: string;
  accentText: string;
  softBg: string;
  softBorder: string;
  swatch: string;
}

export const TAARUF_THEMES: Record<TaarufThemeKey, TaarufTheme> = {
  emerald: {
    key: "emerald",
    label: "Zamrud",
    bar: "bg-emerald-600",
    dot: "bg-emerald-600",
    accentText: "text-emerald-700",
    softBg: "bg-emerald-50",
    softBorder: "border-emerald-100",
    swatch: "bg-emerald-600",
  },
  navy: {
    key: "navy",
    label: "Navy",
    bar: "bg-blue-900",
    dot: "bg-blue-900",
    accentText: "text-blue-900",
    softBg: "bg-blue-50",
    softBorder: "border-blue-100",
    swatch: "bg-blue-900",
  },
  maroon: {
    key: "maroon",
    label: "Marun",
    bar: "bg-rose-800",
    dot: "bg-rose-800",
    accentText: "text-rose-800",
    softBg: "bg-rose-50",
    softBorder: "border-rose-100",
    swatch: "bg-rose-800",
  },
  mono: {
    key: "mono",
    label: "Monokrom",
    bar: "bg-slate-900",
    dot: "bg-slate-900",
    accentText: "text-slate-900",
    softBg: "bg-slate-100",
    softBorder: "border-slate-200",
    swatch: "bg-slate-900",
  },
};

export const TAARUF_THEME_LIST: TaarufTheme[] = [
  TAARUF_THEMES.emerald,
  TAARUF_THEMES.navy,
  TAARUF_THEMES.maroon,
  TAARUF_THEMES.mono,
];
