import React from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import {
  PackageCheck,
  Star,
  Globe,
  ChevronRight,
  ExternalLink,
} from "lucide-react-native";
import { Text } from "./ui/Text";
import { Card } from "./ui/Card";
import { useTheme } from "../src/theme/ThemeContext";
import { iconColors } from "../src/theme/iconColors";
import type {
  ScanRecommendation,
  ScanRecommendationsResponse,
  SuggestedItem,
  SuggestionSource,
} from "../src/api/recommendations";

const SOURCES: {
  key: SuggestionSource;
  label: string;
  Icon: typeof Globe;
  color: string;
}[] = [
  { key: "owned", label: "My products", Icon: PackageCheck, color: iconColors.teal },
  { key: "promoted", label: "Lumora picks", Icon: Star, color: iconColors.amber },
  { key: "web", label: "From the web", Icon: Globe, color: iconColors.blue },
];

const SOURCE_BLURB: Record<SuggestionSource, string> = {
  owned: "Products you already have that target each concern — nothing new to buy.",
  promoted: "Matches from the Lumora catalog. Featured products are ones we're promoting.",
  web: "Products sold in India, found by AI and kept within your budget.",
};

export function SuggestionSourcePicker({
  value,
  onChange,
  disabled,
}: {
  value: SuggestionSource;
  onChange: (source: SuggestionSource) => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View>
      <Text className="text-sm font-semibold mb-2" style={{ color: theme.foreground }}>
        Suggest products from
      </Text>
      <View className="flex-row gap-2">
        {SOURCES.map(({ key, label, Icon, color }) => {
          const active = key === value;
          return (
            <Pressable
              key={key}
              disabled={disabled}
              onPress={() => onChange(key)}
              className="flex-1 items-center rounded-xl py-2.5 px-1"
              style={{
                backgroundColor: active ? `${color}1F` : theme.card,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? color : theme.border,
              }}
            >
              <Icon size={16} color={active ? color : theme.muted} />
              <Text
                className="text-[11px] font-semibold mt-1 text-center"
                style={{ color: active ? theme.foreground : theme.muted }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="text-xs mt-2 leading-4" style={{ color: theme.muted }}>
        {SOURCE_BLURB[value]}
      </Text>
    </View>
  );
}

export function PlanSummary({ data }: { data: ScanRecommendationsResponse }) {
  const { theme } = useTheme();
  const { plan, source, web } = data;

  if (source === "owned") return null;

  const over = plan.budget != null && plan.total > plan.budget;
  return (
    <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
            YOUR PLAN
          </Text>
          <Text className="text-lg font-bold mt-0.5" style={{ color: theme.foreground }}>
            {source === "web" ? "~" : ""}₹{plan.total.toLocaleString("en-IN")}
            <Text className="text-sm font-normal" style={{ color: theme.muted }}>
              {plan.budget != null ? ` of ₹${plan.budget.toLocaleString("en-IN")}` : ""}
            </Text>
          </Text>
        </View>
        <Text className="text-xs mb-1" style={{ color: theme.muted }}>
          {plan.productCount} product{plan.productCount === 1 ? "" : "s"}
        </Text>
      </View>

      {plan.budget != null && plan.budget > 0 && (
        <View className="h-1.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: theme.primaryLight }}>
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (plan.total / plan.budget) * 100)}%`,
              backgroundColor: over ? iconColors.morning : theme.primary,
            }}
          />
        </View>
      )}

      <Text className="text-[11px] mt-2.5 leading-4" style={{ color: theme.muted }}>
        {plan.budget == null
          ? "Add a monthly budget above to keep the total in check."
          : "Covers your top concerns first, and a product that helps with several is only counted once."}
        {source === "web" &&
          (web?.grounded
            ? " Prices are from live web results."
            : " Prices are approximate AI estimates — check before buying.")}
      </Text>
    </Card>
  );
}

function ItemRow({ item, concernLabel }: { item: SuggestedItem; concernLabel: string }) {
  const { theme } = useTheme();
  const router = useRouter();
  const also = item.alsoFor.filter((l) => l !== concernLabel);

  const onPress = () => {
    if (item.tag === "owned") router.push("/(main)/my-products");
    else if (item.productId) router.push(`/(main)/product/${item.productId}`);
    else if (item.url) openBrowserAsync(item.url);
  };

  const badge =
    item.tag === "owned"
      ? { text: "You own this", color: iconColors.teal }
      : item.tag === "featured"
        ? { text: "Featured", color: iconColors.amber }
        : item.tag === "web"
          ? { text: "Web", color: iconColors.blue }
          : null;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl p-3 mb-2"
      style={{ borderWidth: 1, borderColor: theme.border }}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-sm font-semibold shrink" style={{ color: theme.foreground }}>
            {item.name}
          </Text>
          {badge && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: `${badge.color}22` }}>
              <Text className="text-[10px] font-semibold" style={{ color: badge.color }}>
                {badge.text}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
          {[
            item.brand,
            item.price != null ? `${item.tag === "web" ? "~" : ""}₹${item.price}` : null,
            item.keyIngredient,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        {item.why ? (
          <Text className="text-xs mt-1.5 leading-4" style={{ color: theme.muted }}>
            {item.why}
          </Text>
        ) : null}
        {also.length > 0 && (
          <Text className="text-[11px] mt-1" style={{ color: theme.primary }}>
            Also helps with {also.join(", ").toLowerCase()}
          </Text>
        )}
      </View>
      {item.tag === "web" ? (
        <ExternalLink size={15} color={theme.muted} />
      ) : (
        <ChevronRight size={16} color={theme.muted} />
      )}
    </Pressable>
  );
}

export function ConcernSuggestionCard({ rec }: { rec: ScanRecommendation }) {
  const { theme } = useTheme();
  return (
    <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold" style={{ color: theme.foreground }}>
          {rec.label}
        </Text>
        <Text className="text-xs font-semibold" style={{ color: theme.muted }}>
          {Math.round(rec.score)}/100
        </Text>
      </View>

      {rec.items.length > 0 ? (
        rec.items.map((item, i) => (
          <ItemRow key={`${item.productId ?? item.name}-${i}`} item={item} concernLabel={rec.label} />
        ))
      ) : (
        <View className="rounded-xl p-3 mb-2" style={{ backgroundColor: theme.primaryLight }}>
          <Text className="text-xs leading-4" style={{ color: theme.foreground }}>
            {rec.emptyReason}
          </Text>
        </View>
      )}

      <Text className="text-xs font-semibold mt-2 mb-1.5" style={{ color: iconColors.green }}>
        FREE THINGS TO TRY
      </Text>
      {rec.freeTips.map((tip, i) => (
        <View key={i} className="flex-row gap-2 mb-1">
          <Text style={{ color: theme.muted }}>{"•"}</Text>
          <Text className="text-sm flex-1 leading-5" style={{ color: theme.muted }}>
            {tip}
          </Text>
        </View>
      ))}
    </Card>
  );
}

export function WebSources({ data }: { data: ScanRecommendationsResponse }) {
  const { theme } = useTheme();
  if (data.source !== "web" || !data.web?.sources.length) return null;
  return (
    <View className="mb-4">
      <Text className="text-[11px] font-semibold mb-1" style={{ color: theme.muted }}>
        SOURCES
      </Text>
      {data.web.sources.map((s) => (
        <Pressable key={s.url} onPress={() => openBrowserAsync(s.url)} className="py-1">
          <Text className="text-xs" style={{ color: theme.primary }} numberOfLines={1}>
            {s.title || s.url}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
