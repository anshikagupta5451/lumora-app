import React from "react";
import { Pressable } from "react-native";
import { Text } from "./ui/Text";
import { useTheme } from "../src/theme/ThemeContext";

export function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl px-4 py-3.5 flex-row items-center justify-between"
      style={{
        borderWidth: 1,
        borderColor: selected ? theme.primary : theme.border,
        backgroundColor: selected ? theme.primaryLight : theme.card,
      }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: selected ? theme.primary : theme.foreground }}
      >
        {label}
      </Text>
      {selected && (
        <Text className="font-bold" style={{ color: theme.primary }}>
          ✓
        </Text>
      )}
    </Pressable>
  );
}
