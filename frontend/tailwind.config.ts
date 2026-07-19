import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: "#0b1220",
          panel: "#121a2b",
          border: "#1e2a44",
          accent: "#3d9cf0",
          muted: "#8b9bb8",
          good: "#3ecf8e",
          warn: "#f0b429",
          bad: "#f07178",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
