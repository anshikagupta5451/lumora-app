import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronRight,
  LogOut,
  Pencil,
  Settings as SettingsIcon,
  Sparkles,
  User as UserIcon,
  Flame,
  Package,
  FileText,
  Award,
  CalendarCheck,
  BookOpen,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  getStreak,
  getCheckInHistory,
  updateCheckIn,
  CheckIn,
} from "../../../src/api/checkins";
import { useTheme } from "../../../src/theme/ThemeContext";

import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { Text } from "../../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import { getMySkinProfile } from "../../../src/api/skinProfile";
import { getBounties } from "../../../src/api/bounties";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { CheckInRow, isToday } from "../../../components/CheckInJournal";
import { iconColors } from "../../../src/theme/iconColors";

interface SkinProfile {
  skinType: string;
  concerns: string[];
  sensitivities: string[];
  goals: string[];
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function Pill({ label, theme }: { label: string; theme: any }) {
  return (
    <View
      className="rounded-full px-3 py-1.5 mr-2 mb-2"
      style={{
        backgroundColor: theme.primaryLight,
        borderWidth: 1,
        borderColor: theme.primary,
      }}
    >
      <Text
        className="text-xs font-medium capitalize"
        style={{ color: theme.primary }}
      >
        {label}
      </Text>
    </View>
  );
}

function MenuRow({
  icon: Icon,
  color,
  label,
  onPress,
  theme,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  label: string;
  onPress: () => void;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3"
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon size={16} color={color} />
        </View>
        <Text
          className="text-sm font-medium"
          style={{ color: theme.foreground }}
        >
          {label}
        </Text>
      </View>
      <ChevronRight size={16} color={theme.muted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<SkinProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<CheckIn[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getCheckInHistory();
      setHistory(data);
    } catch {
      // fail silently
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMySkinProfile();
      setProfile(data as SkinProfile);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const data = await getStreak();
      setStreak(data.streak);
      setTotalCheckIns(data.totalCheckIns);
    } catch {
      // fail silently
    }
  }, []);

  const loadPoints = useCallback(async () => {
    try {
      const data = await getBounties();
      setTotalPoints(data.totalPoints);
    } catch {
      // fail silently
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadStreak();
      loadHistory();
      loadPoints();
    }, [loadProfile, loadStreak, loadHistory, loadPoints]),
  );

  const handleLogout = async () => {
    await logout();
    Toast.show({ type: "success", text1: "Logged out" });
    router.replace("/(auth)/login");
  };

  const handleEditCheckIn = async (
    id: string,
    updates: { mood: number; note: string },
  ) => {
    try {
      const updated = await updateCheckIn(id, updates);
      setHistory((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      Toast.show({ type: "error", text1: "Could not update — try again" });
    }
  };

  const todayEntry = history.find((c) => isToday(c.createdAt));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadProfile();
          }}
        />
      }
    >
      {/* User header */}
      <View className="items-center mt-4 mb-6">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{
            backgroundColor: theme.primaryLight,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
        >
          {user?.name ? (
            <Text
              className="text-2xl font-bold"
              style={{ color: theme.primary }}
            >
              {getInitials(user.name)}
            </Text>
          ) : (
            <UserIcon size={28} color="white" />
          )}
        </View>
        <Text
          className="text-lg font-semibold"
          style={{ color: theme.foreground }}
        >
          {user?.name || "Lumora User"}
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: theme.muted }}>
          {user?.email}
        </Text>

        <Pressable
          onPress={() => router.push("/(main)/edit-profile")}
          className="flex-row items-center gap-1.5 mt-3 rounded-full px-3.5 py-1.5"
          style={{ borderWidth: 1, borderColor: theme.border }}
        >
          <Pencil size={12} color={theme.muted} />
          <Text className="text-xs font-medium" style={{ color: theme.muted }}>
            Edit profile
          </Text>
        </Pressable>
      </View>

      {/* Skin profile card */}
      <Card
        className="p-4 mb-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: `${iconColors.purple}22` }}
            >
              <Sparkles size={15} color={iconColors.purple} />
            </View>
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.foreground }}
            >
              Your Skin Profile
            </Text>
          </View>
          {profile && (
            <Pressable onPress={() => router.push("/(onboarding)/skin-type")}>
              <Text
                className="text-xs font-medium"
                style={{ color: theme.primary }}
              >
                Redo
              </Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <Text className="text-sm" style={{ color: theme.muted }}>
            Loading...
          </Text>
        ) : profile ? (
          <View>
            <Text className="text-xs mb-1" style={{ color: theme.muted }}>
              Skin type
            </Text>
            <Text
              className="text-sm font-medium capitalize mb-3"
              style={{ color: theme.foreground }}
            >
              {profile.skinType}
            </Text>

            {profile.concerns?.length > 0 && (
              <>
                <Text className="text-xs mb-1.5" style={{ color: theme.muted }}>
                  Concerns
                </Text>
                <View className="flex-row flex-wrap mb-3">
                  {profile.concerns.map((c) => (
                    <Pill key={c} label={c} theme={theme} />
                  ))}
                </View>
              </>
            )}

            {profile.goals?.length > 0 && (
              <>
                <Text className="text-xs mb-1.5" style={{ color: theme.muted }}>
                  Goals
                </Text>
                <View className="flex-row flex-wrap">
                  {profile.goals.map((g) => (
                    <Pill key={g} label={g} theme={theme} />
                  ))}
                </View>
              </>
            )}
          </View>
        ) : (
          <View>
            <Text className="text-sm mb-3" style={{ color: theme.muted }}>
              You haven&apos;t completed your skin assessment yet.
            </Text>
            <Pressable
              onPress={() => router.push("/(onboarding)/skin-type")}
              className="rounded-xl py-3 items-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="text-white font-medium text-sm">
                Start assessment
              </Text>
            </Pressable>
          </View>
        )}
      </Card>

      {/* Streak card */}
      <Pressable onPress={() => router.push("/(main)/my-stats")}>
        <Card
          className="p-4 mb-4 flex-row items-center justify-around"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <View className="items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mb-1.5"
              style={{ backgroundColor: `${iconColors.amber}22` }}
            >
              <Flame
                size={17}
                color={iconColors.amber}
                fill={streak > 0 ? iconColors.amber : "transparent"}
              />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: theme.foreground }}
            >
              {streak}
            </Text>
            <Text className="text-[14px] mt-0.5" style={{ color: theme.muted }}>
              Day streak
            </Text>
          </View>
          <View
            className="w-px h-10"
            style={{ backgroundColor: theme.border }}
          />
          <View className="items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mb-1.5"
              style={{ backgroundColor: `${iconColors.blue}22` }}
            >
              <CalendarCheck size={16} color={iconColors.blue} />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: theme.foreground }}
            >
              {totalCheckIns}
            </Text>
            <Text className="text-[14px] mt-0.5" style={{ color: theme.muted }}>
              Check-ins
            </Text>
          </View>
          <View
            className="w-px h-10"
            style={{ backgroundColor: theme.border }}
          />
          <View className="items-center">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mb-1.5"
              style={{ backgroundColor: `${iconColors.purple}22` }}
            >
              <Award size={16} color={iconColors.purple} />
            </View>
            <Text
              className="text-lg font-bold"
              style={{ color: theme.foreground }}
            >
              {totalPoints}
            </Text>
            <Text className="text-[14px] mt-0.5" style={{ color: theme.muted }}>
              Points
            </Text>
          </View>
        </Card>
      </Pressable>

      {history.length > 0 && (
        <Card
          className="p-4 mb-4"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.foreground }}
            >
              Your journal
            </Text>
            <Pressable
              onPress={() => router.push("/(main)/journal")}
              className="flex-row items-center gap-0.5"
            >
              <Text
                className="text-xs font-medium"
                style={{ color: theme.primary }}
              >
                View all ({history.length})
              </Text>
              <ChevronRight size={14} color={theme.primary} />
            </Pressable>
          </View>

          {todayEntry ? (
            <CheckInRow
              entry={todayEntry}
              theme={theme}
              showBorder={false}
              onEdit={handleEditCheckIn}
            />
          ) : (
            <Text className="text-sm" style={{ color: theme.muted }}>
              No check-in yet today.
            </Text>
          )}
        </Card>
      )}

      {/* Menu */}
      <Card
        className="px-4 mb-4"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <MenuRow
          icon={SettingsIcon}
          color={iconColors.blue}
          label="Settings"
          onPress={() => router.push("/(main)/settings")}
          theme={theme}
        />
        <MenuRow
          icon={BookOpen}
          color={iconColors.purple}
          label="My Journal"
          onPress={() => router.push("/(main)/journal")}
          theme={theme}
        />
        <MenuRow
          icon={Package}
          color={iconColors.teal}
          label="My Products"
          onPress={() => router.push("/(main)/my-products")}
          theme={theme}
        />
        <MenuRow
          icon={FileText}
          color={iconColors.pink}
          label="My Posts"
          onPress={() => router.push("/(main)/my-posts")}
          theme={theme}
        />
      </Card>

      {/* Logout */}
      <Pressable
        onPress={handleLogout}
        className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 mt-2"
        style={{ borderWidth: 1, borderColor: theme.border }}
      >
        <LogOut size={16} color={theme.muted} />
        <Text className="font-medium" style={{ color: theme.foreground }}>
          Log out
        </Text>
      </Pressable>
    </ScrollView>
  );
}
