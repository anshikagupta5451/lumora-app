import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart, Users, PenSquare, MessageCircle, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import { CategoryPill } from "../../../components/CategoryPill";
import { useTheme } from "../../../src/theme/ThemeContext";
import {
  getPosts,
  createPost,
  toggleLikePost,
  Post,
} from "../../../src/api/posts";
import { Avatar } from "@/components/Avatar";

const categories = [
  "All",
  "General",
  "Products",
  "My Story",
  "Study Hub",
  "Challenges",
];

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await getPosts(activeCategory));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await createPost({
        title: title.trim() || undefined,
        content: text.trim(),
        category: selectedCategory,
      });
      setText("");
      setTitle("");
      setComposing(false);
      load();
    } catch (err: any) {
      Toast.show({ type: "error", text1: err.message || "Could not post" });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
              likedByMe: !p.likedByMe,
            }
          : p,
      ),
    );
    try {
      await toggleLikePost(id);
    } catch {
      load();
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
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <Users size={18} color={theme.primary} />
          </View>
          <Text
            className="text-2xl font-bold"
            style={{ color: theme.foreground }}
          >
            Community
          </Text>
        </View>
        <Pressable
          onPress={() => setComposing(true)}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <PenSquare size={16} color="#fff" />
        </Pressable>
      </View>

      <View style={{ height: 44 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View className="px-4 items-center py-10">
          <Text className="text-sm text-center" style={{ color: theme.muted }}>
            No posts here yet — be the first to share something.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="px-4"
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-4 mb-3"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.border,
              }}
            >
              <Pressable onPress={() => router.push(`/(main)/post/${post.id}`)}>
                <View className="flex-row items-center gap-2 mb-2">
                  <Avatar name={post.authorName} size={32} />
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: theme.foreground }}
                    >
                      {post.authorName}
                    </Text>
                    <Text className="text-xs" style={{ color: theme.muted }}>
                      {timeAgo(post.createdAt)}
                    </Text>
                  </View>
                </View>

                {post.title && (
                  <Text
                    className="text-base font-bold mb-1"
                    style={{ color: theme.foreground }}
                  >
                    {post.title}
                  </Text>
                )}
                <Text
                  className="text-sm leading-5 mb-3"
                  numberOfLines={4}
                  style={{ color: theme.foreground }}
                >
                  {post.content}
                </Text>
              </Pressable>

              <View className="flex-row items-center justify-between">
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: theme.primaryLight }}
                >
                  <Text
                    className="text-[10px] font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {post.category}
                  </Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <Pressable
                    onPress={() => handleLike(post.id)}
                    hitSlop={8}
                    className="flex-row items-center gap-1.5"
                  >
                    <Heart
                      size={14}
                      color={theme.primary}
                      fill={post.likedByMe ? theme.primary : "transparent"}
                    />
                    <Text className="text-xs" style={{ color: theme.muted }}>
                      {post.likes}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/(main)/post/${post.id}`)}
                    hitSlop={8}
                    className="flex-row items-center gap-1.5"
                  >
                    <MessageCircle size={14} color={theme.muted} />
                    <Text className="text-xs" style={{ color: theme.muted }}>
                      {post.commentCount}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Compose modal */}
      <Modal
        visible={composing}
        animationType="slide"
        transparent
        onRequestClose={() => setComposing(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View
            className="rounded-t-3xl p-5"
            style={{
              backgroundColor: theme.background,
              paddingBottom: insets.bottom + 16,
              maxHeight: "85%",
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.foreground }}
              >
                New post
              </Text>
              <Pressable onPress={() => setComposing(false)}>
                <X size={20} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView>
              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted }}
              >
                Category
              </Text>
              <View style={{ height: 44 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((cat) => (
                      <CategoryPill
                        key={cat}
                        label={cat}
                        active={selectedCategory === cat}
                        onPress={() => setSelectedCategory(cat)}
                      />
                    ))}
                </ScrollView>
              </View>
              <TextInput
                className="rounded-xl px-3.5 py-3 text-sm mt-3"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                }}
                placeholder="Title (optional)"
                placeholderTextColor={theme.muted}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                className="rounded-xl px-3.5 py-3 text-sm mt-3"
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.foreground,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="Share something with the community..."
                placeholderTextColor={theme.muted}
                value={text}
                onChangeText={setText}
                multiline
              />
              <Pressable
                onPress={handlePost}
                disabled={posting || !text.trim()}
                className="rounded-xl py-3 items-center mt-3"
                style={{
                  backgroundColor:
                    !text.trim() || posting
                      ? theme.primaryLight
                      : theme.primary,
                }}
              >
                <Text className="text-white text-sm font-semibold">
                  {posting ? "Posting..." : "Post"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
