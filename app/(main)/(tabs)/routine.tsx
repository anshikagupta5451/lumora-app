import React from 'react'
import { View, Text } from 'react-native'

export default function RoutineScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="text-foreground text-base font-medium">Routine tracker coming next</Text>
      <Text className="text-muted-foreground text-sm text-center mt-2">
        Morning/evening checklist, streaks, and product logging will live here.
      </Text>
    </View>
  )
}