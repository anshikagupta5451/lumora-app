import React from 'react'
import { View } from "react-native";
import { Text } from "./ui/Text";

const avatarColors = [
  '#F97316', '#8B5CF6', '#0EA5E9', '#10B981',
  '#F59E0B', '#EC4899', '#6366F1', '#14B8A6',
]

function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const color = colorForName(name || '?')
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}25`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontSize: size * 0.38, fontWeight: '800' }}>
        {initials}
      </Text>
    </View>
  )
}