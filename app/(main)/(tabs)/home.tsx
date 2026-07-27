import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { Cloud, Sun, ThumbsUp, ThumbsDown } from 'lucide-react-native'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { useAuthStore } from '../../../src/store/useAuthStore'

// TODO: replace with real API call to GET /recommendations/latest + /weather/current
const mockBrief = {
  weather: { temp: 31, condition: 'Humid', uvIndex: 7 },
  skinType: 'Combination, oily T-zone',
  recommendation: {
    productName: 'Niacinamide 10% Serum',
    reason: 'High UV index today plus your reported oiliness makes a lightweight, oil-controlling serum a better fit than your usual richer moisturizer.',
  },
  routineProgress: { completed: 2, total: 4 },
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user)

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-10">
      <Text className="text-xs text-muted-foreground">Good morning{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</Text>
      <Text className="text-2xl font-bold text-foreground mt-1">Your AI Beauty Brief</Text>

      {/* Weather + UV context */}
      <Card className="mt-4 p-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Sun size={20} color="#C97B63" />
          <View>
            <Text className="text-sm font-medium text-foreground">{mockBrief.weather.temp}°C · {mockBrief.weather.condition}</Text>
            <Text className="text-[11px] text-muted-foreground">UV Index {mockBrief.weather.uvIndex} — high</Text>
          </View>
        </View>
        <Badge className="bg-primary/10 border border-primary/30">{mockBrief.skinType}</Badge>
      </Card>

      {/* Main recommendation */}
      <Card className="mt-4 p-4">
        <Text className="text-xs font-medium text-primary mb-1">TODAY&apos;S RECOMMENDATION</Text>
        <Text className="text-lg font-semibold text-foreground">{mockBrief.recommendation.productName}</Text>
        <Text className="text-sm text-muted-foreground mt-2 leading-5">{mockBrief.recommendation.reason}</Text>

        <View className="flex-row gap-2 mt-4">
          <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary/10 rounded-lg py-2.5">
            <ThumbsUp size={14} color="#C97B63" />
            <Text className="text-primary text-xs font-medium">Helpful</Text>
          </Pressable>
          <Pressable className="flex-1 flex-row items-center justify-center gap-1.5 border border-border rounded-lg py-2.5">
            <ThumbsDown size={14} color="#8A7A72" />
            <Text className="text-muted-foreground text-xs font-medium">Not for me</Text>
          </Pressable>
        </View>
      </Card>

      {/* Routine progress teaser */}
      <Card className="mt-4 p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-semibold text-foreground">Today&apos;s routine</Text>
          <Text className="text-xs text-muted-foreground">
            {mockBrief.routineProgress.completed}/{mockBrief.routineProgress.total} done
          </Text>
        </View>
        <View className="h-2 bg-border rounded-full overflow-hidden">
          <View
            className="h-2 bg-primary rounded-full"
            style={{ width: `${(mockBrief.routineProgress.completed / mockBrief.routineProgress.total) * 100}%` }}
          />
        </View>
      </Card>
    </ScrollView>
  )
}