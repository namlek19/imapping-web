import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#faf7f2",
        surface:    "#ffffff",
        primary:    "#2d3436",
        secondary:  "#64748B",
        accent:     "#FF7F50",
      },
    },
  },
  plugins: [],
};
export default config;