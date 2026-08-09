import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";

export function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className={`rounded-2xl ${className}`}
      style={[{ borderWidth: 1, borderColor: "#E5E5E5", backgroundColor: "#FFFFFF" }, style]}
    >
      {children}
    </View>
  );
}