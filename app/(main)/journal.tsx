import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { useFocusEffect, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
import { CheckInRow } from "../../components/CheckInJournal";

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getCheckInHistory()
        .then(setHistory)
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }, []),
  );

  const handleDelete = async (id: string) => {
    setHistory((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteCheckIn(id);
    } catch {
      Toast.show({ type: "error", text1: "Could not delete — try again" });
      getCheckInHistory()
        .then(setHistory)
        .catch(() => {});
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
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1"
        >
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>
            Back
          </Text>
        </Pressable>
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
          Your journal
        </Text>
        <Text className="text-sm mb-5" style={{ color: theme.muted }}>
          {loading
            ? "Loading your check-ins..."
            : `${history.length} check-in${history.length === 1 ? "" : "s"}`}
        </Text>

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
              No check-ins yet. Head to Home to log how your skin is feeling.
            </Text>
          </Card>
        ) : (
          <Card
            className="p-4"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            {history.map((entry, index) => (
              <CheckInRow
                key={entry.id}
                entry={entry}
                theme={theme}
                showBorder={index < history.length - 1}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
