import React from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Sun,
  Wind,
  Droplets,
  Thermometer,
  ScanFace,
  Smile,
  Package,
  ListChecks,
  ChevronRight,
} from "lucide-react-native";
import { Text } from "./ui/Text";
import { useTheme } from "../src/theme/ThemeContext";
import { iconColors } from "../src/theme/iconColors";
import type {
  BriefConditions,
  BriefTipSource,
  RecommendationResponse,
} from "../src/api/recommendations";

const TIP_ICONS: Record<BriefTipSource, { Icon: typeof Sun; color: string }> = {
  uv: { Icon: Sun, color: iconColors.amber },
  air: { Icon: Wind, color: iconColors.purple },
  humidity: { Icon: Droplets, color: iconColors.blue },
  temperature: { Icon: Thermometer, color: iconColors.morning },
  scan: { Icon: ScanFace, color: iconColors.pink },
  checkins: { Icon: Smile, color: iconColors.green },
  products: { Icon: Package, color: iconColors.teal },
  routine: { Icon: ListChecks, color: iconColors.evening },
};

// Standard category bands, so a raw number reads as meaningful.
function uvLabel(uv: number) {
  if (uv >= 11) return "Extreme";
  if (uv >= 8) return "Very high";
  if (uv >= 6) return "High";
  if (uv >= 3) return "Moderate";
  return "Low";
}

function aqiLabel(aqi: number) {
  if (aqi > 200) return "Very poor";
  if (aqi > 150) return "Unhealthy";
  if (aqi > 100) return "Poor";
  if (aqi > 50) return "Moderate";
  return "Good";
}

function ConditionStats({ conditions }: { conditions: BriefConditions }) {
  const { theme } = useTheme();
  const stats = [
    conditions.uvMax != null && {
      label: "UV peak",
      value: String(conditions.uvMax),
      hint: uvLabel(conditions.uvMax),
    },
    conditions.aqi != null && {
      label: "Air",
      value: `AQI ${conditions.aqi}`,
      hint: aqiLabel(conditions.aqi),
    },
    conditions.humidity != null && {
      label: "Humidity",
      value: `${conditions.humidity}%`,
      hint: conditions.temp != null ? `${conditions.temp}°C` : "",
    },
  ].filter((s): s is { label: string; value: string; hint: string } => Boolean(s));

  if (!stats.length) return null;

  return (
    <View className="flex-row gap-2 mt-3">
      {stats.map((s) => (
        <View
          key={s.label}
          className="flex-1 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <Text className="text-[11px]" style={{ color: theme.muted }}>
            {s.label}
          </Text>
          <Text
            className="text-sm font-semibold my-0.5"
            style={{ color: theme.foreground }}
          >
            {s.value}
          </Text>
          {s.hint ? (
            <Text className="text-[11px]" style={{ color: theme.primary }}>
              {s.hint}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function DailyBrief({ brief }: { brief: RecommendationResponse }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { pick } = brief;
  const tips = brief.tips ?? [];

  const openPick = () => {
    if (!pick) return;
    if (pick.owned) router.push("/(main)/my-products");
    else if (pick.productId) router.push(`/(main)/product/${pick.productId}`);
  };

  return (
    <View>
      <Text
        className="text-xs font-medium tracking-wide mb-1.5"
        style={{ color: theme.primary }}
      >
        TODAY&apos;S BRIEF
      </Text>
      <Text
        className="text-lg font-semibold leading-6"
        style={{ color: theme.foreground }}
      >
        {brief.headline}
      </Text>

      {brief.conditions && <ConditionStats conditions={brief.conditions} />}

      {tips.length > 0 && (
        <View className="mt-5 gap-4">
          {tips.map((tip, i) => {
            const { Icon, color } = TIP_ICONS[tip.source] ?? TIP_ICONS.products;
            return (
              <View key={`${tip.source}-${i}`} className="flex-row items-start gap-3">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <Icon size={15} color={color} />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-medium leading-5"
                    style={{ color: theme.foreground }}
                  >
                    {tip.title}
                  </Text>
                  <Text
                    className="text-[13px] mt-0.5 leading-5"
                    style={{ color: theme.muted }}
                  >
                    {tip.detail}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {pick && (
        <Pressable
          onPress={openPick}
          className="mt-5 rounded-xl p-3.5 flex-row items-center gap-3"
          style={{ borderWidth: 1, borderColor: theme.border }}
        >
          <View className="flex-1">
            <Text
              className="text-[11px] font-medium"
              style={{ color: theme.primary }}
            >
              {pick.owned ? "USE WHAT YOU HAVE" : "PRODUCT PICK"}
            </Text>
            <Text
              className="text-sm font-semibold mt-0.5"
              style={{ color: theme.foreground }}
            >
              {pick.name}
            </Text>
            {(pick.brand || pick.price != null) && (
              <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
                {[pick.brand, pick.price != null ? `₹${pick.price}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            )}
            <Text
              className="text-[13px] mt-1.5 leading-5"
              style={{ color: theme.muted }}
            >
              {pick.reason}
            </Text>
          </View>
          <ChevronRight size={16} color={theme.muted} />
        </Pressable>
      )}

      {brief.summary && (
        <Text className="text-[12px] mt-3 leading-4" style={{ color: theme.muted }}>
          {brief.summary}
        </Text>
      )}
    </View>
  );
}
