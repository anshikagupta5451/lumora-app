import React from "react";
import { Pressable } from "react-native";
import { Text } from "./ui/Text";
import { useTheme } from "../src/theme/ThemeContext";

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      className="px-3 py-1.5 rounded-full"
      style={{
        borderWidth: 1,
        backgroundColor: active ? theme.primary : theme.background,
        borderColor: active ? theme.primary : theme.border,
      }}
    >
      <Text
        className="text-xs font-medium"
        style={{ color: active ? "#FFFFFF" : theme.muted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
