import React, { useState } from "react";
import { View, Pressable, Modal, Alert } from "react-native";
import { Text } from "./ui/Text";
import * as Clipboard from "expo-clipboard";
import { Bookmark, Copy, Flag, Trash2, X } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { toggleBookmarkPost, reportPost, deletePost } from "../src/api/posts";

// Install: npx expo install expo-clipboard

interface Props {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postContent: string;
  isBookmarked: boolean;
  isOwnPost: boolean;
  theme: any;
  onBookmarkChange: (bookmarked: boolean) => void;
  onDeleted: () => void;
}

export function PostActionSheet({
  visible,
  onClose,
  postId,
  postContent,
  isBookmarked,
  isOwnPost,
  theme,
  onBookmarkChange,
  onDeleted,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleBookmark = async () => {
    // Optimistic — same pattern as the like button elsewhere in the app.
    onBookmarkChange(!isBookmarked);
    onClose();
    try {
      await toggleBookmarkPost(postId);
    } catch {
      onBookmarkChange(isBookmarked); // revert on failure
      Toast.show({ type: "error", text1: "Could not update bookmark" });
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(postContent);
    onClose();
    Toast.show({ type: "success", text1: "Copied to clipboard" });
  };

  const handleReport = () => {
    onClose();
    Alert.alert(
      "Report this post?",
      "Let us know if this post breaks community guidelines.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await reportPost(postId);
              Toast.show({
                type: "success",
                text1: result.alreadyReported
                  ? "You already reported this post"
                  : "Reported — thanks for letting us know",
              });
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: err.message || "Could not submit report",
              });
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    onClose();
    Alert.alert(
      "Delete post?",
      "This can't be undone. Any photos on this post will also be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await deletePost(postId);
              onDeleted();
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: err.message || "Could not delete post",
              });
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            marginTop: "auto",
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 10,
            paddingBottom: 28,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.border,
              alignSelf: "center",
              marginBottom: 8,
            }}
          />

          <ActionRow
            icon={
              <Bookmark
                size={19}
                color={theme.foreground}
                fill={isBookmarked ? theme.foreground : "transparent"}
              />
            }
            label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            onPress={handleBookmark}
            theme={theme}
          />
          <ActionRow
            icon={<Copy size={19} color={theme.foreground} />}
            label="Copy text"
            onPress={handleCopy}
            theme={theme}
          />
          <ActionRow
            icon={<Flag size={19} color={theme.foreground} />}
            label="Report"
            onPress={handleReport}
            theme={theme}
          />
          {isOwnPost && (
            <ActionRow
              icon={<Trash2 size={19} color="#e5484d" />}
              label="Delete"
              labelColor="#e5484d"
              onPress={handleDelete}
              disabled={busy}
              theme={theme}
            />
          )}
          <ActionRow
            icon={<X size={19} color={theme.muted} />}
            label="Close"
            labelColor={theme.muted}
            onPress={onClose}
            theme={theme}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionRow({
  icon,
  label,
  labelColor,
  onPress,
  disabled,
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
  disabled?: boolean;
  theme: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 24,
        paddingVertical: 14,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon}
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: labelColor || theme.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}