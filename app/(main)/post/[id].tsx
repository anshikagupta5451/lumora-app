import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Heart,
  Send,
  ChevronDown,
  ArrowDown,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import { CommentThread } from "../../../components/CommentThread";
import { useTheme } from "../../../src/theme/ThemeContext";
import {
  getPost,
  getComments,
  addComment,
  toggleLikePost,
  Post,
  Comment,
} from "../../../src/api/posts";
import { Avatar } from "@/components/Avatar";

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [posting, setPosting] = useState(false);
  const [liking, setLiking] = useState(false);

  const load = useCallback(async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        getPost(id),
        getComments(id),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const handleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    setPost({
      ...post,
      likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
      likedByMe: !post.likedByMe,
    });
    try {
      await toggleLikePost(post.id);
    } catch {
      load();
    } finally {
      setLiking(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const newComment = await addComment(
        id,
        commentText.trim(),
        replyingTo?.id,
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      setReplyingTo(null);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: err.message || "Could not post reply",
      });
    } finally {
      setPosting(false);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: theme.muted }}>Post not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Sticky header — back, author, like, all in one row */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.card,
        }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={22} color={theme.primary} />
          </Pressable>
          <Pressable onPress={handleLike} hitSlop={8} className="items-center">
            <Heart
              size={22}
              color={theme.primary}
              fill={post.likedByMe ? theme.primary : "transparent"}
            />
            <Text style={{ color: theme.muted, fontSize: 11, marginTop: 1 }}>
              {post.likes}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-2">
          <Avatar name={post.authorName} size={36} />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.foreground,
                fontSize: 14,
                fontWeight: "700",
              }}
            >
              {post.authorName}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: theme.primaryLight }}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 10,
                    fontWeight: "700",
                  }}
                >
                  {post.category}
                </Text>
              </View>
              <Text style={{ color: theme.muted, fontSize: 11 }}>
                {timeAgo(post.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {post.title && (
          <Text
            style={{
              color: theme.foreground,
              fontSize: 22,
              fontWeight: "800",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            {post.title}
          </Text>
        )}
        <Text
          style={{
            color: theme.foreground,
            fontSize: 15,
            lineHeight: 23,
            marginBottom: 20,
          }}
        >
          {post.content}
        </Text>

        <View
          className="flex-row items-center justify-between"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingVertical: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{ color: theme.foreground, fontSize: 14, fontWeight: "700" }}
          >
            All comments
          </Text>
          <Pressable className="flex-row items-center gap-1">
            <Text
              style={{ color: theme.muted, fontSize: 13, fontWeight: "600" }}
            >
              Date
            </Text>
            <ArrowDown size={13} color={theme.muted} />
          </Pressable>
        </View>

        {topLevelComments.length === 0 ? (
          <Text className="text-xs" style={{ color: theme.muted }}>
            No replies yet — be the first.
          </Text>
        ) : (
          topLevelComments.map((c) => (
            <View key={c.id} className="mb-4">
              <CommentThread
                comment={c}
                allComments={comments}
                depth={0}
                onReply={(parentId: string, name: string) =>
                  setReplyingTo({ id: parentId, name })
                }
              />
            </View>
          ))
        )}
      </ScrollView>

      <View
        className="px-4 py-3"
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom + 12,
          backgroundColor: theme.card,
        }}
      >
        {replyingTo && (
          <View className="flex-row items-center justify-between mb-2 px-1">
            <Text className="text-xs" style={{ color: theme.muted }}>
              Replying to {replyingTo.name}
            </Text>
            <Pressable onPress={() => setReplyingTo(null)}>
              <Text
                className="text-xs font-medium"
                style={{ color: theme.primary }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-full px-4 py-2.5 text-sm"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.background,
              color: theme.foreground,
            }}
            placeholder="Add a comment..."
            placeholderTextColor={theme.muted}
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable
            onPress={handleSendComment}
            disabled={posting || !commentText.trim()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor:
                !commentText.trim() || posting
                  ? theme.primaryLight
                  : theme.primary,
            }}
          >
            <Send size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
