import React, { useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import { Trash2, Pencil } from "lucide-react-native";
import { Text, TextInput } from "./ui/Text";
import { CheckIn } from "../src/api/checkins";
import { getMood, MoodPicker } from "./MoodPicker";

// A note beyond this length gets clamped to 3 lines with a "Show more" toggle
// instead of pushing the rest of the journal down.
const NOTE_TRUNCATE_LENGTH = 140;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeDate(dateStr: string) {
  const d = new Date(dateStr);
  const startOfDay = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };
  const diffDays = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(d).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateStr);
}

export function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function CheckInRow({
  entry,
  theme,
  showBorder,
  onDelete,
  onEdit,
}: {
  entry: CheckIn;
  theme: any;
  showBorder: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: { mood: number; note: string }) => Promise<void> | void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMood, setEditMood] = useState(entry.mood);
  const [editNote, setEditNote] = useState(entry.note || "");
  const [saving, setSaving] = useState(false);

  const mood = getMood(entry.mood);
  const isLong = (entry.note?.length || 0) > NOTE_TRUNCATE_LENGTH;
  const editable = Boolean(onEdit) && isToday(entry.createdAt);

  const confirmDelete = () => {
    Alert.alert("Delete this check-in?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(entry.id),
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onEdit?.(entry.id, { mood: editMood, note: editNote.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <View
        className="py-3"
        style={{
          borderBottomWidth: showBorder ? 1 : 0,
          borderBottomColor: theme.border,
        }}
      >
        <MoodPicker value={editMood} onChange={setEditMood} />
        <TextInput
          className="rounded-xl px-3.5 py-3 text-sm mt-3"
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
            color: theme.foreground,
          }}
          placeholder="Anything you want to note? (optional)"
          placeholderTextColor={theme.muted}
          value={editNote}
          onChangeText={setEditNote}
        />
        <View className="flex-row gap-2 mt-3">
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 items-center"
            style={{
              backgroundColor: saving ? theme.primaryLight : theme.primary,
            }}
          >
            <Text className="text-white text-sm font-semibold">
              {saving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setEditMood(entry.mood);
              setEditNote(entry.note || "");
              setEditing(false);
            }}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 items-center"
            style={{ borderWidth: 1, borderColor: theme.border }}
          >
            <Text className="text-sm font-medium" style={{ color: theme.muted }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-row py-3"
      style={{
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: theme.border,
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${mood.color}26` }}
      >
        <Text style={{ fontSize: 18 }}>{mood.emoji}</Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className="text-sm font-semibold"
            style={{ color: theme.foreground }}
          >
            {mood.label}
          </Text>
          <Text className="text-xs" style={{ color: theme.muted }}>
            {formatRelativeDate(entry.createdAt)}
          </Text>
        </View>

        {entry.note ? (
          <>
            <Text
              className="text-sm leading-5"
              style={{ color: theme.muted }}
              numberOfLines={expanded ? undefined : 3}
            >
              {entry.note}
            </Text>
            {isLong && (
              <Pressable onPress={() => setExpanded((v) => !v)}>
                <Text
                  className="text-xs font-medium mt-1"
                  style={{ color: theme.primary }}
                >
                  {expanded ? "Show less" : "Show more"}
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <Text className="text-sm italic" style={{ color: theme.muted }}>
            No notes for this check-in.
          </Text>
        )}

        {entry.images?.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {entry.images.map((uri, index) => (
              <Image
                key={`${entry.id}-${uri}`}
                source={{ uri }}
                accessibilityLabel={`Check-in photo ${index + 1}`}
                style={{ width: 76, height: 76, borderRadius: 12, backgroundColor: theme.background }}
              />
            ))}
          </View>
        ) : null}
      </View>

      {editable && (
        <Pressable onPress={() => setEditing(true)} className="pl-2 pt-0.5">
          <Pencil size={15} color={theme.muted} />
        </Pressable>
      )}
      {onDelete && (
        <Pressable onPress={confirmDelete} className="pl-2 pt-0.5">
          <Trash2 size={15} color={theme.muted} />
        </Pressable>
      )}
    </View>
  );
}
