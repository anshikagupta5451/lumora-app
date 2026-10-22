import React, { useCallback, useEffect, useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronLeft, ScanFace, Sparkles, Cpu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/theme/ThemeContext";
import { iconColors } from "../../src/theme/iconColors";
import { useFaceScanStore } from "../../src/store/useFaceScanStore";
import { getLatestFaceScan, FaceScanResult } from "../../src/api/faceScan";
import {
  getRecommendationsFromScan,
  ScanRecommendationsResponse,
  SuggestionSource,
} from "../../src/api/recommendations";
import {
  SuggestionSourcePicker,
  PlanSummary,
  ConcernSuggestionCard,
  WebSources,
} from "../../components/ScanSuggestions";
import { getMySkinProfile, updateMonthlyBudget } from "../../src/api/skinProfile";

function ScoreBar({
  label,
  score,
  detected,
  reasoning,
}: {
  label: string;
  score: number;
  detected: boolean;
  reasoning?: string;
}) {
  const { theme } = useTheme();
  const color = detected ? iconColors.pink : theme.muted;
  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-sm font-medium" style={{ color: theme.foreground }}>
          {label}
        </Text>
        <Text className="text-xs font-semibold" style={{ color }}>
          {score}
        </Text>
      </View>
      <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
        <View style={{ width: `${score}%`, height: "100%", backgroundColor: color }} />
      </View>
      {reasoning && (
        <Text className="text-xs mt-1 leading-4" style={{ color: theme.muted }}>
          {reasoning}
        </Text>
      )}
    </View>
  );
}

const DETECTION_COLORS: Record<string, string> = {
  darkCircles: iconColors.purple,
  darkSpots: iconColors.amber,
  acne: iconColors.pink,
};

function severityLabel(score: number): string {
  if (score >= 80) return "Significant";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Mild";
  return "Minimal";
}

