import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../src/store/useAuthStore";
import { setupPushNotifications } from "../src/lib/notifications";
import { ThemeProvider } from "../src/theme/ThemeContext";
import { Text, TextInput } from "react-native";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

// @ts-ignore — apply the font globally to every Text/TextInput in the app
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [
  { fontFamily: "PlusJakartaSans_400Regular" },
  Text.defaultProps.style,
];

// @ts-ignore
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [
  { fontFamily: "PlusJakartaSans_400Regular" },
  TextInput.defaultProps.style,
];

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setupPushNotifications();
    }
  }, [isAuthenticated]);

  if (!fontsLoaded) return null;

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
