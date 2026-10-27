import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/theme/ThemeContext";
import { palettes } from "../../src/theme/palettes";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { themeName, setThemeName, theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
      className="p-4"
    >
      <Pressable
        onPress={() => router.back()}
        className="flex-row items-center gap-1 mb-5"
      >
        <ChevronLeft size={18} color={theme.muted} />
        <Text className="text-sm" style={{ color: theme.muted }}>
          Back
        </Text>
      </Pressable>

      <Text
        className="text-2xl font-bold mb-4"
        style={{ color: theme.foreground }}
      >
        Settings
      </Text>

      <Card
        className="p-4 mb-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <Text
          className="text-xs font-semibold uppercase mb-3"
          style={{ color: theme.muted }}
        >
          Choose your vibe
        </Text>
        <View className="flex-row gap-3">
          {Object.values(palettes).map((p) => (
            <Pressable
              key={p.name}
              onPress={() => setThemeName(p.name)}
              style={{
                flex: 1,
                borderRadius: 16,
                padding: 12,
                alignItems: "center",
                backgroundColor: p.background,
                borderWidth: themeName === p.name ? 3 : 1,
                borderColor: themeName === p.name ? p.primary : p.border,
              }}
            >
              <LinearGradient
                colors={p.gradient}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  marginBottom: 6,
                }}
              />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: p.foreground }}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card
        className="p-4 mb-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <Text
          className="text-xs font-semibold uppercase mb-1"
          style={{ color: theme.muted }}
        >
          Notifications
        </Text>
        <Text className="text-sm font-medium" style={{ color: theme.foreground }}>
          Streak reminder
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
          If you haven&apos;t checked in by 8 pm, we&apos;ll send one nudge so
          your streak doesn&apos;t break. You can turn it off in your
          phone&apos;s notification settings for Lumora.
        </Text>
      </Card>

    </View>
  );
}
