import React from "react";
import { View, Pressable, Text } from "react-native";

const moods = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

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
