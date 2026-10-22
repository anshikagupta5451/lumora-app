import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "./ui/Text";
import { useTheme } from "../src/theme/ThemeContext";
import { Comment } from "../src/api/posts";
import { Avatar } from "./Avatar";
import { router } from "expo-router";

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

interface Props {
  comment: Comment;
  allComments: Comment[];
  depth: number;
  onReply: (parentId: string, authorName: string) => void;
}

export function CommentThread({ comment, allComments, depth, onReply }: Props) {
  const { theme } = useTheme();
  const replies = allComments.filter((c) => c.parentCommentId === comment.id);

  return (
    <View
      style={{ marginLeft: depth > 0 ? 14 : 0, marginTop: depth > 0 ? 12 : 0 }}
    >
      <View
        style={
          depth > 0
            ? {
                borderLeftWidth: 2,
                borderLeftColor: theme.primaryLight,
                paddingLeft: 12,
              }
            : undefined
        }
      >
        <View className="flex-row items-start gap-2 mb-1.5">
          {comment.authorId ? (
            <Pressable
              onPress={() => router.push(`/(main)/user/${comment.authorId}`)}
            >
              <Avatar name={comment.authorName} size={26} />
            </Pressable>
          ) : (
            <Avatar name={comment.authorName} size={26} />
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.foreground }}
              >
                {comment.authorName}
              </Text>
              <View
                style={{
                  width: 2.5,
                  height: 2.5,
                  borderRadius: 1.5,
                  backgroundColor: theme.muted,
                }}
              />
              <Text className="text-[13px]" style={{ color: theme.muted }}>
                {timeAgo(comment.createdAt)} ago
              </Text>
            </View>
            <Text
              className="text-xs leading-4 mt-1"
              style={{ color: theme.foreground, opacity: 0.85 }}
            >
              {comment.content}
            </Text>
            <Pressable
              onPress={() => onReply(comment.id, comment.authorName)}
              hitSlop={6}
              className="self-start rounded-full px-2.5 py-1 mt-2"
              style={{ backgroundColor: theme.primaryLight }}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: theme.primary }}
              >
                Reply
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {replies.map((reply) => (
        <CommentThread
          key={reply.id}
          comment={reply}
          allComments={allComments}
          depth={depth + 1}
          onReply={onReply}
        />
      ))}
    </View>
  );
}