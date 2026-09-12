import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "./ui/Text";

// Colors are fixed regardless of theme so a mood always reads the same way,
// the same reasoning as the morning/evening colors on the routine screen.
export const moods = [
  { value: 1, emoji: "😞", label: "Struggling", color: "#E4645A" },
  { value: 2, emoji: "😕", label: "Not great", color: "#EF9758" },
  { value: 3, emoji: "😐", label: "Okay", color: "#EBBE4F" },
  { value: 4, emoji: "🙂", label: "Good", color: "#8FC15D" },
  { value: 5, emoji: "😄", label: "Great", color: "#4CAF87" },
];

export function getMood(value: number) {
  return moods.find((m) => m.value === value) || moods[2];
}

export function MoodPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row justify-between">
      {moods.map((m) => (
        <Pressable
          key={m.value}
          onPress={() => onChange(m.value)}
          className={`w-14 h-14 rounded-full items-center justify-center ${
            value === m.value
              ? "bg-primary/15 border-2 border-primary"
              : "bg-card border border-border"
          }`}
        >
          <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
        </Pressable>
      ))}
    </View>
  );
}
