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
  ChevronDown,
  Heart,
  Send,
  ArrowDown,
  MessageCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { CommentThread } from "../../../components/CommentThread";
import { PostImageGallery } from "../../../components/PhotoImageGallary";
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
  const [replyAnonymously, setReplyAnonymously] = useState(false);
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
        replyAnonymously,
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      setReplyingTo(null);
      setReplyAnonymously(false);
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
          paddingTop: insets.top + 12,
          paddingBottom: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.card,
        }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.background,
            }}
          >
            <ChevronLeft size={19} color={theme.foreground} />
          </Pressable>

          <Pressable
            onPress={() => router.push(`/(main)/user/${post.userId}`)}
            className="flex-row items-center gap-3"
            style={{ flex: 1 }}
          >
            <Avatar name={post.authorName} size={36} />

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 14,
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {post.authorName}
              </Text>
              <View className="flex-row items-center gap-2 mt-0.5">
                <View
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    backgroundColor: theme.primaryLight,
                  }}
                >
                  <Text
                    style={{
                      color: theme.primary,
                      fontSize: 9,
                      fontWeight: "700",
                    }}
                  >
                    {post.category}
                  </Text>
                </View>
                <Text style={{ color: theme.muted, fontSize: 11 }}>
                  {timeAgo(post.createdAt)} ago
                </Text>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={handleLike}
            hitSlop={10}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 16,
              backgroundColor: post.likedByMe
                ? theme.primaryLight
                : theme.background,
            }}
          >
            <Heart
              size={16}
              color={theme.primary}
              fill={post.likedByMe ? theme.primary : "transparent"}
            />
            <Text
              style={{ color: theme.primary, fontSize: 13, fontWeight: "700" }}
            >
              {post.likes}
            </Text>
          </Pressable>
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
              marginTop: 18,
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
            opacity: 0.9,
            marginBottom: post.images && post.images.length > 0 ? 16 : 22,
          }}
        >
          {post.content}
        </Text>

        {post.images && post.images.length > 0 && (
          <PostImageGallery images={post.images} variant="detail" />
        )}

        <View
          className="flex-row items-center justify-between"
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.border,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingVertical: 12,
            marginBottom: 18,
          }}
        >
          <View className="flex-row items-center gap-1.5">
            <Text
              style={{
                color: theme.foreground,
                fontSize: 13,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: 0.4,
              }}
            >
              All comments
            </Text>
            <View
              style={{
                borderRadius: 999,
                paddingHorizontal: 6,
                paddingVertical: 1,
                backgroundColor: theme.primaryLight,
              }}
            >
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 11,
                  fontWeight: "700",
                }}
              >
                {comments.length}
              </Text>
            </View>
            <ChevronDown size={14} color={theme.muted} />
          </View>
          <Pressable
            className="flex-row items-center gap-1"
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{ color: theme.muted, fontSize: 12, fontWeight: "600" }}
            >
              Date
            </Text>
            <ArrowDown size={12} color={theme.muted} />
          </Pressable>
        </View>

        {topLevelComments.length === 0 ? (
          <View className="items-center py-8">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <MessageCircle size={16} color={theme.primary} />
            </View>
            <Text
              className="text-xs text-center"
              style={{ color: theme.muted }}
            >
              No replies yet — be the first.
            </Text>
          </View>
        ) : (
          topLevelComments.map((c, i) => (
            <View
              key={c.id}
              className="mb-4 pb-4"
              style={
                i < topLevelComments.length - 1
                  ? { borderBottomWidth: 1, borderBottomColor: theme.border }
                  : undefined
              }
            >
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
          <View
            className="flex-row items-center justify-between mb-2 px-3 py-1.5"
            style={{ backgroundColor: theme.primaryLight, borderRadius: 999 }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: theme.primary }}
            >
              Replying to {replyingTo.name}
            </Text>
            <Pressable onPress={() => setReplyingTo(null)} hitSlop={6}>
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.primary }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          onPress={() => setReplyAnonymously(!replyAnonymously)}
          className="self-start flex-row items-center gap-1.5 mb-2 px-2.5 py-1"
          style={{
            borderRadius: 999,
            backgroundColor: replyAnonymously
              ? theme.primaryLight
              : "transparent",
          }}
        >
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: theme.primary,
              backgroundColor: replyAnonymously ? theme.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {replyAnonymously && (
              <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>
                ✓
              </Text>
            )}
          </View>
          <Text
            style={{
              color: replyAnonymously ? theme.primary : theme.muted,
              fontSize: 12,
              fontWeight: replyAnonymously ? "600" : "400",
            }}
          >
            Reply anonymously
          </Text>
        </Pressable>

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
