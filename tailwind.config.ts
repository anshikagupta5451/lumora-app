import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFF9F6",
        card: "#FFFFFF",
        border: "#F0E4DE",
        primary: "#C97B63",
        foreground: "#2B2320",
        muted: "#8A7A72",
      },
    },
  },
  plugins: [],
};

export default config;
