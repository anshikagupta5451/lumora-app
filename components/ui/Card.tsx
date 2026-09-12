import React from "react";
import { View, ViewStyle, StyleProp, Platform } from "react-native";

const elevation = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 1.5 },
  default: {},
});

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
      style={[
        { borderWidth: 1, borderColor: "#E5E5E5", backgroundColor: "#FFFFFF" },
        elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}