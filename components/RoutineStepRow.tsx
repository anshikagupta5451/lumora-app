import React from "react";
import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../src/theme/ThemeContext";

export function RoutineStepRow({
  name,
  completed,
  onToggle,
}: {
  name: string;
  completed: boolean;
  onToggle: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-between py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
    >
      <Text
        className={`text-sm ${completed ? "line-through" : "font-medium"}`}
        style={{ color: completed ? theme.muted : theme.foreground }}
      >
        {name}
      </Text>
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{
          borderWidth: 1,
          backgroundColor: completed ? theme.primary : "transparent",
          borderColor: completed ? theme.primary : theme.border,
        }}
      >
        {completed && <Check size={14} color="#fff" />}
      </View>
    </Pressable>
  );
}