// Draws the captured photo at its true aspect ratio and overlays a marker
// per detected spot/region, positioned from Gemini's normalized (0-1000)
// bounding boxes — see src/lib/geminiVision.ts on the backend. Tabs filter
// which markers are shown, mirroring the reference "deep scan" UX this
// was built to match.
function AnnotatedScanPhoto({ scan }: { scan: FaceScanResult }) {
  const { theme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const containerWidth = screenWidth - 32;
  const aspect = scan.imageWidth! / scan.imageHeight!;
  const containerHeight = containerWidth / aspect;

  const uniqueKeys = Array.from(new Set(scan.detections.map((d) => d.key)));
  const labelFor = (key: string) => scan.concerns.find((c) => c.key === key)?.label ?? key;

  const visibleDetections = scan.detections.filter((d) => !activeKey || d.key === activeKey);
  const detectedConcerns = scan.concerns.filter((c) => c.detected);
  const activeConcern = activeKey ? scan.concerns.find((c) => c.key === activeKey) : null;

  return (
    <View className="mb-5">
      <View
        style={{
          width: containerWidth,
          height: containerHeight,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: theme.border,
        }}
      >
        <Image source={{ uri: scan.imageUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        {visibleDetections.map((d, i) => {
          const [ymin, xmin, ymax, xmax] = d.box;
          const left = (xmin / 1000) * containerWidth;
          const top = (ymin / 1000) * containerHeight;
          const w = Math.max(16, ((xmax - xmin) / 1000) * containerWidth);
          const h = Math.max(16, ((ymax - ymin) / 1000) * containerHeight);
          const color = DETECTION_COLORS[d.key] ?? iconColors.pink;
          return (
            <View
              key={`${d.key}-${i}`}
              pointerEvents="none"
              style={{
                position: "absolute",
                left,
                top,
                width: w,
                height: h,
                borderRadius: 9999,
                borderWidth: 2,
                borderColor: color,
                borderStyle: d.key === "darkCircles" ? "dashed" : "solid",
              }}
            />
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 8 }}
      >
        <Pressable
          onPress={() => setActiveKey(null)}
          className="rounded-full px-3.5 py-2"
          style={{
            backgroundColor: !activeKey ? theme.primary : theme.card,
            borderWidth: 1,
            borderColor: !activeKey ? theme.primary : theme.border,
          }}
        >
          <Text className="text-xs font-semibold" style={{ color: !activeKey ? "#fff" : theme.foreground }}>
            All
          </Text>
        </Pressable>
        {uniqueKeys.map((key) => (
          <Pressable
            key={key}
            onPress={() => setActiveKey(key)}
            className="rounded-full px-3.5 py-2"
            style={{
              backgroundColor: activeKey === key ? theme.primary : theme.card,
              borderWidth: 1,
              borderColor: activeKey === key ? theme.primary : theme.border,
            }}
          >
            <Text className="text-xs font-semibold" style={{ color: activeKey === key ? "#fff" : theme.foreground }}>
              {labelFor(key)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Card className="p-4 mt-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        {!activeConcern ? (
          <>
            <Text className="text-base font-bold" style={{ color: theme.foreground }}>
              {detectedConcerns.length} {detectedConcerns.length === 1 ? "concern" : "concerns"} detected
            </Text>
            <Text className="text-sm mt-1" style={{ color: theme.muted }}>
              {detectedConcerns.length > 0
                ? detectedConcerns.map((c) => c.label).join(", ")
                : "Nothing significant — your skin looks clear."}
            </Text>
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold" style={{ color: theme.foreground }}>
                {activeConcern.label}
              </Text>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${DETECTION_COLORS[activeConcern.key] ?? iconColors.pink}22` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: DETECTION_COLORS[activeConcern.key] ?? iconColors.pink }}
                >
                  {severityLabel(activeConcern.score)}
                </Text>
              </View>
            </View>
            {activeConcern.reasoning && (
              <Text className="text-sm mt-2 leading-5" style={{ color: theme.muted }}>
                {activeConcern.reasoning}
              </Text>
            )}
          </>
        )}
      </Card>
    </View>
  );
}

export default function FaceScanResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [scan, setScan] = useState<FaceScanResult | null>(useFaceScanStore((s) => s.latestScan));
  const [loadingScan, setLoadingScan] = useState(!scan);
  const [recs, setRecs] = useState<ScanRecommendationsResponse | null>(null);
  const [source, setSource] = useState<SuggestionSource | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  // With no source the backend picks a sensible default (owned products
  // if any fit, else Lumora picks) and tells us which it used.
  const loadRecs = useCallback(async (nextSource?: SuggestionSource) => {
    setLoadingRecs(true);
    setRecsError(null);
    if (nextSource) setSource(nextSource);
    try {
      const data = await getRecommendationsFromScan(nextSource);
      setRecs(data);
      setSource(data.source);
      setBudgetInput(data.budget ? String(data.budget) : "");
    } catch (err: any) {
      setRecs(null);
      setRecsError(err.message || "Could not load suggestions");
    } finally {
      setLoadingRecs(false);
    }
  }, []);

  useEffect(() => {
    if (scan) {
      loadRecs();
      return;
    }
    getLatestFaceScan()
      .then((result) => {
        setScan(result);
      })
      .catch(() => {
        Toast.show({ type: "info", text1: "No scan found — take one first" });
        router.replace("/(main)/face-scan");
      })
      .finally(() => setLoadingScan(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scan) loadRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scan]);

  useEffect(() => {
    getMySkinProfile()
      .then((profile: any) => {
        if (typeof profile?.monthlyBudget === "number") {
          setBudgetInput(String(profile.monthlyBudget));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveBudget = async () => {
    const value = Number(budgetInput);
    if (!budgetInput || Number.isNaN(value) || value < 0) {
      Toast.show({ type: "error", text1: "Enter a valid budget amount" });
      return;
    }
    setSavingBudget(true);
    try {
      await updateMonthlyBudget(value);
      Toast.show({ type: "success", text1: "Budget saved" });
      await loadRecs(source ?? undefined);
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not save budget" });
    } finally {
      setSavingBudget(false);
    }
  };

  if (loadingScan || !scan) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }} className="items-center justify-center">
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const sortedConcerns = [...scan.concerns].sort((a, b) => b.score - a.score);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
    >
      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 12 }}>
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1">
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/(main)/face-scan")}
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: theme.primaryLight }}
        >
          <ScanFace size={14} color={theme.primary} />
          <Text className="text-xs font-medium" style={{ color: theme.primary }}>Scan again</Text>
        </Pressable>
      </View>

      <View className="p-4">
        {scan.detections.length > 0 && scan.imageWidth && scan.imageHeight ? (
          <AnnotatedScanPhoto scan={scan} />
        ) : (
          <View className="flex-row items-center gap-3 mb-5">
            <Image source={{ uri: scan.imageUrl }} style={{ width: 56, height: 56, borderRadius: 28 }} />
            <View className="flex-1">
              <Text className="text-xl font-bold" style={{ color: theme.foreground }}>
                Your skin scan
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: theme.muted }}>
                {new Date(scan.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
              CONCERN BREAKDOWN
            </Text>
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-1"
              style={{
                backgroundColor: scan.source === "ai" ? `${iconColors.purple}18` : `${theme.muted}18`,
              }}
            >
              {scan.source === "ai" ? (
                <Sparkles size={11} color={iconColors.purple} />
              ) : (
                <Cpu size={11} color={theme.muted} />
              )}
              <Text
                className="text-[10px] font-semibold"
                style={{ color: scan.source === "ai" ? iconColors.purple : theme.muted }}
              >
                {scan.source === "ai" ? "Analyzed by AI" : "Offline estimate"}
              </Text>
            </View>
          </View>
          {sortedConcerns.map((c) => (
            <ScoreBar key={c.key} label={c.label} score={c.score} detected={c.detected} reasoning={c.reasoning} />
          ))}
          <Text className="text-[11px] mt-1" style={{ color: theme.muted }}>
            {scan.source === "ai"
              ? "Read by Gemini from your photo — a quick guide, not a dermatologist's diagnosis."
              : "Google's AI wasn't reachable, so this used an offline pixel-based estimate — less precise than the AI analysis."}
          </Text>
        </Card>

        <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text className="text-sm font-semibold mb-1" style={{ color: theme.foreground }}>
            Your monthly skincare budget
          </Text>
          <Text className="text-xs mb-3" style={{ color: theme.muted }}>
            Used to keep product suggestions within what you&apos;d actually spend.
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 rounded-xl px-3.5 py-3 text-sm"
              style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card, color: theme.foreground }}
              placeholder="e.g. 1500"
              placeholderTextColor={theme.muted}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <Pressable
              onPress={handleSaveBudget}
              disabled={savingBudget}
              className="rounded-xl px-4 items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white font-medium text-sm">
                {savingBudget ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </Card>

        {sortedConcerns.some((c) => c.detected) && (
          <Card className="p-4 mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <SuggestionSourcePicker
              value={source ?? "promoted"}
              onChange={(next) => next !== source && loadRecs(next)}
              disabled={loadingRecs}
            />
          </Card>
        )}

        {loadingRecs ? (
          <View className="items-center py-8">
            <ActivityIndicator color={theme.primary} />
            {source === "web" && (
              <Text className="text-xs mt-3" style={{ color: theme.muted }}>
                Searching for products that fit your budget…
              </Text>
            )}
          </View>
        ) : recsError ? (
          <Card className="p-4 items-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Text className="text-sm text-center" style={{ color: theme.muted }}>
              {recsError}
            </Text>
            <Pressable
              onPress={() => loadRecs(source ?? undefined)}
              className="mt-3 rounded-lg px-4 py-2"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Text className="text-xs font-medium" style={{ color: theme.primary }}>
                Try again
              </Text>
            </Pressable>
          </Card>
        ) : !recs || recs.concerns.length === 0 ? (
          <Card className="p-4 items-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <Text className="text-sm text-center" style={{ color: theme.muted }}>
              No strong concerns detected — keep up your routine and scan again in a few weeks.
            </Text>
          </Card>
        ) : (
          <>
            <PlanSummary data={recs} />
            {recs.concerns.map((rec) => (
              <ConcernSuggestionCard key={rec.key} rec={rec} />
            ))}
            <WebSources data={recs} />
          </>
        )}
      </View>
    </ScrollView>
  );
}
