import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#0f172a",
          hover: "#111827",
          border: "#1f2937"
        }
      }
    },
  },
  plugins: [],
};
export default config;
