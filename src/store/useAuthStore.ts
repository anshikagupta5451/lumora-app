// src/store/useAuthStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web") return null; // or read from localStorage if you want web support later
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") return;
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string) {
    if (Platform.OS === "web") return;
    return SecureStore.deleteItemAsync(key);
  },
};

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await storage.setItem("accessToken", accessToken);
    await storage.setItem("refreshToken", refreshToken);
    await storage.setItem("user", JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    await storage.deleteItem("accessToken");
    await storage.deleteItem("refreshToken");
    await storage.deleteItem("user");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  loadAuth: async () => {
    const accessToken = await storage.getItem("accessToken");
    const userStr = await storage.getItem("user");
    if (accessToken && userStr)
      set({ accessToken, user: JSON.parse(userStr), isAuthenticated: true });
  },
}));
