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
import {
  Heart,
  Users,
  PenSquare,
  MessageCircle,
  X,
  Sparkles,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import { CategoryPill } from "../../../components/CategoryPill";
import { ImagePickerRow } from "../../../components/ImagePickerRow";
import { PostImageGallery } from "../../../components/PhotoImageGallary";
import { useTheme } from "../../../src/theme/ThemeContext";
import {
  getPosts,
  createPost,
  toggleLikePost,
  uploadPostImages,
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

// Small pill used for like / comment counts in the engagement row.
function StatPill({
  icon,
  count,
  active,
  onPress,
  theme,
}: {
  icon: React.ReactNode;
  count: number;
  active?: boolean;
  onPress?: () => void;
  theme: any;
}) {
  const content = (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
      style={{
        backgroundColor: active ? theme.primaryLight : theme.background,
        borderWidth: 1,
        borderColor: active ? theme.primaryLight : theme.border,
      }}
    >
      {icon}
      <Text
        className="text-xs font-semibold"
        style={{ color: active ? theme.primary : theme.muted }}
      >
        {count}
      </Text>
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} hitSlop={8}>
      {content}
    </Pressable>
  ) : (
    content
  );
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
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const resetComposer = () => {
    setText("");
    setTitle("");
    setImageUris([]);
    setComposing(false);
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      let uploadedUrls: string[] = [];
      if (imageUris.length > 0) {
        setUploadingImages(true);
        uploadedUrls = await uploadPostImages(imageUris);
        setUploadingImages(false);
      }

      await createPost({
        title: title.trim() || undefined,
        content: text.trim(),
        category: selectedCategory,
        images: uploadedUrls,
      });
      resetComposer();
      load();
    } catch (err: any) {
      setUploadingImages(false);
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
        <View className="px-4 items-center py-16">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: theme.primaryLight }}
          >
            <Sparkles size={20} color={theme.primary} />
          </View>
          <Text
            className="text-sm font-semibold text-center mb-1"
            style={{ color: theme.foreground }}
          >
            Nothing here yet
          </Text>
          <Text className="text-xs text-center" style={{ color: theme.muted }}>
            Be the first to share something in this category.
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
                <View className="flex-row items-center gap-2.5 mb-3">
                  <Avatar name={post.authorName} size={34} />
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.foreground }}
                        numberOfLines={1}
                      >
                        {post.authorName}
                      </Text>
                      <View
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: theme.muted,
                        }}
                      />
                      <Text className="text-xs" style={{ color: theme.muted }}>
                        {timeAgo(post.createdAt)} ago
                      </Text>
                    </View>
                  </View>
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
                </View>

                {post.title && (
                  <Text
                    className="text-[15px] font-bold mb-1.5"
                    style={{ color: theme.foreground }}
                  >
                    {post.title}
                  </Text>
                )}
                <Text
                  className="text-sm leading-5 mb-3"
                  numberOfLines={3}
                  style={{ color: theme.foreground, opacity: 0.85 }}
                >
                  {post.content}
                </Text>

                {post.images && post.images.length > 0 && (
                  <PostImageGallery images={post.images} variant="feed" />
                )}
              </Pressable>

              <View
                className="flex-row items-center gap-2 pt-3"
                style={{ borderTopWidth: 1, borderTopColor: theme.border }}
              >
                <StatPill
                  theme={theme}
                  active={post.likedByMe}
                  count={post.likes}
                  onPress={() => handleLike(post.id)}
                  icon={
                    <Heart
                      size={13}
                      color={post.likedByMe ? theme.primary : theme.muted}
                      fill={post.likedByMe ? theme.primary : "transparent"}
                    />
                  }
                />
                <StatPill
                  theme={theme}
                  count={post.commentCount}
                  onPress={() => router.push(`/(main)/post/${post.id}`)}
                  icon={<MessageCircle size={13} color={theme.muted} />}
                />
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
              maxHeight: "88%",
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.border,
                alignSelf: "center",
                marginBottom: 14,
              }}
            />
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.foreground }}
              >
                New post
              </Text>
              <Pressable
                onPress={() => setComposing(false)}
                hitSlop={8}
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.card }}
              >
                <X size={16} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView>
              <Text
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: theme.muted, letterSpacing: 0.5 }}
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

              <ImagePickerRow
                uris={imageUris}
                onChange={setImageUris}
                theme={theme}
              />

              <Pressable
                onPress={handlePost}
                disabled={posting || !text.trim()}
                className="rounded-xl py-3 items-center mt-4"
                style={{
                  backgroundColor:
                    !text.trim() || posting
                      ? theme.primaryLight
                      : theme.primary,
                }}
              >
                <Text className="text-white text-sm font-semibold">
                  {uploadingImages
                    ? "Uploading photos..."
                    : posting
                      ? "Posting..."
                      : "Post"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
