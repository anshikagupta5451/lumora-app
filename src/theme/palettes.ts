export type ThemeName = "bloom" | "current" | "midnight";

export interface Palette {
  name: ThemeName;
  label: string;
  background: string;
  card: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  foreground: string;
  muted: string;
  gradient: [string, string];
}

export const palettes: Record<ThemeName, Palette> = {
  bloom: {
    name: "bloom",
    label: "🌸 Bloom",
    background: "#FFF5F8",
    card: "#FFFFFF",
    border: "#FADCE6",
    primary: "#EC5B8C",
    primaryLight: "#FCE4EC",
    accent: "#FFB6C9",
    foreground: "#3D2430",
    muted: "#9C7D8A",
    gradient: ["#EC5B8C", "#FF9DBB"],
  },
  current: {
    name: "current",
    label: "🌊 Current",
    background: "#F0F7FF",
    card: "#FFFFFF",
    border: "#D3E4FA",
    primary: "#3B82F6",
    primaryLight: "#DBEAFE",
    accent: "#60A5FA",
    foreground: "#1E293B",
    muted: "#64748B",
    gradient: ["#3B82F6", "#60D4FA"],
  },
  midnight: {
    name: "midnight",
    label: "🌙 Midnight",
    background: "#12111A",
    card: "#1E1C2A",
    border: "#2E2B3E",
    primary: "#A78BFA",
    primaryLight: "#2E2447",
    accent: "#F472B6",
    foreground: "#F1F0F6",
    muted: "#9B95AE",
    gradient: ["#7C3AED", "#EC4899"],
  },
};
