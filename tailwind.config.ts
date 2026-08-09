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
        background: "#FFF5F8",
        card: "#FFFFFF",
        border: "#FADCE6",
        primary: "#EC5B8C",
        "primary-light": "#FCE4EC",
        accent: "#FFB6C9",
        foreground: "#3D2430",
        muted: "#9C7D8A",
      },
    },
  },
  plugins: [],
};

export default config;