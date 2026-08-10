import React from "react";
import { Pressable, Text } from "react-native";
import { useTheme } from "../src/theme/ThemeContext";

const categoryColors: Record<string, string> = {
  All: "#3B82F6",
  General: "#8B5CF6",
  Products: "#0EA5E9",
  "My Story": "#10B981",
  "Study Hub": "#F97316",
  Challenges: "#F59E0B",
};

export function CategoryPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const color = categoryColors[label] || theme.primary;

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: active ? color : `${color}18`,
        borderWidth: active ? 0 : 1,
        borderColor: `${color}30`,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: active ? "#fff" : color,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
