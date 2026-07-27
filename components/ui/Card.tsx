import React from 'react'
import { View } from 'react-native'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-2xl border border-border bg-card ${className}`}>{children}</View>
}