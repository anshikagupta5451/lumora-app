import React from 'react'
import { Pressable, Text } from 'react-native'

export function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-background border-border'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-muted-foreground'}`}>{label}</Text>
    </Pressable>
  )
}