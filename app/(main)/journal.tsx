import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { useFocusEffect, useRouter } from "expo-router";
import { Camera, ChevronLeft, Crown, LockKeyhole, Plus } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../components/ui/Card";
import { useTheme } from "../../src/theme/ThemeContext";
import {
  getCheckInHistory,
  deleteCheckIn,
  updateCheckIn,
  CheckIn,
} from "../../src/api/checkins";
import { getMyProfile } from "../../src/api/users";
import {
  getLocalCheckInPhotos,
  deleteLocalCheckInPhotos,
  supportsLocalCheckInPhotos,
} from "../../src/lib/localCheckInPhotos";
import { useAuthStore } from "../../src/store/useAuthStore";
import { CheckInRow } from "../../components/CheckInJournal";

async function withDisplayImages(entries: CheckIn[], useCloud: boolean) {
  if (useCloud) return entries;
  return Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      images: await getLocalCheckInPhotos(entry.id),
    })),
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isPremium = Boolean(user?.isPremium);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [data, profile] = await Promise.all([
        getCheckInHistory(),
        getMyProfile().catch(() => null),
      ]);
      if (profile) updateUser({ isPremium: profile.isPremium });
      // Default to "not premium" when the profile fetch fails, so we never
      // risk showing photos that should have stayed on-device.
      const useCloud = Boolean(profile?.isPremium) || !supportsLocalCheckInPhotos;
      setHistory(await withDisplayImages(data, useCloud));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const handleDelete = async (id: string) => {
    setHistory((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCheckIn(id);
      await deleteLocalCheckInPhotos(id);
    } catch {
      Toast.show({ type: "error", text1: "Could not delete — try again" });
      loadHistory();
    }
  };

  const handleEdit = async (
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }}
    >
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1"
          >
            <ChevronLeft size={18} color={theme.muted} />
            <Text className="text-sm" style={{ color: theme.muted }}>
              Back
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(main)/(tabs)/home")}
            className="flex-row items-center gap-1 rounded-full px-3 py-2"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <Plus size={15} color={theme.primary} />
            <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
              New entry
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: theme.foreground }}
        >
          Skin journal
        </Text>
        <Text className="text-sm mb-5" style={{ color: theme.muted }}>
          {loading
            ? "Loading your check-ins..."
            : `${history.length} check-in${history.length === 1 ? "" : "s"} · ${history.reduce((total, entry) => total + (entry.images?.length || 0), 0)} photos`}
        </Text>

        <Card
          className="p-4 mb-4"
          style={{ backgroundColor: theme.primaryLight, borderColor: theme.primary }}
        >
          <View className="flex-row gap-3">
            <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: theme.card }}>
              <Camera size={18} color={theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                See your skin story over time
              </Text>
              <Text className="text-xs leading-4 mt-1" style={{ color: theme.muted }}>
                Add photos to any daily check-in from Home. They stay attached to that day, alongside your mood and notes.
              </Text>
            </View>
          </View>
        </Card>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : history.length === 0 ? (
          <Card
            className="p-5 items-center"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <Text
              className="text-sm text-center"
              style={{ color: theme.muted }}
            >
              No check-ins yet. Head to Home to log how your skin is feeling and add a progress photo.
            </Text>
            <Pressable
              onPress={() => router.push("/(main)/(tabs)/home")}
              className="mt-4 rounded-xl px-4 py-2.5 flex-row items-center gap-2"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus size={16} color="#fff" />
              <Text className="text-xs font-semibold text-white">Create your first entry</Text>
            </Pressable>
          </Card>
        ) : (
          <View className="gap-3">
            {history.map((entry) => (
              <Card
                key={entry.id}
                className="p-4"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
              >
                <CheckInRow
                  entry={entry}
                  theme={theme}
                  showBorder={false}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </Card>
            ))}
          </View>
        )}

        <Card
          className="p-4 mt-4 mb-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <View className="flex-row gap-3 items-start">
            <LockKeyhole size={18} color={theme.primary} />
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                  Keep your photo diary personal
                </Text>
                <Crown size={14} color={theme.primary} />
              </View>
              <Text className="text-xs leading-4 mt-1" style={{ color: theme.muted }}>
                {isPremium
                  ? "Journal photos stay separate from community posts and are backed up to your account."
                  : "Journal photos stay separate from community posts and never leave this device. Go Premium to back them up and access them from any device."}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
