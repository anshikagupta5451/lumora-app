import { Star } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)}>
          <Star
            size={28}
            color="#E8896F"
            fill={n <= value ? "#E8896F" : "transparent"}
          />
        </Pressable>
      ))}
    </View>
  );
}
