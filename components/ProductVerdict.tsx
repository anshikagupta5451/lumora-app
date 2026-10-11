import { useRouter } from "expo-router";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { Verdict, VerdictCheckStatus } from "../src/api/products";
import { iconColors } from "../src/theme/iconColors";
import { useTheme } from "../src/theme/ThemeContext";
import { Card } from "./ui/Card";
import { Text } from "./ui/Text";

// Verdict colors stay fixed across themes so "avoid" always reads as red.
const RED = "#EF4444";

const STATUS_STYLE: Record<VerdictCheckStatus, { color: string; Icon: typeof Info }> = {
  bad: { color: RED, Icon: XCircle },
  caution: { color: iconColors.amber, Icon: AlertTriangle },
  good: { color: iconColors.green, Icon: CheckCircle2 },
  info: { color: iconColors.blue, Icon: Info },
};

const OVERALL_COLOR: Record<Verdict["overall"], string> = {
  great: iconColors.green,
  good: iconColors.green,
  caution: iconColors.amber,
  avoid: RED,
  unknown: iconColors.blue,
};

// "Is this right for me?" — the headline banner plus every check behind it.
// Shared by the in-shop scan result and the product detail page.
export function ProductVerdict({ verdict }: { verdict: Verdict }) {
  const router = useRouter();
  const { theme } = useTheme();
  const overallColor = OVERALL_COLOR[verdict.overall];

  return (
    <View>
      <View
        className="rounded-2xl p-4"
        style={{ backgroundColor: overallColor + "1A", borderWidth: 1, borderColor: overallColor }}
      >
        <Text className="text-xs font-semibold uppercase" style={{ color: overallColor }}>
          Is this right for me?
        </Text>
        <Text className="text-xl font-bold mt-1" style={{ color: theme.foreground }}>
          {verdict.headline}
        </Text>
        {verdict.overall === "unknown" ? (
          <Pressable onPress={() => router.push("/(onboarding)/skin-type")} className="mt-2">
            <Text className="text-sm font-medium underline" style={{ color: theme.primary }}>
              Take the skin quiz
            </Text>
          </Pressable>
        ) : null}
      </View>

      {verdict.checks.length ? (
        <Card className="mt-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          {verdict.checks.map((check, i) => {
            const { color, Icon } = STATUS_STYLE[check.status];
            return (
              <View
                key={`${check.kind}-${i}`}
                className="flex-row gap-3 p-4"
                style={i > 0 ? { borderTopWidth: 1, borderTopColor: theme.border } : undefined}
              >
                <Icon size={20} color={color} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                    {check.title}
                  </Text>
                  <Text className="text-sm mt-0.5" style={{ color: theme.muted }}>
                    {check.detail}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}
    </View>
  );
}
