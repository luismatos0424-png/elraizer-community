import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"], theme: { extend: { colors: { elraizer: { DEFAULT: "#00FF88", dark: "#0A0A0A", card: "#141414" } } } }, plugins: [] };
export default config;
