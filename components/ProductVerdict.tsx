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

function percentColor(percent: number) {
  if (percent >= 70) return iconColors.green;
  if (percent >= 40) return iconColors.amber;
  return RED;
}

// "Is this right for me?" — the headline banner with the match percentage,
// a bar per concern, and every check behind them. Shared by the in-shop
// scan result and the product detail page.
export function ProductVerdict({ verdict }: { verdict: Verdict }) {
  const router = useRouter();
  const { theme } = useTheme();
  const overallColor = OVERALL_COLOR[verdict.overall];
  // Older backends don't send a match yet.
  const percent = verdict.match?.percent ?? null;
  const concerns = verdict.match?.concerns ?? [];

  return (
    <View>
      <View
        className="rounded-2xl p-4 flex-row items-center gap-4"
        style={{ backgroundColor: overallColor + "1A", borderWidth: 1, borderColor: overallColor }}
      >
        <View className="flex-1">
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
        {percent != null ? (
          <View className="items-center">
            <Text className="text-3xl font-bold" style={{ color: percentColor(percent) }}>
              {percent}%
            </Text>
            <Text className="text-xs font-medium" style={{ color: theme.muted }}>
              match for you
            </Text>
          </View>
        ) : null}
      </View>

      {concerns.length ? (
        <Card className="mt-4 p-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text className="text-xs font-semibold uppercase mb-1" style={{ color: theme.primary }}>
            For your concerns
          </Text>
          {concerns.map((c) => {
            const color = c.percent == null ? theme.muted : percentColor(c.percent);
            return (
              <View key={c.label} className="mt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold flex-1" style={{ color: theme.foreground }}>
                    {c.label}
                    {c.fromScan ? (
                      <Text className="text-xs font-normal" style={{ color: theme.muted }}>
                        {"  "}from your face scan
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="text-sm font-bold" style={{ color }}>
                    {c.percent == null ? "–" : `${c.percent}%`}
                  </Text>
                </View>
                <View
                  className="h-2 rounded-full mt-1.5 overflow-hidden"
                  style={{ backgroundColor: theme.border }}
                >
                  <View
                    className="h-2 rounded-full"
                    style={{ width: `${c.percent ?? 0}%`, backgroundColor: color }}
                  />
                </View>
                <Text className="text-xs mt-1" style={{ color: theme.muted }}>
                  {c.reason}
                </Text>
              </View>
            );
          })}
        </Card>
      ) : null}

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
