import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/theme/ThemeContext";
import { palettes } from "../../src/theme/palettes";
import { LinearGradient } from "expo-linear-gradient";

function SettingRow({
  label,
  sub,
  value,
  onChange,
  theme,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  theme: any;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 pr-3">
        <Text
          className="text-sm font-medium"
          style={{ color: theme.foreground }}
        >
          {label}
        </Text>
        {sub && (
          <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
            {sub}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.primary }}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dailyBrief, setDailyBrief] = useState(true);
  const [routineReminders, setRoutineReminders] = useState(true);
  const [refillReminders, setRefillReminders] = useState(false);
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
        <SettingRow
          label="Daily AI Beauty Brief"
          sub="Get notified when today's brief is ready"
          value={dailyBrief}
          onChange={setDailyBrief}
          theme={theme}
        />
        <SettingRow
          label="Routine reminders"
          sub="Morning & evening routine nudges"
          value={routineReminders}
          onChange={setRoutineReminders}
          theme={theme}
        />
        <SettingRow
          label="Refill reminders"
          sub="When a product is running low"
          value={refillReminders}
          onChange={setRefillReminders}
          theme={theme}
        />
      </Card>

      <Text className="text-xs text-center mt-2" style={{ color: theme.muted }}>
        Notification delivery isn&apos;t wired up yet — these preferences are
        saved locally for now.
      </Text>
    </View>
  );
}
