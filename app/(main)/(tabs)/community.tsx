import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Heart, Users, PenSquare } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Card } from "../../../components/ui/Card";
import { useTheme } from "../../../src/theme/ThemeContext";
import { getPosts, createPost, likePost, Post } from "../../../src/api/posts";
import { PostCard } from "@/components/PostCard";

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await getPosts());
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await createPost(text.trim());
      setText("");
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
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
    );
    try {
      await likePost(id);
    } catch {
      load();
    }
  };

  useEffect(() => {
    const interval = setInterval(load, 10000); // refresh feed every 10s — new posts, updated like/comment counts
    return () => clearInterval(interval);
  }, [load]);

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
          onPress={() => setComposing(!composing)}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <PenSquare size={16} color="#fff" />
        </Pressable>
      </View>

      {composing && (
        <View className="px-4 pb-3">
          <Card
            className="p-3"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <TextInput
              className="text-sm"
              style={{
                color: theme.foreground,
                minHeight: 60,
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
              className="rounded-lg py-2.5 items-center mt-2"
              style={{
                backgroundColor:
                  !text.trim() || posting ? theme.primaryLight : theme.primary,
              }}
            >
              <Text className="text-white text-sm font-semibold">
                {posting ? "Posting..." : "Post"}
              </Text>
            </Pressable>
          </Card>
        </View>
      )}

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View className="px-4 items-center py-10">
          <Text className="text-sm text-center" style={{ color: theme.muted }}>
            No posts yet — be the first to share something!
          </Text>
        </View>
      ) : (
        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
