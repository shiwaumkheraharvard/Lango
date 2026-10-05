import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: "#FF6B1A", deep: "#E85D04", soft: "#FFF1E6", mist: "#FFF8F3" },
        ink: "#1A1A1A",
        warm: "#6B6B6B",
        line: "#EDE7E1",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,26,26,0.04), 0 4px 12px rgba(26,26,26,0.05), 0 16px 40px rgba(232,93,4,0.06)",
        lift: "0 2px 4px rgba(26,26,26,0.05), 0 10px 24px rgba(26,26,26,0.08), 0 24px 56px rgba(232,93,4,0.10)",
        orange: "0 8px 24px rgba(255,107,26,0.35), 0 2px 6px rgba(232,93,4,0.25)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      letterSpacing: { tightest: "-0.04em", tighter: "-0.03em" },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseRing: { "0%": { transform: "scale(1)", opacity: "0.6" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        pulseRing: "pulseRing 1.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
