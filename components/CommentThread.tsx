import React, { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useTheme } from "../src/theme/ThemeContext";
import { Comment } from "../src/api/posts";
import { Avatar } from "./Avatar";

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
      style={{ marginLeft: depth > 0 ? 16 : 0, marginTop: depth > 0 ? 10 : 0 }}
    >
      <View
        style={
          depth > 0
            ? {
                borderLeftWidth: 2,
                borderLeftColor: theme.border,
                paddingLeft: 12,
              }
            : undefined
        }
      >
        <View className="flex-row items-center gap-2 mb-1">
          <Avatar name={comment.authorName} size={24} />
          <Text
            className="text-xs font-semibold flex-1"
            style={{ color: theme.foreground }}
          >
            {comment.authorName}
          </Text>
          <Text className="text-[10px]" style={{ color: theme.muted }}>
            {timeAgo(comment.createdAt)}
          </Text>
        </View>
        <Text
          className="text-xs leading-4 mb-1.5"
          style={{ color: theme.muted }}
        >
          {comment.content}
        </Text>
        <Pressable onPress={() => onReply(comment.id, comment.authorName)}>
          <Text
            className="text-[11px] font-medium"
            style={{ color: theme.primary }}
          >
            Reply
          </Text>
        </Pressable>
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
