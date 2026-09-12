import React, { useState, useEffect } from 'react'
import { View, Pressable, ActivityIndicator } from "react-native";
import { Text, TextInput } from "./ui/Text";
import { Heart, MessageCircle } from 'lucide-react-native'
import { Card } from './ui/Card'
import { useTheme } from '../src/theme/ThemeContext'
import { Post, Comment, getComments, addComment } from '../src/api/posts'

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const { theme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      setComments(await getComments(post.id))
    } catch {
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  // Poll for new comments every 8s while this post's thread is open — keeps replies "in sync"
  useEffect(() => {
    if (!expanded) return
    loadComments()
    const interval = setInterval(loadComments, 8000)
    return () => clearInterval(interval)
  }, [expanded, post.id])

  const handleToggleExpand = () => setExpanded((e) => !e)

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    setPosting(true)
    try {
      const newComment = await addComment(post.id, commentText.trim())
      setComments((prev) => [...prev, newComment])
      setCommentText('')
    } catch {
      // fail silently, user can retry
    } finally {
      setPosting(false)
    }
  }

  return (
    <Card className="p-4 mb-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>{post.authorName}</Text>
        <Text className="text-xs" style={{ color: theme.muted }}>{timeAgo(post.createdAt)}</Text>
      </View>
      <Text className="text-sm leading-5 mb-3" style={{ color: theme.foreground }}>{post.content}</Text>

      <View className="flex-row items-center gap-4">
        <Pressable onPress={() => onLike(post.id)} className="flex-row items-center gap-1.5">
          <Heart size={14} color={theme.primary} fill={post.likedByMe ? theme.primary : 'transparent'} />
          <Text className="text-xs" style={{ color: theme.muted }}>{post.likes}</Text>
        </Pressable>
        <Pressable onPress={handleToggleExpand} className="flex-row items-center gap-1.5">
          <MessageCircle size={14} color={theme.muted} />
          <Text className="text-xs" style={{ color: theme.muted }}>{post.commentCount}</Text>
        </Pressable>
      </View>

      {expanded && (
        <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
          {loadingComments && comments.length === 0 ? (
            <ActivityIndicator color={theme.primary} size="small" />
          ) : comments.length === 0 ? (
            <Text className="text-xs" style={{ color: theme.muted }}>No replies yet — be the first.</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} className="mb-2.5">
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text className="text-xs font-semibold" style={{ color: theme.foreground }}>{c.authorName}</Text>
                  <Text className="text-[13px]" style={{ color: theme.muted }}>{timeAgo(c.createdAt)}</Text>
                </View>
                <Text className="text-xs leading-4" style={{ color: theme.muted }}>{c.content}</Text>
              </View>
            ))
          )}

          <View className="flex-row items-center gap-2 mt-2">
            <TextInput
              className="flex-1 rounded-full px-3 py-2 text-xs"
              style={{ borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background, color: theme.foreground }}
              placeholder="Write a reply..."
              placeholderTextColor={theme.muted}
              value={commentText}
              onChangeText={setCommentText}
            />
            <Pressable
              onPress={handleAddComment}
              disabled={posting || !commentText.trim()}
              className="rounded-full px-3.5 py-2"
              style={{ backgroundColor: (!commentText.trim() || posting) ? theme.primaryLight : theme.primary }}
            >
              <Text className="text-white text-xs font-semibold">{posting ? '...' : 'Send'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  )
}