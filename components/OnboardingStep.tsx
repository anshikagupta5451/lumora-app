import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";

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

  return (
    <View className="flex-1 bg-background p-6">
      <View className="flex-row gap-1.5 mb-6 mt-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i < step ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </View>

      <Text className="text-2xl font-bold text-foreground">{title}</Text>
      <Text className="text-sm text-muted mt-1 mb-6">{subtitle}</Text>

      <ScrollView className="flex-1" contentContainerClassName="gap-3">
        {children}
      </ScrollView>

      <View className="flex-row gap-3 mt-4">
        {step > 1 && (
          <Pressable
            onPress={() => router.back()}
            className="flex-1 border border-border rounded-xl py-3.5 items-center"
          >
            <Text className="text-foreground font-medium">Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onNext}
          disabled={nextDisabled}
          className={`flex-1 rounded-xl py-3.5 items-center ${nextDisabled ? "bg-primary/50" : "bg-primary"}`}
        >
          <Text className="text-white font-semibold">{nextLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
