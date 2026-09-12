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
    background: "#FBF7F5",
    card: "#FFFFFF",
    border: "#EDDBD9",
    primary: "#B8336A",
    primaryLight: "#F6E1E8",
    accent: "#E8926F",
    foreground: "#2A1620",
    muted: "#86656E",
    gradient: ["#B8336A", "#E8926F"],
  },
  current: {
    name: "current",
    label: "🌊 Current",
    background: "#F5F8FC",
    card: "#FFFFFF",
    border: "#D7E3F2",
    primary: "#2563EB",
    primaryLight: "#DCE9FB",
    accent: "#22B8CF",
    foreground: "#16223A",
    muted: "#5B6B85",
    gradient: ["#2563EB", "#22B8CF"],
  },
  midnight: {
    name: "midnight",
    label: "🌙 Midnight",
    background: "#16141F",
    card: "#211E2E",
    border: "#34304A",
    primary: "#B692F5",
    primaryLight: "#372952",
    accent: "#F98FC0",
    foreground: "#F5F3FA",
    muted: "#A79FC2",
    gradient: ["#8B5CF6", "#EC4899"],
  },
};
