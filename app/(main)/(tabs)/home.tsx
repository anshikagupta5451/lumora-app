import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getCurrentLocation } from "../../../src/lib/location";
import { getCurrentWeather, WeatherData } from "../../../src/api/weather";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, ThumbsUp, ThumbsDown, Sun } from "lucide-react-native";
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
} from "../../../src/api/recommedations";
import {
  submitCheckIn,
  getStreak,
  getTodayCheckIn,
} from "../../../src/api/checkins";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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
            <Text className="text-white/80 text-xs">
              Good morning{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </Text>
            <Text className="text-white text-2xl font-bold mt-1">
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

        {weather && (
          <Card
            className="mt-4 p-4 flex-row items-center justify-between"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <View className="flex-row items-center gap-2">
              <Sun size={20} color={theme.primary} />
              <View>
                <Text
                  className="text-sm font-medium"
                  style={{ color: theme.foreground }}
                >
                  {weather.temp}°C · {weather.condition}
                </Text>
                <Text className="text-[11px]" style={{ color: theme.muted }}>
                  Humidity {weather.humidity}%
                </Text>
              </View>
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
              className="text-[11px] uppercase mt-0.5"
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
