import React, { useEffect, useState } from 'react'
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Text } from "../../components/ui/Text";
import { useRouter } from 'expo-router'
import { ChevronLeft, Heart, MessageCircle, FileText } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Card } from '../../components/ui/Card'
import { useTheme } from '../../src/theme/ThemeContext'
import { getMyPosts, Post } from '../../src/api/posts'

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function MyPostsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyPosts().then(setPosts).catch(() => setPosts([])).finally(() => setLoading(false))
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-3">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 mb-4">
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>Back</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
            <FileText size={18} color={theme.primary} />
          </View>
          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>My Posts</Text>
        </View>
      </View>

      {loading ? (
        <View className="items-center py-16">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View className="px-4 items-center py-10">
          <Text className="text-sm text-center" style={{ color: theme.muted }}>
            You haven&lsquo;t posted anything yet.
          </Text>
        </View>
      ) : (
        <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {posts.map((post) => (
            <Pressable key={post.id} onPress={() => router.push(`/(main)/post/${post.id}`)}>
              <Card className="p-4 mb-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                {post.title && (
                  <Text className="text-base font-bold mb-1" style={{ color: theme.foreground }}>{post.title}</Text>
                )}
                <Text className="text-sm leading-5 mb-3" numberOfLines={3} style={{ color: theme.foreground }}>
                  {post.content}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: theme.primaryLight }}>
                    <Text className="text-[13px] font-semibold" style={{ color: theme.primary }}>{post.category}</Text>
                  </View>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <Heart size={13} color={theme.primary} fill={post.likedByMe ? theme.primary : 'transparent'} />
                      <Text className="text-xs" style={{ color: theme.muted }}>{post.likes}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <MessageCircle size={13} color={theme.muted} />
                      <Text className="text-xs" style={{ color: theme.muted }}>{post.commentCount}</Text>
                    </View>
                    <Text className="text-[13px]" style={{ color: theme.muted }}>{timeAgo(post.createdAt)}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}