import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, Pressable } from "react-native";
import { Text } from "../../../components/ui/Text";
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Card } from '../../../components/ui/Card'
import { Avatar } from '../../../components/Avatar'
import { useTheme } from '../../../src/theme/ThemeContext'
import { getPublicProfile, PublicProfile } from '../../../src/api/users'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme } = useTheme()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublicProfile(id).then(setProfile).catch(() => setProfile(null)).finally(() => setLoading(false))
  }, [id])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1">
          <ChevronLeft size={18} color={theme.muted} />
          <Text className="text-sm" style={{ color: theme.muted }}>Back</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : !profile ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: theme.muted }}>Profile not found.</Text>
        </View>
      ) : (
        <View className="px-4">
          <View className="items-center mt-4 mb-6">
            <Avatar name={profile.name} size={72} />
            <Text style={{ color: theme.foreground, fontSize: 20, fontWeight: '800', marginTop: 10 }}>
              {profile.name}
            </Text>
            <Text style={{ color: theme.muted, fontSize: 14, marginTop: 2 }}>
              Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Text style={{ color: theme.foreground, fontSize: 22, fontWeight: '800' }}>{profile.postCount}</Text>
              <Text style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>Posts</Text>
            </Card>
            <Card className="flex-1 items-center py-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Text style={{ color: theme.foreground, fontSize: 22, fontWeight: '800' }}>{profile.reviewCount}</Text>
              <Text style={{ color: theme.muted, fontSize: 13, marginTop: 2 }}>Reviews</Text>
            </Card>
          </View>
        </View>
      )}
    </View>
  )
}