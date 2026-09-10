import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca:    "#7371ff",
        lima:     "#bef533",
        limaEsc:  "#5f7d00",
        magenta:  "#ff43c0",
        lavanda:  "#dbbfff",
        tinta:    "#1e1e1e",
        papel:    "#f4f4f4",
      },
      fontFamily: {
        sans: ["var(--fonte)", "system-ui", "sans-serif"],
      },
      fontSize: {
        kpi: ["2.25rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        kpiTv: ["3.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};
export default config;
