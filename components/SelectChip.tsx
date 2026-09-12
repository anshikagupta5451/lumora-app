import React from "react";
import { Pressable } from "react-native";
import { Text } from "./ui/Text";

export function SelectChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`border rounded-xl px-4 py-3.5 flex-row items-center justify-between ${selected ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
    >
      <Text
        className={`text-sm font-medium ${selected ? "text-primary" : "text-foreground"}`}
      >
        {label}
      </Text>
      {selected && <Text className="text-primary font-bold">✓</Text>}
    </Pressable>
  );
}
