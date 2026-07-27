import React from 'react'
import { View, Text } from 'react-native'

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${className}`}>
      <Text className="text-[11px] text-primary">{children}</Text>
    </View>
  )
}