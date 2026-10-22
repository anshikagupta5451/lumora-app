import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Text } from "./ui/Text";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/theme/ThemeContext";

interface Props {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  return (
    <View
      className="flex-1 p-6"
      style={{
        backgroundColor: theme.background,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 16,
      }}
    >
      <View className="flex-row gap-1.5 mb-6 mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className="flex-1 h-1.5 rounded-full"
            style={{ backgroundColor: i < step ? theme.primary : theme.border }}
          />
        ))}
      </View>

      <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
        {title}
      </Text>
      <Text className="text-sm mt-1 mb-6" style={{ color: theme.muted }}>
        {subtitle}
      </Text>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3"
        style={{ backgroundColor: theme.background }}
      >
        {children}
      </ScrollView>

      <View className="flex-row gap-3 mt-4">
        {step > 1 && (
          <Pressable
            onPress={() => router.back()}
            className="flex-1 rounded-xl py-3.5 items-center"
            style={{ borderWidth: 1, borderColor: theme.border }}
          >
            <Text className="font-medium" style={{ color: theme.foreground }}>
              Back
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onNext}
          disabled={nextDisabled}
          className="flex-1 rounded-xl py-3.5 items-center"
          style={{ backgroundColor: nextDisabled ? theme.primaryLight : theme.primary }}
        >
          <Text className="text-white font-semibold">{nextLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
