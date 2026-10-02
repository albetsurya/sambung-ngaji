/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        slideUpStagger: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        dropdownIn: {
          from: { opacity: "0", transform: "scale(0.96) translateY(-4px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        messageIn: {
          from: { opacity: "0", transform: "translateY(8px) scale(0.99)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        drawCheck: {
          from: { strokeDashoffset: "100" },
          to: { strokeDashoffset: "0" },
        },
        successPop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        progressShine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "stagger-in": "slideUpStagger 0.28s ease-out both",
        dropdown: "dropdownIn 0.18s ease-out both",
        "message-in": "messageIn 0.22s ease-out both",
        "float-soft": "floatSoft 3s ease-in-out infinite",
        "success-pop": "successPop 0.3s ease-out both",
      },
      colors: {
        "surface-border": "rgba(0, 0, 0, 0.08)",
        surface: {
          bg: "rgb(var(--c-bg) / <alpha-value>)",
          card: "rgb(var(--c-card) / <alpha-value>)",
          card2: "rgb(var(--c-card2) / <alpha-value>)",
          border: "rgb(var(--c-border) / <alpha-value>)",
          muted: "rgb(var(--c-muted) / <alpha-value>)",
          text: "rgb(var(--c-text) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          dark: "rgb(var(--c-accent-dark) / <alpha-value>)",
          soft: "rgb(var(--c-accent-light) / <alpha-value>)",
          softStrong: "rgb(var(--c-accent) / 0.16)",
        },
        accent2: {
          DEFAULT: "rgb(var(--c-accent-2) / <alpha-value>)",
          dark: "rgb(var(--c-accent-2-dark) / <alpha-value>)",
          soft: "rgb(var(--c-accent-2-light) / <alpha-value>)",
          softStrong: "rgb(var(--c-accent-2) / 0.16)",
        },
        success: {
          DEFAULT: "rgb(var(--c-success) / <alpha-value>)",
          soft: "rgb(var(--c-success) / 0.12)",
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          soft: "rgb(var(--c-danger) / 0.12)",
        },
        warning: {
          DEFAULT: "rgb(var(--c-warning) / <alpha-value>)",
          soft: "rgb(var(--c-warning) / 0.14)",
        },
        info: {
          DEFAULT: "rgb(var(--c-info) / <alpha-value>)",
          soft: "rgb(var(--c-info-soft) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: [
          "Inter",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      fontSize: {
        "ios-nav": ["17px", { lineHeight: "22px", fontWeight: "600" }],
        "ios-body": ["15px", { lineHeight: "22px" }],
        "ios-subhead": ["14px", { lineHeight: "20px" }],
        "ios-footnote": ["13px", { lineHeight: "18px" }],
        "ios-caption": ["11px", { lineHeight: "14px", fontWeight: "500" }],
        "ios-tab": ["10px", { lineHeight: "12px", fontWeight: "500" }],
      },
      boxShadow: {
        neu: "var(--shadow-card)",
        "neu-sm": "var(--shadow-card)",
        "neu-pressed":
          "0 0 0 1px rgb(var(--c-accent) / 0.16), 0 1px 2px rgb(0 0 0 / 0.03)",
        "neu-pressed-sm":
          "0 0 0 1px rgb(var(--c-accent) / 0.12), 0 1px 2px rgb(0 0 0 / 0.03)",
        "neu-float": "var(--shadow-float)",
        "neu-bar-top": "var(--shadow-bar)",
        "neu-bar-bottom": "0 1px 8px rgb(0 0 0 / 0.05)",
        card: "var(--shadow-card)",
        "ios-sheet": "0 -8px 30px rgb(0 0 0 / 0.12)",
        "ios-fab": "var(--shadow-float)",
      },
      borderRadius: {
        xl2: "1.25rem",
        ios: "0.875rem",
        neu: "1rem",
      },
      backdropBlur: { ios: "20px" },
    },
  },
  plugins: [],
};
