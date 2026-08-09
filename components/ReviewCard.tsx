import React from "react";
import { View, Text } from "react-native";
import { Star, ShieldCheck } from "lucide-react-native";
import { Card } from "./ui/Card";
import { Review } from "../src/api/reviews";
import { useTheme } from "../src/theme/ThemeContext";

export function ReviewCard({ review }: { review: Review }) {
  const { theme } = useTheme();

  return (
    <Card
      className="p-4 mb-3"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <View className="flex-row justify-between items-start mb-1.5">
        <View className="flex-1 pr-2">
          <Text
            className="text-[11px] uppercase"
            style={{ color: theme.muted }}
          >
            {review.brand}
          </Text>
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.foreground }}
          >
            {review.product}
          </Text>
        </View>
        <View className="flex-row items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              color={theme.primary}
              fill={i < review.rating ? theme.primary : "transparent"}
            />
          ))}
        </View>
      </View>

      <Text
        className="text-sm font-medium mt-2"
        style={{ color: theme.foreground }}
      >
        {review.title}
      </Text>
      <Text className="text-xs mt-1 leading-5" style={{ color: theme.muted }}>
        {review.review}
      </Text>

      <View className="flex-row flex-wrap mt-3 gap-1.5">
        {review.skinType ? (
          <View
            className="rounded-full px-2.5 py-1"
            style={{
              backgroundColor: theme.primaryLight,
              borderWidth: 1,
              borderColor: theme.primary,
            }}
          >
            <Text
              className="text-[10px] font-medium"
              style={{ color: theme.primary }}
            >
              {review.skinType} skin
            </Text>
          </View>
        ) : null}
        {review.concerns.map((c) => (
          <View
            key={c}
            className="rounded-full px-2.5 py-1"
            style={{
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-[10px] font-medium"
              style={{ color: theme.muted }}
            >
              {c}
            </Text>
          </View>
        ))}
      </View>

      <View
        className="flex-row items-center justify-between mt-3 pt-3"
        style={{ borderTopWidth: 1, borderTopColor: theme.border }}
      >
        <Text className="text-[11px]" style={{ color: theme.muted }}>
          {review.reviewer}
        </Text>
        {review.verified && (
          <View className="flex-row items-center gap-1">
            <ShieldCheck size={12} color={theme.muted} />
            <Text className="text-[10px]" style={{ color: theme.muted }}>
              Verified
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
