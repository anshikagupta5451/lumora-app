import React from 'react'
import { View, Text } from 'react-native'
import { Star, ShieldCheck } from 'lucide-react-native'
import { Card } from './ui/Card'
import { Review } from '../src/api/reviews'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="p-4 mb-3">
      <View className="flex-row justify-between items-start mb-1.5">
        <View className="flex-1 pr-2">
          <Text className="text-[11px] text-muted-foreground uppercase">{review.brand}</Text>
          <Text className="text-sm font-semibold text-foreground">{review.product}</Text>
        </View>
        <View className="flex-row items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} color="#C97B63" fill={i < review.rating ? '#C97B63' : 'transparent'} />
          ))}
        </View>
      </View>

      <Text className="text-sm font-medium text-foreground mt-2">{review.title}</Text>
      <Text className="text-xs text-muted-foreground mt-1 leading-5">{review.review}</Text>

      <View className="flex-row flex-wrap mt-3 gap-1.5">
        {review.skinType ? (
          <View className="bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1">
            <Text className="text-[10px] text-primary font-medium">{review.skinType} skin</Text>
          </View>
        ) : null}
        {review.concerns.map((c) => (
          <View key={c} className="bg-card border border-border rounded-full px-2.5 py-1">
            <Text className="text-[10px] text-muted-foreground font-medium">{c}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
        <Text className="text-[11px] text-muted-foreground">{review.reviewer}</Text>
        {review.verified && (
          <View className="flex-row items-center gap-1">
            <ShieldCheck size={12} color="#8A7A72" />
            <Text className="text-[10px] text-muted-foreground">Verified</Text>
          </View>
        )}
      </View>
    </Card>
  )
}