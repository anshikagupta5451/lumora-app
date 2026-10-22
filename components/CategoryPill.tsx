import React from "react";
import { Pressable } from "react-native";
import { Text } from "./ui/Text";
import { useTheme } from "../src/theme/ThemeContext";

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

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: active ? theme.primary : theme.card,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: active ? "#fff" : theme.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
