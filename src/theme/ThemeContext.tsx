import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { palettes, Palette, ThemeName } from "./palettes";

interface ThemeContextValue {
  theme: Palette;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>("bloom");

  useEffect(() => {
    if (Platform.OS === "web") return;
    SecureStore.getItemAsync("themeName").then((saved) => {
      if (saved && saved in palettes) setThemeNameState(saved as ThemeName);
    });
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    if (Platform.OS !== "web") SecureStore.setItemAsync("themeName", name);
  };

  return (
    <ThemeContext.Provider
      value={{ theme: palettes[themeName], themeName, setThemeName }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
