import React from "react";
import { View, Text } from "react-native";

export function SiteFooter() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-t border-border">
      <Text className="text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} Lumora
      </Text>
      <Text className="text-[11px] text-muted-foreground">
        Real people, real routines.
      </Text>
    </View>
  );
}
