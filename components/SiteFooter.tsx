import React from "react";
import { View } from "react-native";
import { Text } from "./ui/Text";

export function SiteFooter() {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-t border-border">
      <Text className="text-[14px] text-muted-foreground">
        © {new Date().getFullYear()} Lumora
      </Text>
      <Text className="text-[14px] text-muted-foreground">
        Real people, real routines.
      </Text>
    </View>
  );
}
