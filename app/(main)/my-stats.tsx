import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { X, Zap } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Card } from '../../components/ui/Card'
import { useTheme } from '../../src/theme/ThemeContext'
import { getMyStats, UserStats } from '../../src/api/checkins'

function StatCard({ value, label, theme }: { value: number; label: string; theme: any }) {
  return (
    <Card className="flex-1 items-center py-5" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <Text className="text-3xl font-bold" style={{ color: theme.foreground }}>{value}</Text>
      <Text className="text-xs text-center mt-1" style={{ color: theme.muted }}>{label}</Text>
    </Card>
  )
}

function StatRow({ label, value, theme }: { label: string; value: number; theme: any }) {
  return (
    <View className="flex-row items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <Text className="text-sm font-medium" style={{ color: theme.foreground }}>{label}</Text>
      <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>{value}</Text>
    </View>
  )
}

export default function MyStatsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyStats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false))
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <View style={{ width: 32 }} />
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: theme.card }}>
          <X size={18} color={theme.muted} />
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : !stats ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-sm text-center" style={{ color: theme.muted }}>Could not load your stats.</Text>
        </View>
      ) : (
        <View className="px-4 flex-1">
          <View className="items-center mt-4 mb-8">
            <View className="flex-row items-center gap-2 mb-1">
              <Zap size={32} color={theme.accent} fill={stats.streak > 0 ? theme.accent : 'transparent'} />
              <Text className="text-5xl font-bold" style={{ color: theme.foreground }}>{stats.streak}</Text>
            </View>
            <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.muted }}>
              Day streak!
            </Text>
          </View>

          <Text className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: theme.muted }}>
            Your journey
          </Text>
          <View className="flex-row gap-3 mb-8">
            <StatCard value={stats.totalCheckIns} label="Total check-ins" theme={theme} />
            <StatCard value={stats.reviewsWritten} label="Reviews written" theme={theme} />
          </View>

          <Text className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: theme.muted }}>
            Products
          </Text>
          <Card className="px-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <StatRow label="Opened" value={stats.productsOpened} theme={theme} />
            <StatRow label="All tracked" value={stats.productsTracked} theme={theme} />
          </Card>
        </View>
      )}
    </View>
  )
}