import { useFocusEffect, useRouter } from "expo-router";
import { Moon, Sun, Trash2, Check, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
  Alert,
} from "react-native";
import { Text } from "../../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import {
  getMyRoutines,
  logRoutineStep,
  Routine,
  deleteRoutine,
} from "../../../src/api/routines";
import { useTheme } from "../../../src/theme/ThemeContext";
import { iconColors } from "../../../src/theme/iconColors";

function SectionHeader({
  label,
  color,
  count,
}: {
  label: string;
  color: string;
  count: number;
}) {
  return (
    <View className="flex-row items-center justify-between mb-2 mt-1">
      <Text
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </Text>
      <Text className="text-xs" style={{ color }}>
        {count} {count === 1 ? "step" : "steps"}
      </Text>
    </View>
  );
}

export default function RoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyRoutines();
      setRoutines(data);
    } catch {
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleToggle = async (
    routineId: string,
    stepId: string,
    currentlyCompleted: boolean,
  ) => {
    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routineId
          ? {
              ...r,
              steps: r.steps.map((s) =>
                s.id === stepId ? { ...s, completed: !currentlyCompleted } : s,
              ),
            }
          : r,
      ),
    );
    try {
      await logRoutineStep(stepId, !currentlyCompleted);
    } catch {
      Toast.show({ type: "error", text1: "Could not save — try again" });
      load();
    }
  };

  const handleDelete = (routineId: string, routineName: string) => {
    Alert.alert(
      "Delete routine?",
      `Are you sure you want to delete "${routineName}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoutine(routineId);
              setRoutines((prev) => prev.filter((r) => r.id !== routineId));
              Toast.show({ type: "success", text1: "Routine deleted" });
            } catch {
              Toast.show({ type: "error", text1: "Could not delete routine" });
            }
          },
        },
      ],
    );
  };

  const morningRoutines = routines.filter((r) => r.timeOfDay === "morning");
  const eveningRoutines = routines.filter((r) => r.timeOfDay === "evening");

  const morningColor = iconColors.morning; // warm coral, fixed regardless of theme — reads as "morning"
  const eveningColor = iconColors.evening; // cool indigo, fixed — reads as "evening"

  const renderRoutineGroup = (group: Routine[], sectionColor: string) =>
    group.map((routine) => {
      const totalSteps = routine.steps.length;
      const completedSteps = routine.steps.filter((s) => s.completed).length;
      const allDone = totalSteps > 0 && completedSteps === totalSteps;

      return (
        <Card
          key={routine.id}
          className="p-4 mb-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2 flex-1">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: allDone ? sectionColor : `${sectionColor}22`,
                }}
              >
                {allDone ? (
                  <Check size={16} color="#fff" />
                ) : routine.timeOfDay === "morning" ? (
                  <Sun size={16} color={sectionColor} />
                ) : (
                  <Moon size={16} color={sectionColor} />
                )}
              </View>
              <Text
                className="text-base font-bold flex-1"
                style={{ color: theme.foreground }}
                numberOfLines={1}
              >
                {routine.name}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(routine.id, routine.name)}
              className="p-1 ml-2"
            >
              <Trash2 size={16} color={theme.muted} />
            </Pressable>
          </View>

          {routine.steps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .map((step, idx) => (
              <Pressable
                key={step.id}
                onPress={() =>
                  handleToggle(routine.id, step.id, step.completed)
                }
                className="flex-row items-center py-2.5"
                style={{
                  borderBottomWidth: idx < routine.steps.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                }}
              >
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: step.completed
                      ? sectionColor
                      : "transparent",
                    borderWidth: step.completed ? 0 : 1,
                    borderColor: theme.border,
                  }}
                >
                  {step.completed ? (
                    <Check size={13} color="#fff" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: theme.muted,
                      }}
                    >
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <Text
                  className="text-sm flex-1"
                  style={{
                    color: step.completed ? theme.muted : theme.foreground,
                    textDecorationLine: step.completed
                      ? "line-through"
                      : "none",
                    fontWeight: step.completed ? "400" : "500",
                  }}
                >
                  {step.productName}
                </Text>
              </Pressable>
            ))}
        </Card>
      );
    });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className="text-2xl font-bold"
          style={{ color: theme.foreground }}
        >
          Today
        </Text>
        <Pressable
          onPress={() => router.push("/(main)/routine-builder")}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Plus size={18} color="#fff" />
        </Pressable>
      </View>
      <Text className="text-sm mb-5" style={{ color: theme.muted }}>
        {routines.length > 0
          ? "Tap a step to mark it done."
          : "Build your first routine to get started."}
      </Text>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : routines.length === 0 ? (
        <Card
          className="p-5 items-center"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Text
            className="text-sm text-center mb-4"
            style={{ color: theme.muted }}
          >
            You don&apos;t have any routines yet. Start with a simple morning or
            evening routine.
          </Text>
          <Pressable
            onPress={() => router.push("/(main)/routine-builder")}
            className="rounded-xl py-3 px-5"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="text-white font-medium text-sm">
              Create a routine
            </Text>
          </Pressable>
        </Card>
      ) : (
        <>
          {morningRoutines.length > 0 && (
            <>
              <SectionHeader
                label="Morning"
                color={morningColor}
                count={morningRoutines.reduce((s, r) => s + r.steps.length, 0)}
              />
              {renderRoutineGroup(morningRoutines, morningColor)}
            </>
          )}

          {eveningRoutines.length > 0 && (
            <>
              <SectionHeader
                label="Evening"
                color={eveningColor}
                count={eveningRoutines.reduce((s, r) => s + r.steps.length, 0)}
              />
              {renderRoutineGroup(eveningRoutines, eveningColor)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
