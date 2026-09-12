import React, { useState, useCallback } from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Text, TextInput } from "../../../components/ui/Text";
import { useFocusEffect, useRouter } from "expo-router";
import { getCurrentLocation } from "../../../src/lib/location";
import { getCurrentWeather, WeatherData } from "../../../src/api/weather";
import { LinearGradient } from "expo-linear-gradient";
import {
  Flame,
  ThumbsUp,
  ThumbsDown,
  Sun,
  Moon,
  Award,
  CheckCircle2,
  ListChecks,
  ChevronRight,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "../../../components/ui/Card";
import { MoodPicker } from "../../../components/MoodPicker";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useTheme } from "../../../src/theme/ThemeContext";
import {
  getLatestRecommendation,
  generateRecommendation,
  submitRecommendationFeedback,
  RecommendationResponse,
} from "../../../src/api/recommendations";
import {
  submitCheckIn,
  getStreak,
  getTodayCheckIn,
} from "../../../src/api/checkins";
import { getBounties, Bounty } from "../../../src/api/bounties";
import { getMyRoutines, Routine } from "../../../src/api/routines";
import { iconColors } from "../../../src/theme/iconColors";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(null);
  const [loadingRec, setLoadingRec] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState<
    "helpful" | "not_helpful" | null
  >(null);

  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [bountyPoints, setBountyPoints] = useState(0);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const { theme } = useTheme();

  const loadAll = useCallback(async () => {
    setLoadingRec(true);

    let currentWeather: WeatherData | null = null;
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        currentWeather = await getCurrentWeather(loc.lat, loc.lon);
        setWeather(currentWeather);
      }
    } catch {
      // weather is nice-to-have, not critical
    }

    try {
      let rec: RecommendationResponse;
      try {
        rec = await getLatestRecommendation();
      } catch {
        rec = await generateRecommendation(currentWeather || undefined);
      }
      setRecommendation(rec);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not load your brief",
      });
    } finally {
      setLoadingRec(false);
    }

    try {
      const [streakData, todayCheckIn] = await Promise.all([
        getStreak(),
        getTodayCheckIn(),
      ]);
      setStreak(streakData.streak);
      setCheckedInToday(Boolean(todayCheckIn));
    } catch {
      // fail silently
    }

    try {
      const bountiesData = await getBounties();
      setBounties(bountiesData.bounties);
      setBountyPoints(bountiesData.totalPoints);
    } catch {
      // fail silently
    }

    try {
      setRoutines(await getMyRoutines());
    } catch {
      // fail silently
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
      setFeedbackGiven(null);
    }, [loadAll]),
  );

  const handleFeedback = async (helpful: boolean) => {
    if (!recommendation) return;
    try {
      await submitRecommendationFeedback(recommendation.id, helpful);
      setFeedbackGiven(helpful ? "helpful" : "not_helpful");
    } catch {
      Toast.show({ type: "error", text1: "Could not save feedback" });
    }
  };

  const handleCheckIn = async () => {
    if (!mood) return;
    setSubmittingCheckIn(true);
    try {
      await submitCheckIn(mood, note.trim() || undefined);
      const streakData = await getStreak();
      setStreak(streakData.streak);
      setCheckedInToday(true);
      Toast.show({ type: "success", text1: "Checked in! 🔥" });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not save check-in",
      });
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 30,
                fontWeight: "900",
                lineHeight: 34,
                marginTop: 4,
              }}
            >
              Your AI Beauty Brief
            </Text>
          </View>
          <View className="items-center bg-white/20 rounded-2xl px-3 py-2">
            <Flame
              size={18}
              color="#fff"
              fill={streak > 0 ? "#fff" : "transparent"}
            />
            <Text className="text-white text-sm font-bold mt-0.5">
              {streak}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="p-4">
        {/* Daily check-in card */}
        {!checkedInToday ? (
          <Card
            className="p-4 mb-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text
              className="text-sm font-semibold mb-1"
              style={{ color: theme.foreground }}
            >
              How&apos;s your skin feeling today?
            </Text>
            <Text className="text-xs mb-4" style={{ color: theme.muted }}>
              Quick check-in keeps your streak alive.
            </Text>

            <MoodPicker value={mood} onChange={setMood} />

            {mood !== null && (
              <>
                <TextInput
                  className="rounded-xl px-3.5 py-3 text-sm mt-4"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                    color: theme.foreground,
                  }}
                  placeholder="Anything you want to note? (optional)"
                  placeholderTextColor={theme.muted}
                  value={note}
                  onChangeText={setNote}
                />
                <Pressable
                  onPress={handleCheckIn}
                  disabled={submittingCheckIn}
                  className="rounded-xl py-3 items-center mt-3"
                  style={{
                    backgroundColor: submittingCheckIn
                      ? theme.primaryLight
                      : theme.primary,
                  }}
                >
                  <Text className="text-white font-semibold text-sm">
                    {submittingCheckIn ? "Saving..." : "Check in"}
                  </Text>
                </Pressable>
              </>
            )}
          </Card>
        ) : (
          <Card
            className="p-4 mb-4 items-center"
            style={{
              backgroundColor: theme.primaryLight,
              borderColor: theme.primary,
            }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: theme.foreground }}
            >
              ✓ Checked in today — {streak} day streak!
            </Text>
          </Card>
        )}

        {routines.length > 0 && (
          <Card
            className="mt-4 p-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${iconColors.blue}22` }}
                >
                  <ListChecks size={15} color={iconColors.blue} />
                </View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.foreground }}
                >
                  Your Routines
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/(main)/(tabs)/routine")}
                className="flex-row items-center gap-0.5"
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.primary }}
                >
                  View all
                </Text>
                <ChevronRight size={14} color={theme.primary} />
              </Pressable>
            </View>

            <View className="gap-2.5">
              {routines.map((routine) => {
                const totalSteps = routine.steps.length;
                const completedSteps = routine.steps.filter(
                  (s) => s.completed,
                ).length;
                const routineColor =
                  routine.timeOfDay === "morning"
                    ? iconColors.morning
                    : iconColors.evening;
                return (
                  <Pressable
                    key={routine.id}
                    onPress={() => router.push("/(main)/(tabs)/routine")}
                    className="flex-row items-center gap-2.5 rounded-xl p-3"
                    style={{
                      backgroundColor: theme.background,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${routineColor}22` }}
                    >
                      {routine.timeOfDay === "morning" ? (
                        <Sun size={15} color={routineColor} />
                      ) : (
                        <Moon size={15} color={routineColor} />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-medium"
                        style={{ color: theme.foreground }}
                      >
                        {routine.name}
                      </Text>
                      <Text
                        className="text-xs mt-0.5"
                        style={{ color: theme.muted }}
                      >
                        {completedSteps}/{totalSteps} steps done today
                      </Text>
                    </View>
                    <ChevronRight size={16} color={theme.muted} />
                  </Pressable>
                );
              })}
            </View>
          </Card>
        )}

        {weather && (
          <Card
            className="mt-4 p-4 flex-row items-center justify-between"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-2">
              <View
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: `${iconColors.amber}22` }}
              >
                <Sun size={18} color={iconColors.amber} />
              </View>
              <View>
                <Text
                  className="text-sm font-medium"
                  style={{ color: theme.foreground }}
                >
                  {weather.temp}°C · {weather.condition}
                </Text>
                <Text className="text-[14px]" style={{ color: theme.muted }}>
                  Humidity {weather.humidity}%
                </Text>
              </View>
            </View>
          </Card>
        )}

        {bounties.length > 0 && (
          <Card
            className="mt-4 p-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${iconColors.amber}22` }}
                >
                  <Award size={15} color={iconColors.amber} />
                </View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.foreground }}
                >
                  Bounties
                </Text>
              </View>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${iconColors.amber}22` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: iconColors.amber }}
                >
                  {bountyPoints} pts
                </Text>
              </View>
            </View>

            <View className="gap-2.5">
              {bounties.map((bounty) => (
                <View
                  key={bounty.id}
                  className="flex-row items-start gap-2.5 rounded-xl p-3"
                  style={{
                    backgroundColor: bounty.completed
                      ? `${iconColors.green}18`
                      : theme.background,
                    borderWidth: 1,
                    borderColor: bounty.completed
                      ? iconColors.green
                      : theme.border,
                  }}
                >
                  <CheckCircle2
                    size={18}
                    color={bounty.completed ? iconColors.green : theme.muted}
                    fill={bounty.completed ? iconColors.green : "transparent"}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm font-medium"
                      style={{
                        color: theme.foreground,
                        textDecorationLine: bounty.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {bounty.title}
                    </Text>
                    <Text
                      className="text-xs mt-0.5"
                      style={{ color: theme.muted }}
                    >
                      {bounty.description}
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: iconColors.amber }}
                  >
                    +{bounty.rewardPoints}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Main recommendation */}
        {loadingRec ? (
          <Card
            className="p-4 items-center py-8"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <ActivityIndicator color={theme.primary} />
          </Card>
        ) : !recommendation ? (
          <Card
            className="p-4 items-center"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: theme.muted }}
            >
              Complete your skin assessment to get your first recommendation.
            </Text>
          </Card>
        ) : (
          <Card
            className="p-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text
              className="text-xs font-medium mb-1"
              style={{ color: theme.primary }}
            >
              TODAY&apos;S RECOMMENDATION
            </Text>
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.foreground }}
            >
              {recommendation.productName}
            </Text>
            <Text
              className="text-[14px] uppercase mt-0.5"
              style={{ color: theme.muted }}
            >
              {recommendation.brand}
            </Text>
            <Text
              className="text-sm mt-3 leading-5"
              style={{ color: theme.muted }}
            >
              {recommendation.reason}
            </Text>

            {recommendation.weatherUsed && (
              <Text className="text-[13px] mt-2" style={{ color: theme.muted }}>
                Generated using {recommendation.weatherUsed.temp}°C,{" "}
                {recommendation.weatherUsed.humidity}% humidity
              </Text>
            )}

            {feedbackGiven ? (
              <View
                className="mt-4 rounded-lg py-2.5 items-center"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.primary }}
                >
                  {feedbackGiven === "helpful"
                    ? "Glad it helped! ✓"
                    : "Thanks — we'll adjust future picks."}
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-2 mt-4">
                <Pressable
                  onPress={() => handleFeedback(true)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <ThumbsUp size={14} color={theme.primary} />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: theme.primary }}
                  >
                    Helpful
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFeedback(false)}
                  className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
                  style={{ borderWidth: 1, borderColor: theme.border }}
                >
                  <ThumbsDown size={14} color={theme.muted} />
                  <Text
                    className="text-xs font-medium"
                    style={{ color: theme.muted }}
                  >
                    Not for me
                  </Text>
                </Pressable>
              </View>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
