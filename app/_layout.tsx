import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/store/useAuthStore";
import { setupPushNotifications } from "../src/lib/notifications";
import { ThemeProvider } from '../src/theme/ThemeContext'

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setupPushNotifications();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
       <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
