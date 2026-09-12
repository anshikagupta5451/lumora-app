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
        background: "#FBF7F5",
        card: "#FFFFFF",
        border: "#EDDBD9",
        primary: "#B8336A",
        "primary-light": "#F6E1E8",
        accent: "#E8926F",
        foreground: "#2A1620",
        muted: "#86656E",
        "muted-foreground": "#86656E",
      },
      fontSize: {
        xs: ["13px", "18px"],
        sm: ["15px", "21px"],
        base: ["17px", "24px"],
        lg: ["19px", "26px"],
        xl: ["22px", "28px"],
        "2xl": ["26px", "32px"],
        "3xl": ["32px", "38px"],
        "4xl": ["38px", "44px"],
      },
    },
  },
  plugins: [],
};

export default config;